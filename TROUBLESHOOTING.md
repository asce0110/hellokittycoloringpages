# AI Kitty Creator - 故障排除指南

## 常见问题及解决方案

### 1. 提示词模板加载错误 (HTTP 500)

**错误信息**: "Error: HTTP error! status: 500" 在获取提示词模板时

**原因**: 数据库表 `prompt_templates` 不存在

**解决方案**:

1. **检查数据库连接**: 访问 `/api/test/database` 检查数据库状态
2. **运行数据库迁移**: 执行 `database-migrations.md` 中的SQL语句
3. **创建提示词模板表**:

```sql
CREATE TABLE prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template TEXT NOT NULL,
  style VARCHAR(50) NOT NULL,
  complexity VARCHAR(20) NOT NULL,
  category VARCHAR(100) DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  variables TEXT[] DEFAULT '{}',
  example_output TEXT,
  created_by UUID,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. AI 生成功能无法使用

**症状**: 点击生成按钮没有响应或报错

**检查列表**:
- [ ] 用户已登录
- [ ] 配置了 `OPENAI_API_KEY` 或 `STABILITY_AI_API_KEY`
- [ ] 输入了提示词内容
- [ ] 用户还有剩余生成次数

**环境变量检查**: 访问 `/api/test/database` 查看环境变量状态

### 3. 数据库连接问题

**症状**: 多个API返回 "Database not configured" 错误

**解决方案**:
1. 检查 `.env.local` 文件中的数据库配置:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```

2. 确保Supabase项目正常运行
3. 验证服务角色密钥有正确的权限

### 4. 管理员面板提示词模板为空

**症状**: AI Templates 标签页显示 "暂无提示词模板"

**解决方案**:
1. 运行数据库迁移创建表结构
2. 插入默认模板数据 (参考 `database-migrations.md`)
3. 或者通过管理面板手动创建模板

### 5. AI生成的图片无法显示

**症状**: 生成成功但图片显示不出来

**可能原因**:
- 图片URL过期 (OpenAI DALL-E图片有时效性)
- 网络连接问题
- 图片存储服务问题

**解决方案**:
- 配置Cloudflare R2存储以永久保存图片
- 检查网络连接
- 使用右键"在新标签页打开"测试图片URL

## 诊断工具

### 数据库状态检查
访问: `http://localhost:3000/api/test/database`

这个API会检查:
- 数据库连接状态
- 必需表是否存在
- 环境变量配置情况
- 提供修复建议

### 日志检查
开发模式下查看控制台输出:
- API错误日志
- 数据库查询错误
- 网络请求失败信息

## 开发建议

### 数据库开发流程
1. 使用 `database-migrations.md` 创建表结构
2. 插入默认数据
3. 测试API端点
4. 验证前端功能

### 环境配置
1. 复制 `.env.example` 为 `.env.local`
2. 配置所有必需的环境变量
3. 重启开发服务器

### 功能测试顺序
1. 数据库连接 → `/api/test/database`
2. 用户认证 → `/login`
3. 提示词模板 → `/admin` (AI Templates 标签)
4. AI生成 → `/create`

## 联系支持

如果问题仍未解决:
1. 检查控制台错误日志
2. 记录具体的错误信息
3. 提供环境配置信息 (不包含密钥)
4. 描述重现步骤