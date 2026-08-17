# 部署指南 · Moon 博客

目标：把博客部署到一台 Linux 云服务器（任意云厂商，2 核 2G 起），整套用 Docker + Nginx，对外只暴露 80/443。

---

## 0. 本部署信息

> 本节记录当前生产环境的**非敏感**信息，便于交接。**密码、密钥、JWT_SECRET 等必须放在 `.env`（已 gitignore）或服务器的密钥管理里，绝不能进 git**。

| 项目 | 值 |
|------|-----|
| 公网 IP | `154.37.221.209` |
| SSH 用户 | `root` |
| 域名 | `ideast.top` |
| 服务器项目目录 | `/opt/moon/MoonCode` |
| 证书目录 | `/opt/moon/MoonCode/deploy/nginx/certs/ideast.top` |
| 备用 IP 访问 | `http://154.37.221.209`（HTTPS 前临时） |

**鉴权方式**：强烈推荐 SSH 公私钥 + 禁用密码登录（命令见下文 §2.0）。如果暂时用密码，密码**只能**保存在本地 `.env` / 密码管理器里，不要写进任何仓库文件。

---

## 1. 架构总览

```
            ┌─────────────────────────────────────┐
  Internet ─┤  Cloud LB / CDN (可选，可跳过)      │
            └────────────┬────────────────────────┘
                         │ 80 / 443
                ┌────────▼────────┐
                │   Nginx (容器)  │  ← 反代 + HTTPS 终止 + 静态缓存 + 限流
                │  127.0.0.1:80   │
                └──┬───────────┬──┘
        /api/*    │           │   /
        /uploads/*│           │
        /healthz  │           │
   ┌──────────────▼──┐   ┌────▼──────────────┐
   │ Backend (容器)  │   │ Frontend (容器)    │
   │ 127.0.0.1:8080 │   │ 127.0.0.1:3000     │
   └───┬──┬──┬──┬────┘   └──┬─────────────────┘
       │  │  │  │           │
       ▼  ▼  ▼  ▼           ▼
   PG  Redis RabbitMQ  ES   （共享 docker network blog-net）
```

- **唯一对外端口**：`80` / `443`（由 Nginx 暴露）。
- **`AUTO_MIGRATE_ON_STARTUP=false`**：生产环境强制手动迁移，杜绝多副本竞争。

---

## 2. 服务器初始化

> 适用：Ubuntu 22.04 / Debian 12 / CentOS 9 等主流发行版。

### 2.1 安装 Docker

```bash
# Ubuntu / Debian
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker
docker --version
docker compose version    # v2.x
```

### 2.2 安装 Nginx（仅在宿主机做健康检查 / 占位时需要）

```bash
# 容器版 nginx 已能完成反代，宿主机 nginx 可选。
# 如果只想跑博客本身 → 跳过本节。
sudo apt install -y nginx
```

### 2.3 防火墙

```bash
# ufw (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# firewalld (CentOS)
sudo firewall-cmd --permanent --add-service={ssh,http,https}
sudo firewall-cmd --reload
```

### 2.4 准备项目目录

```bash
sudo mkdir -p /opt/moon
sudo chown -R $USER:$USER /opt/moon
cd /opt/moon
git clone <your-repo-url> .
```

---

## 3. 配置环境变量

```bash
cp deploy/.env.production.example .env

# 必填：
#   JWT_SECRET              openssl rand -base64 48
#   POSTGRES_PASSWORD       强密码
#   RABBITMQ_PASSWORD       强密码
#   SEED_ADMIN_PASSWORD     强密码
$EDITOR .env
```

> 重要：
> - **不要**把真实 `.env` 提交到 git
> - 密码里若含 `# $ ! \` 等符号，**必须用单引号包起来**，否则 docker compose 会把 `#` 后的内容当注释
> - 用 `-f deploy/docker-compose.prod.yml` 启动时，docker compose 默认从**项目目录**（即 deploy 目录）找 `.env`，**不会**自动读项目根的 `.env`。三种解决方案：
>   - `docker compose --env-file .env -f deploy/docker-compose.prod.yml up -d`（推荐，**显式**指定 env 文件，路径相对当前目录）
>   - `docker compose --project-directory . -f deploy/docker-compose.prod.yml up -d`（把项目根当项目目录）
>   - 或把 `.env` 链接/复制到 `deploy/.env`

