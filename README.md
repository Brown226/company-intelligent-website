# 公司智能化网站

## 项目简介
公司智能化网站是一个集成了AI聊天功能、数据分析模块等多种智能化功能的企业级应用平台。

## 主要功能

### AI聊天功能
- 支持多种AI助手集成（MaxKB、Dify、RagFlow、SQLBot）
- 实时聊天交互
- 会话历史管理
- 多轮对话支持

### 数据分析模块
- 热图分析
- 关键词分析
- 会话日志分析
- 用户行为分析

### 管理功能
- 用户管理
- 权限管理
- 助手管理
- 部门管理

## 技术栈

### 前端
- React 18
- TypeScript
- Tailwind CSS
- Redux Toolkit

### 后端
- Node.js
- Express
- TypeScript
- PostgreSQL
- Redis

## 项目结构

```
.
├── backend/          # 后端代码
├── frontend/         # 前端代码
├── migrations/       # 数据库迁移文件
├── docs/             # 项目文档
└── scripts/          # 辅助脚本
```

## 开发环境搭建

### 前端
```bash
cd frontend
npm install
npm run dev
```

### 后端
```bash
cd backend
npm install
npm run dev
```

## 部署

### Docker部署
```bash
docker-compose up -d
```

### 手动部署
1. 配置环境变量
2. 运行数据库迁移
3. 构建前端和后端
4. 启动服务

## 许可证

MIT License
