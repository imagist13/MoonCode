# 脚本

## 页面截图

`scripts/screenshots.mjs` 用 Playwright 截取站点页面，默认生成 README 引用的 9 张图
到 `docs/screenshots/`。以后需要更新页面截图时，直接跑这个脚本即可，不用再手工拼命令。

### 准备

脚本依赖 `frontend/node_modules` 里的 Playwright，不需要额外安装依赖。先启动站点：

```bash
cd frontend
bun run mock    # 终端 1：mock API（:8080）
bun run dev     # 终端 2：Next 开发服务器（:3000）
```

### 使用

在仓库根目录执行：

```bash
# 截取全部预设页面
bun scripts/screenshots.mjs

# 只截其中几张
bun scripts/screenshots.mjs --only home,player

# 截取任意页面（带后台登录）
bun scripts/screenshots.mjs --url /admin/music --auth --name admin-music

# 深色主题、2 倍像素密度
bun scripts/screenshots.mjs --dark --scale 2

# 调试：显示浏览器窗口
bun scripts/screenshots.mjs --headed --only admin
```

默认会覆盖 `docs/screenshots/` 下的同名图片；只想预览时用 `--out` 改到临时目录：

```bash
bun scripts/screenshots.mjs --out .tmp/screenshots
```

### 预设页面

| 名称 | 路径 | 说明 |
| --- | --- | --- |
| `home` | `/` | 首页首屏 |
| `article` | 首页第一篇文章 | 文章详情首屏 |
| `archives` | `/archives` | 归档 |
| `message` | `/message` | 留言板 |
| `links` | `/links` | 友链 |
| `login` | `/login` | 登录页 |
| `admin-login` | `/admin/login` | 后台登录 |
| `admin` | `/admin` | 后台仪表盘（需登录） |
| `player` | `/` | 展开蜘蛛点唱机 |

### 登录

Mock 后端默认账号：

- 邮箱：`test@qq.com`（任意邮箱均可）
- 密码：`12345678`

连接真实后端时传入管理员账号：

```bash
bun scripts/screenshots.mjs --only admin \
  --email admin@example.com --password 'your-password'
```

也可以通过环境变量 `SCREENSHOT_EMAIL` / `SCREENSHOT_PASSWORD` 设置。

### 常用参数

| 参数 | 说明 |
| --- | --- |
| `--base-url <url>` | 站点地址，默认 `$BASE_URL` 或 `http://localhost:3000` |
| `--out <dir>` | 输出目录，默认 `docs/screenshots` |
| `--only <a,b>` | 只截指定预设 |
| `--url <path>` | 截取任意页面 |
| `--name <name>` | 配合 `--url` 指定输出文件名 |
| `--auth` | 截图前登录后台（`--url` 模式） |
| `--click <selector>` | 截图前点击元素（如展开弹窗） |
| `--wait-for <selector>` | 等待元素可见后再截图 |
| `--wait <ms>` | 截图前额外等待 |
| `--viewport` | 只截视口，不截整页（`--url` 模式） |
| `--show-player` | 保留左下角悬浮音乐播放器（默认隐藏，`player` 预设除外） |
| `--width` / `--height` | 视口尺寸，默认 `1440 × 900` |
| `--scale <n>` | 设备像素比，默认 `1` |
| `--dark` | 深色主题 |
| `--headed` | 显示浏览器窗口 |

完整说明：`bun scripts/screenshots.mjs --help`。

说明：

- 截图会等待字体、图片和懒加载内容就绪，并自动隐藏 Next.js 开发模式左下角的调试按钮。
- 页面本身报错时脚本会终止该张截图并报告错误，不会把错误覆盖层存成图片。
- 除 `player` 预设外，悬浮音乐播放器默认隐藏；需要保留时加 `--show-player`。
- 截图内容来自当前运行中的 Mock 数据；想恢复演示数据，重启 `bun run mock` 即可。

### 常见问题

- **无法访问 localhost:3000**：先启动 `bun run dev`；`player` 和后台截图还需要 `bun run mock`。
- **Chromium 启动失败**：脚本会自动查找 `ms-playwright` 下已安装的 Chromium。
  仍失败时执行 `cd frontend && bunx playwright install chromium`，
  或用 `CHROMIUM_EXECUTABLE_PATH` 指定浏览器可执行文件。
- **player 截图为空或缺少播放器**：真实后端曲目为空时播放器会隐藏，先用后台添加一首启用曲目，
  或使用 mock 后端。
- **后台截图登录失败**：检查 `--email` / `--password`；mock 默认密码为 `12345678`。
- **Git Bash 下 `--url /admin/music` 报本地路径错误**：MSYS 会把以 `/` 开头的参数转成 Windows 路径。
  改用完整 URL（`--url http://localhost:3000/admin/music`），或设置 `MSYS_NO_PATHCONV=1`。

## 演示 GIF

`scripts/demo.mjs` 用 Playwright 录制首页浏览和深浅主题切换，再用 ffmpeg 转成
README 顶部的 `docs/screenshots/demo.gif`。页面改版后重跑一次即可更新演示。

需要 Playwright（`frontend/node_modules` 已带）和系统 `ffmpeg`（不在 PATH 时用
`--ffmpeg` 或 `FFMPEG_PATH` 指定）。站点照常先启动 `bun run mock` + `bun run dev`。

```bash
# 录制并生成 GIF（默认 960px / 9fps / 128 色）
bun scripts/demo.mjs

# 体积太大时降一档
bun scripts/demo.mjs --gif-width 800 --fps 8

# 保留中间视频，便于自己剪
bun scripts/demo.mjs --keep-video --out .tmp/demo.gif
```

录制内容来自当前运行中的 Mock 数据；想换个演示效果，改 mock 数据后重启
`bun run mock` 再录。完整参数：`bun scripts/demo.mjs --help`。

## 社交预览图

`scripts/social-preview.mjs` 把 `scripts/social-preview.html` 渲染成 1280 × 640 的
`docs/social-preview.png`（GitHub 仓库分享卡）。改文案或换截图后重跑：

```bash
bun scripts/social-preview.mjs
```

生成后到 GitHub 仓库 **Settings → Social preview** 手动上传
`docs/social-preview.png`。模板里的截图路径是相对 `docs/screenshots/` 的，
换图时保持文件名不变即可。