---

## 4. 申请 HTTPS 证书（Let's Encrypt）

> 没域名 / 只想 IP 访问可跳过，HTTPS 块留空即可（直接 `http://IP` 也能跑）。

```bash
sudo apt install -y certbot

# 临时停掉占用 80 的容器（certbot standalone 必须独占 80 端口）
# 如果 blog-nginx 正在跑，先停掉；申请完再起回来
cd /opt/moon/MoonCode
docker compose -f deploy/docker-compose.prod.yml stop nginx
sudo certbot certonly --standalone \
  -d ideast.top -d www.ideast.top \
  --agree-tos -m 3467217107@qq.com

# 申请完重启 nginx
docker compose -f deploy/docker-compose.prod.yml up -d nginx

# 拷贝证书到 nginx 容器目录
sudo mkdir -p /opt/moon/MoonCode/deploy/nginx/certs/ideast.top
sudo cp /etc/letsencrypt/live/ideast.top/fullchain.pem \
        /opt/moon/MoonCode/deploy/nginx/certs/ideast.top/
sudo cp /etc/letsencrypt/live/ideast.top/privkey.pem \
        /opt/moon/MoonCode/deploy/nginx/certs/ideast.top/
sudo chown -R $USER:$USER /opt/moon/deploy/nginx/certs

# 自动续期（certbot hook：续期后同步到 deploy 目录）
sudo tee /etc/letsencrypt/renewal-hooks/deploy/sync-moon.sh > /dev/null <<'EOF'
#!/bin/bash
DOMAIN=ideast.top
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /opt/moon/deploy/nginx/certs/$DOMAIN/
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem  /opt/moon/deploy/nginx/certs/$DOMAIN/
docker exec blog-nginx nginx -s reload
EOF
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/sync-moon.sh
```

修改 `deploy/nginx/moon-ssl.conf` 里的 `server_name` 和证书路径为自己的。

---

## 5. 启动

```bash
# 1. 构建并启动
docker compose -f deploy/docker-compose.prod.yml up -d --build

# 2. 跑 schema 迁移
docker compose -f deploy/docker-compose.prod.yml exec backend ./migrate

# 3. 创建管理员（仅首次）
docker compose -f deploy/docker-compose.prod.yml exec backend ./seed

# 4. 重建 ES 索引
docker compose -f deploy/docker-compose.prod.yml exec backend ./reindex

# 5. 看日志
docker compose -f deploy/docker-compose.prod.yml logs -f backend frontend nginx
```

访问：
- `http://ideast.top`（或 `https://`）
- 后台 `/admin`

---

## 6. Nginx 关键设计

> 完整模板见 `deploy/nginx/`。下面是设计要点。

### 6.1 反代拆分

| 路径 | 上游 | 说明 |
|---|---|---|
| `/healthz` | backend `/health` | 给 LB / 监控用，不走限流 |
| `/api/*` | backend:8080 | REST 接口 |
| `/uploads/*` | backend:8080 | 静态上传文件，缓存 30 天 |
| `/_next/static/*` | frontend:3000 | Next 构建产物，缓存 365 天 |
| `/` | frontend:3000 | 其余全部（含 SSR） |

### 6.2 安全 / 性能

- `client_max_body_size 100m`：跟后端 `upload.max_size_mb` 对齐
- `proxy_http_version 1.1` + `Connection "upgrade"`：为后续接 WS 留口子
- TLS：`TLSv1.2 TLSv1.3`、HSTS（开启 HTTPS 后别降级）
- 限流：`30 r/s`，突发 60，避免被刷爆
- 上传文件走 `Cache-Control: public, immutable`，CDN 友好

### 6.3 HTTPS 终止

- 证书放在 `deploy/nginx/certs/<domain>/`
- HTTP 强制跳转 HTTPS（见 `moon-ssl.conf` 末尾的 301 block）
- 续期 hook 会自动 reload nginx

### 6.4 反代共用（HTTP / HTTPS）

