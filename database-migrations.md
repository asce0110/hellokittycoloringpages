# Database Migrations for AI Kitty Creator

本文档包含AI Kitty Creator应用所需的数据库表结构和迁移SQL。

## 新增表结构

### 1. prompt_templates 表

用于存储AI生成的提示词模板，管理员可以在后台配置不同风格和难度的模板。

```sql
CREATE TABLE prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template TEXT NOT NULL,
  style VARCHAR(50) NOT NULL, -- classic, cute, simple, detailed
  complexity VARCHAR(20) NOT NULL, -- simple, medium, complex
  category VARCHAR(100) DEFAULT 'general', -- character, scene, object, etc.
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  variables TEXT[] DEFAULT '{}', -- JSON array of template variables like {character}, {setting}
  example_output TEXT,
  created_by UUID REFERENCES users(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_prompt_templates_active ON prompt_templates(is_active);
CREATE INDEX idx_prompt_templates_style ON prompt_templates(style);
CREATE INDEX idx_prompt_templates_complexity ON prompt_templates(complexity);
CREATE INDEX idx_prompt_templates_category ON prompt_templates(category);
```

### 2. 更新 generation_history 表

为现有的generation_history表添加新字段以支持模板功能：

```sql
-- 添加新列到现有表
ALTER TABLE generation_history 
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES prompt_templates(id),
ADD COLUMN IF NOT EXISTS final_prompt TEXT, -- AI使用的最终提示词
ADD COLUMN IF NOT EXISTS generations_today INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_generation_date DATE DEFAULT CURRENT_DATE;

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_generation_history_template ON generation_history(template_id);
CREATE INDEX IF NOT EXISTS idx_generation_history_user_date ON generation_history(user_id, last_generation_date);
```

### 3. 更新 users 表

为用户表添加AI生成相关的字段：

```sql
-- 添加新列到现有表  
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS generations_today INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_generation_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS total_generations INTEGER DEFAULT 0;

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_users_generation_date ON users(last_generation_date);
```

## 默认数据插入

### 默认提示词模板

```sql
-- 插入默认的提示词模板
INSERT INTO prompt_templates (name, description, template, style, complexity, category, is_active, is_default, variables, example_output, sort_order) VALUES

-- Classic风格模板
('Classic Hello Kitty Character', 'Classic line art style featuring Hello Kitty characters', 'Create a {style} coloring page featuring Hello Kitty {userInput}. The image should be clean line art with bold outlines, perfect for coloring. Style: {complexity} with clear, simple shapes suitable for printing.', 'classic', 'simple', 'character', true, true, '{userInput,style,complexity}', 'A classic Hello Kitty sitting with a bow, simple clean lines', 1),

('Classic Scene Template', 'Classic scenes with Hello Kitty themes', 'Design a {style} coloring page showing {userInput}. Include Hello Kitty or Sanrio characters in the scene. The artwork should have {complexity} detail level with clear outlines and no filled areas.', 'classic', 'medium', 'scene', true, false, '{userInput,style,complexity}', 'Hello Kitty having a picnic in a park with trees and flowers', 2),

-- Cute风格模板  
('Cute Kawaii Style', 'Extra cute kawaii style with rounded features', 'Generate a super cute kawaii-style coloring page of {userInput}. Use rounded shapes, big eyes, and adorable expressions. Complexity: {complexity}. Perfect for young children who love cute characters.', 'cute', 'simple', 'character', true, false, '{userInput,complexity}', 'A kawaii-style cat with huge sparkly eyes and a sweet smile', 3),

('Cute Activity Scene', 'Cute characters doing fun activities', 'Create an adorable scene where Hello Kitty and friends are {userInput}. Use cute, rounded art style with simple shapes and happy expressions. Detail level: {complexity}.', 'cute', 'medium', 'scene', true, false, '{userInput,complexity}', 'Hello Kitty and friends having a tea party with cute teacups', 4),

-- Simple风格模板
('Minimalist Design', 'Clean, simple designs for easy coloring', 'Design a minimalist coloring page featuring {userInput}. Use clean, simple lines with minimal details. Perfect for beginners or those who prefer {style} artwork with {complexity} complexity.', 'simple', 'simple', 'general', true, false, '{userInput,style,complexity}', 'A simple outline of Hello Kitty face with minimal details', 5),

-- Detailed风格模板
('Detailed Illustration', 'Complex designs for advanced colorists', 'Create a detailed coloring page illustration of {userInput}. Include intricate patterns, decorative elements, and fine details. This {style} design should have {complexity} level details for experienced colorists.', 'detailed', 'complex', 'general', true, false, '{userInput,style,complexity}', 'Hello Kitty in an ornate garden with detailed flowers and patterns', 6),

-- 特殊主题模板
('Holiday Theme', 'Seasonal and holiday-themed designs', 'Design a festive coloring page for {userInput}. Include Hello Kitty celebrating with appropriate holiday decorations and themes. Style: {style}, Complexity: {complexity}.', 'classic', 'medium', 'holiday', true, false, '{userInput,style,complexity}', 'Hello Kitty decorating a Christmas tree with ornaments', 7),

('Educational Theme', 'Learning-focused designs with letters or numbers', 'Create an educational coloring page where Hello Kitty is learning about {userInput}. Include educational elements like letters, numbers, or learning activities. Style: {style}, appropriate for {complexity} level.', 'classic', 'simple', 'educational', true, false, '{userInput,style,complexity}', 'Hello Kitty with ABC blocks and a chalkboard', 8);
```

## 注意事项

1. **数据库权限**: 确保应用有足够的权限创建表和插入数据
2. **UUID支持**: 如果使用PostgreSQL，确保启用了`gen_random_uuid()`函数
3. **备份**: 在执行迁移前请备份现有数据库
4. **环境变量**: 确保AI服务的API密钥已正确配置在`.env`文件中

## 验证迁移

执行迁移后，可以使用以下查询验证表结构：

```sql
-- 验证prompt_templates表
SELECT COUNT(*) FROM prompt_templates WHERE is_active = true;

-- 验证模板数据
SELECT name, style, complexity, category FROM prompt_templates ORDER BY sort_order;

-- 验证generation_history表新字段
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'generation_history' 
AND column_name IN ('template_id', 'final_prompt', 'generations_today');
```

迁移完成后，管理员可以通过 `/admin` 面板的 "AI Templates" 标签页管理提示词模板。