# 本地 Mock 后端

不启动 Go / PostgreSQL / Redis / RabbitMQ / Elasticsearch，也能把前端完整跑起来。

## 启动

```bash
# 终端 1：mock API（http://localhost:8080）
cd frontend
bun run mock

# 终端 2：Next 开发服务器（http://localhost:3000）
cd frontend
bun run dev
```

`frontend/.env.local` 已配置为：

```ini
NEXT_PUBLIC_API_BASE=/api/v1   # 浏览器走同源，由 Next rewrites 转发
BACKEND_URL=http://localhost:8080
```

## 登录

- 邮箱：任意（例如 `test@qq.com`）
- 密码：`12345678`（可用 `MOCK_ADMIN_PASSWORD` 覆盖）
- 想要直接看后台又不想登录时，可在浏览器控制台写入：

```js
localStorage.setItem("blog-auth", JSON.stringify({
  state: { token: "mock-token", user: { userId: 1, nickname: "管理员", avatar: "/uploads/avatar-1.png", intro: "", email: "test@qq.com", loginType: 1 } },
  version: 0,
}))
```

## 已覆盖的接口

| 模块 | 接口 |
| --- | --- |
| 文章 | 列表 / 筛选 / 搜索 / 归档 / 详情 / 点赞 / 后台增删改 / 置顶 / 发布 / 图片上传 |
| 分类、标签 | 公开列表、后台增删改查 |
| 评论、留言 | 公开列表与提交、后台分页 / 审核 / 删除 |
| 说说 | 公开列表 / 详情 / 点赞、后台增删 |
| 相册 | 后台相册与照片增删、照片分页 |
| 友链、页面 | 公开友链、后台增删 |
| 站点 | 站点配置（JSON 字符串）、关于我、仪表盘、操作日志 |
| 认证 | 登录、注册、找回密码、验证码 |

说明：

- 同时兼容 `/api/v1/*`（浏览器）和 `/api/*`（首页服务端直连）两种前缀。
- 分页统一返回 `{ records, count, current, size }`。
- 所有写操作只修改内存数据，重启 `bun run mock` 即恢复种子数据。
- `/uploads/*` 由 mock 动态生成渐变 PNG 占位图，不依赖外网。
- 未实现的后台接口（用户 / 角色 / 菜单 / 资源）会返回空数据，不会报错。