`upstream` 和 `location` 都抽到 `snippets/moon-upstreams.conf` 和 `snippets/moon-locations.conf`，HTTP / HTTPS 各自 `include`，避免配置分裂。

---

## 7. 自动部署（GitHub Actions）

`.github/workflows/deploy.yml` 已配置完成。

### 7.1 必填 Secrets

在仓库 `Settings → Secrets and variables → Actions` 配置：

| Secret | 说明 |
|---|---|
| `DEPLOY_HOST` | 服务器公网 IP / 域名 |
| `DEPLOY_PORT` | SSH 端口（默认 22 可省略） |
| `DEPLOY_USER` | SSH 用户 |
| `DEPLOY_SSH_KEY` | 私钥全文（含 `BEGIN OPENSSH PRIVATE KEY` 行） |
| `DEPLOY_PATH` | 服务器上项目目录（例：`/opt/moon/MoonCode`） |

### 7.2 首次：免密钥登录

```bash
# 在服务器上为 deploy 用户生成专用密钥对
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/github_deploy -N ""
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# 把 ~/.ssh/github_deploy（私钥）填到 Secret DEPLOY_SSH_KEY
```

### 7.3 流程

`main` 分支 push → 触发 `deploy` workflow → SSH 到服务器：

```
git reset --hard origin/main
docker compose build --pull frontend backend
docker compose up -d --no-deps --scale backend=2 backend   # 起新副本
sleep 5
docker compose up -d --no-deps --scale backend=1 backend   # 卸老副本
docker compose up -d --no-deps frontend
docker image prune -f
curl /health  &&  curl /                                    # 健康检查
```

并发保护：`concurrency: deploy-${{ github.ref }}` 保证同一分支串行。

---

## 8. 备份与恢复

```bash
# === 备份 ===
# PostgreSQL
docker exec blog-postgres pg_dump -U blog blog | gzip > backup/db-$(date +%F).sql.gz

# 上传文件
docker run --rm -v moon_backend_uploads:/data -v $(pwd)/backup:/backup \
  alpine tar czf /backup/uploads-$(date +%F).tar.gz -C /data .

# === 恢复 ===
gunzip -c backup/db-2026-01-01.sql.gz | docker exec -i blog-postgres psql -U blog blog
```

放进 `/etc/cron.daily/moon-backup` 即可每日自动备份。

---

## 9. 监控 / 日志

```bash
# 容器状态
docker compose -f deploy/docker-compose.prod.yml ps

# 资源占用
docker stats --no-stream

# 日志（Nginx 已加 json-file 轮转，应用日志通过 docker logs 看）
docker compose -f deploy/docker-compose.prod.yml logs --tail=200 -f backend
```

可选接入：
- Prometheus + Grafana：宿主机跑 node-exporter + cadvisor
- 集中日志：Loki / ELK
- 告警：UptimeRobot（最简单）/ Alertmanager

---

## 10. 常见问题

| 现象 | 排查 |
|---|---|
| `nginx 502 Bad Gateway` | `docker compose ps` 看 backend / frontend 是否 healthy；`docker logs blog-backend` |
| 前端 API 请求 404 | 检查 `BACKEND_URL` 是否正确构建进镜像；浏览器 devtools 看请求实际打到哪 |
| 上传文件丢失 | `docker volume inspect moon_backend_uploads` 看挂载；后端重启会丢未挂载目录 |
| HTTPS 证书过期 | `certbot renew` 手动续；检查 `renewal-hooks/deploy/sync-moon.sh` 是否执行 |
| ES 重建后搜索仍空 | 确认 `./reindex` 跑完且没报错；检查 `es_data` volume 是否被清空 |
| 内存爆掉 | 调低 `ES_JAVA_OPTS` 到 `-Xms256m -Xmx256m`，适合 2G 小机器 |

---

## 11. 一键回滚

```bash
# 回滚到上一个 commit
cd /opt/moon
git log --oneline -5
git reset --hard <previous-commit>
docker compose -f deploy/docker-compose.prod.yml up -d --build
```

更稳的做法：每次发版打个 tag，rollback 时 `git checkout <tag>`。