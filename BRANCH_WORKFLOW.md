# 分支管理和工作流程

## 分支结构

### 🔒 master (生产主干)
- **用途**: 生产环境代码，始终保持稳定
- **保护规则**: 
  - 禁止直接推送
  - 需要经过测试验证和用户同意才能合并
  - 仅通过Pull Request合并代码

### 🚀 develop (开发主分支)
- **用途**: 开发环境代码，集成所有功能
- **规则**: 
  - 所有开发工作在此分支或从此分支创建的功能分支上进行
  - 测试完成后可以合并到master

### 🌿 feature/* (功能分支)
- **用途**: 开发新功能或修复bug
- **命名规范**: 
  - `feature/功能名称`
  - `bugfix/问题描述`
  - `hotfix/紧急修复`

## 工作流程

### 开发新功能
1. 从develop分支创建功能分支
```bash
git checkout develop
git pull origin develop
git checkout -b feature/新功能名称
```

2. 开发并提交代码
```bash
git add .
git commit -m "feat: 添加新功能描述"
git push -u origin feature/新功能名称
```

3. 创建Pull Request到develop分支
4. 代码审查通过后合并到develop
5. 删除功能分支

### 部署到生产环境
1. 在develop分支进行充分测试
2. 测试通过且获得用户同意后，创建PR从develop到master
3. 合并到master分支
4. 部署生产环境

## Git命令参考

### 分支操作
```bash
# 查看所有分支
git branch -a

# 创建并切换分支
git checkout -b 分支名称

# 切换分支
git checkout 分支名称

# 删除本地分支
git branch -d 分支名称

# 删除远程分支
git push origin --delete 分支名称
```

### 同步操作
```bash
# 拉取最新代码
git pull origin 分支名称

# 推送到远程
git push origin 分支名称

# 推送并设置上游分支
git push -u origin 分支名称
```

## 重要提醒

⚠️ **严禁直接在master分支上开发**
⚠️ **master分支的任何更改都必须经过测试和用户同意**
⚠️ **定期从develop合并到功能分支，避免冲突**

## 当前分支状态

- ✅ master: 生产主干已创建并推送
- ✅ develop: 开发分支已创建并推送，包含完整项目代码
- 🔗 远程仓库: https://github.com/asce0110/hellokittycoloringpages.git

## 下一步操作

1. 在GitHub上设置分支保护规则
2. 为master分支启用Pull Request要求
3. 配置自动化测试和部署流程