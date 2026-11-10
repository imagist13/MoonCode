# Changelog

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [0.1.0] - 2026-11-10

第一个公开版本：一个可以部署上线，也适合从头读懂的全栈个人博客。

### 新增

- **博客前台**：Hero 推荐、文章流、分类 / 标签筛选、归档、说说、留言板、友链、关于
- **阅读体验**：Markdown 渲染与代码高亮、文章目录、图片灯箱、全文搜索、深浅主题、蜘蛛点唱机、响应式布局
- **文章互动**：评论区、留言板、浏览量统计
- **管理后台**：仪表盘（KPI、近 7 天访问趋势、分类分布、最新文章）、Markdown 编辑、草稿与发布、评论 / 留言 / 说说 / 相册 / 曲目管理、站点配置、操作日志
- **认证与权限**：JWT 登录态、Casbin RBAC、Redis 限流与验证码
- **搜索与异步**：Elasticsearch 全文搜索、Maxwell CDC 增量同步、RabbitMQ 异步邮件
- **实时能力**：WebSocket 聊天
- **文件上传**：本地 / OSS / COS 三种存储模式
- **工程化**：Docker Compose 一键启动、Nginx + HTTPS 生产部署文档、备份与回滚脚本、Vitest 单测、Playwright 端到端测试
- **开发工具**：`scripts/screenshots.mjs` 页面截图、`scripts/demo.mjs` 演示 GIF 录制

### 说明

- 演示站点：<https://ideast.top>
- RabbitMQ 与 Elasticsearch 为后端启动必需依赖，推荐使用 Docker Compose 部署
