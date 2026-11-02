# 部署指南 · Moon 博客

目标：把博客部署到一台 Linux 云服务器（任意云厂商，2 核 2G 起），整套用 Docker + Nginx，对外只暴露 80/443。

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
#   IMAGE_PREFIX            ghcr.io/<你的 GitHub 用户名>/moon
$EDITOR .env
```

> `deploy/.env.production.example` 已加进 `.gitignore` 范畴之外的目录结构里；真实 `.env` 一定不要提交。
>
> `IMAGE_TAG` 一般不用手改：自动部署时由 workflow 注入 commit sha；手动部署默认 `latest`，回滚时改成旧 sha 即可。

---

## 4. 申请 HTTPS 证书（Let's Encrypt）

> 没域名 / 只想 IP 访问可跳过，HTTPS 块留空即可（直接 `http://IP` 也能跑）。

```bash
sudo apt install -y certbot
sudo mkdir -p /var/www/certbot

# 首次签发：此时还没有证书，先停 nginx 释放 80 端口
sudo docker stop blog-nginx
sudo certbot certonly --standalone \
  -d moon.example.com -d www.moon.example.com \
  --agree-tos -m you@example.com

# 证书放进 nginx 挂载目录，然后取消 moon-ssl.conf 中 443 块的注释并启动
sudo mkdir -p /opt/moon/MoonCode/deploy/nginx/certs/moon.example.com
sudo cp /etc/letsencrypt/live/moon.example.com/fullchain.pem \
        /opt/moon/MoonCode/deploy/nginx/certs/moon.example.com/
sudo cp /etc/letsencrypt/live/moon.example.com/privkey.pem \
        /opt/moon/MoonCode/deploy/nginx/certs/moon.example.com/
sudo docker start blog-nginx

# 续期改为 webroot：moon.conf 已提供 /.well-known/acme-challenge/，
# 之后 certbot renew 不需要停 nginx、也不会再抢 80 端口
sudo certbot certonly --webroot -w /var/www/certbot \
  -d moon.example.com -d www.moon.example.com \
  --force-renewal --agree-tos -m you@example.com

# 续期后同步证书并 reload（certbot.timer 会调用）
sudo tee /etc/letsencrypt/renewal-hooks/deploy/sync-moon.sh > /dev/null <<'EOF'
#!/bin/bash
DOMAIN=moon.example.com
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /opt/moon/MoonCode/deploy/nginx/certs/$DOMAIN/
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem  /opt/moon/MoonCode/deploy/nginx/certs/$DOMAIN/
docker exec blog-nginx nginx -s reload 2>/dev/null || true
EOF
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/sync-moon.sh
```

修改 `deploy/nginx/conf.d/moon-ssl.conf` 里的 `server_name` 和证书路径为自己的。

---

## 5. 启动

> 生产镜像由 CI 构建并推送到 GHCR，**服务器上不再构建**。首次使用前需要登录镜像仓库：
>
> ```bash
> echo "<PAT，权限至少 read:packages>" | docker login ghcr.io -u <github用户名> --password-stdin
> ```
>
> 如果镜像包设为 public，可以跳过登录。也可以在 repository Secrets 里配置
> `GHCR_USER` / `GHCR_TOKEN`，由部署流水线每次自动登录。

```bash
COMPOSE="docker compose -f deploy/docker-compose.prod.yml -p blog"

# 1. 首次部署：先启动基础设施（不会重建已有容器）
$COMPOSE up -d --wait postgres redis rabbitmq elasticsearch

# 2. 跑 schema 迁移（使用镜像内的 migrate）
$COMPOSE run --rm --no-deps backend /app/migrate

# 3. 创建管理员（账号已存在时默认不改密码；重置见下方说明）
$COMPOSE run --rm --no-deps backend /app/seed

# 4. 启动应用
$COMPOSE up -d --wait backend frontend nginx

# 5. 首次/索引变更后重建 ES
$COMPOSE run --rm --no-deps backend /app/reindex

# 6. 看日志
$COMPOSE logs -f backend frontend nginx
```

**seed 策略**：部署流水线每次都会调用 seed，但默认只在账号不存在时创建。已存在时只补绑
admin 角色，**不会改密码、不会让已登录用户失效**。忘记管理员密码时，把 `.env` 里的
`SEED_ADMIN_RESET_PASSWORD` 临时改为 `true` 再部署（或手动执行一次 seed），之后记得改回 `false`。

访问：
- `http://moon.example.com`（或 `https://`）
- 后台 `/admin`

---

## 6. Nginx 关键设计

> 完整模板见 `deploy/nginx/`。下面是设计要点。

### 6.1 反代拆分

| 路径 | 上游 | 说明 |
|---|---|---|
| `/nginx-health` | nginx 自身 | 容器 healthcheck 用，直接返回 200，不依赖后端 |
| `/healthz` | backend `/health` | 给 LB / 监控用的端到端检查，不走限流 |
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

- 证书放在 `deploy/nginx/certs/<domain>/`，挂载到容器 `/etc/nginx/ssl`
- 443 的 server 块在 `moon-ssl.conf`；目前 80 仍可直接访问，需要强制跳转时
  在 `moon.conf` 的 `location /` 返回 301，但要保留 `/nginx-health` 和
  `/.well-known/acme-challenge/` 两个例外（否则容器健康检查与续期会失败）
- 续期使用 webroot（`/var/www/certbot`），不需要停 nginx；续期 hook 同步证书并 reload

### 6.4 反代共用（HTTP / HTTPS）

`upstream` 和 `location` 都抽到 `snippets/moon-upstreams.conf` 和 `snippets/moon-locations.conf`，HTTP / HTTPS 各自 `include`，避免配置分裂。

### 6.5 conf.d 目录整体挂载（重要）

`deploy/nginx/conf.d/` 会**整个目录**挂载到容器 `/etc/nginx/conf.d`，覆盖镜像自带的 `default.conf`。

- 镜像自带的 `default.conf` 声明了 `server_name localhost`，容器内健康检查请求 `localhost` 时会命中它，`/nginx-health` 返回 404，导致 nginx 容器一直显示 `unhealthy`。
- `conf.d/moon.conf` 显式写了 `listen 80 default_server`，所以用公网 IP / localhost / 未匹配域名访问都会落到博客，而不是 nginx 欢迎页。
- 容器健康检查打的是 `/nginx-health`（nginx 直接返回 200，不依赖后端）；`/healthz` 才是给 LB 用的端到端检查（nginx → backend）。
- 上游地址通过 `resolver 127.0.0.11` + 变量形式的 `proxy_pass` 解析，容器重建换 IP 后 nginx 会自动重新解析，无需重启 nginx。

> 不要再往 `nginx/` 根目录放 server 配置 —— 只有 `conf.d/` 会被挂载进容器。

---

## 7. 自动部署（GitHub Actions）

流水线拆成两条工作流：

- `ci.yml`：lint / 单测 / 覆盖率门槛 / 配置校验 / 安全扫描 / E2E；`main` 上通过后构建并推送 GHCR 镜像（`sha` + `latest` 两个 tag）。
- `deploy.yml`：通过 `workflow_run` **只在本分支 CI 成功后**触发；服务器只拉镜像、迁移、重启，不再构建。

### 7.1 必填 Secrets

在仓库 `Settings → Secrets and variables → Actions` 配置：

| Secret | 必填 | 说明 |
|---|---|---|
| `DEPLOY_HOST` | ✅ | 服务器公网 IP / 域名 |
| `DEPLOY_PORT` | — | SSH 端口（默认 22） |
| `DEPLOY_USER` | ✅ | SSH 用户 |
| `DEPLOY_SSH_KEY` | ✅ | 私钥全文（含 `BEGIN OPENSSH PRIVATE KEY` 行） |
| `DEPLOY_PATH` | ✅ | 服务器上项目目录（例：`/opt/moon`） |
| `GHCR_USER` | — | 拉取私有镜像用；不配则依赖服务器已有的 `docker login` |
| `GHCR_TOKEN` | — | PAT，权限 `read:packages` |

另外，CI 需要推送镜像包：仓库 `Settings → Actions → General → Workflow permissions` 建议至少允许
`Read and write permissions`（工作流内已声明 `packages: write`）。首次推送后，在
`Packages` 里把 `moon-backend` / `moon-frontend` 的可见性按需设为 public 或保持 private。

### 7.2 首次：免密钥登录

```bash
# 在服务器上为 deploy 用户生成专用密钥对
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/github_deploy -N ""
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# 把 ~/.ssh/github_deploy（私钥）填到 Secret DEPLOY_SSH_KEY
```

服务器上还需要能拉取镜像（二选一）：

```bash
# 方式 A：一次性登录（凭据会保存在 ~/.docker/config.json）
echo "<read:packages PAT>" | docker login ghcr.io -u <github用户名> --password-stdin

# 方式 B：配置 GHCR_USER / GHCR_TOKEN 两个 Secret，由流水线每次自动登录
```

### 7.3 流程

```
main push / PR merge
  └─ CI: frontend + backend + config (+ e2e on main/PR)
        └─ 全部成功 → build-push（Trivy 扫 critical → 推 GHCR）
              └─ Deploy（仅 main & CI success，串行、不取消）
                   ① git 同步 compose/nginx 配置（检出与镜像相同的 sha）
                   ② 确保 postgres/redis/rabbitmq/elasticsearch 在运行
                   ③ pg_dump 备份（保留最近 5 份，失败即中止）
                   ④ 拉取 backend/frontend 镜像
                   ⑤ migrate → seed（已存在则不改密码）
                   ⑥ up -d --wait（等 healthcheck）
                   ⑦ /healthz + / 冒烟；失败自动回滚到上一个 .deployed_tag
```

并发保护：`concurrency: deploy-production`，`cancel-in-progress: false`——连续推送时**排队执行**，
不会把正在进行的部署打断。

手动回滚 / 部署指定版本：

```bash
# GitHub → Actions → Deploy Production → Run workflow
# image_tag 填旧 commit sha（留空 = latest）
```

> 流水线不再执行 `docker compose down`，因此 Postgres / Redis / RabbitMQ / ES 不会被重启；
> 只有 backend / frontend / nginx 会被重建，发版期间服务中断时间约等于一次健康检查周期。

---

## 8. 备份与恢复

> 部署流水线会在**每次迁移前**自动 `pg_dump` 到服务器上的 `backups/` 目录（保留最近 5 份，
> 备份失败会直接终止部署）。下面是手动备份 / 恢复的方式。

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
| `blog-nginx` 一直 `unhealthy` | 先 `docker exec blog-nginx wget -qO- http://127.0.0.1/nginx-health`，再看 `docker logs blog-nginx`；确认挂载的是 `deploy/nginx/conf.d` 而不是旧的两个单文件 |
| nginx 容器起不来 / 反复重启 | `docker logs blog-nginx` 若出现 `address already in use`，是宿主机已有 nginx 或别的进程占了 80/443：`sudo ss -lntp \| grep -E ':80\|:443'`，停掉宿主 nginx（`sudo systemctl disable --now nginx`）或改端口映射 |
| 访问域名得到 nginx 欢迎页 | 说明命中了镜像自带的 `default.conf`，检查 `conf.d` 目录挂载与 `listen 80 default_server` |
| 前端 API 请求 404 | 检查 `BACKEND_URL` 是否正确构建进镜像；浏览器 devtools 看请求实际打到哪 |
| 上传文件丢失 | `docker volume inspect moon_backend_uploads` 看挂载；后端重启会丢未挂载目录 |
| HTTPS 证书过期 | `certbot renew` 手动续；检查 `renewal-hooks/deploy/sync-moon.sh` 是否执行 |
| ES 重建后搜索仍空 | 确认 `./reindex` 跑完且没报错；检查 `es_data` volume 是否被清空 |
| 内存爆掉 | 调低 `ES_JAVA_OPTS` 到 `-Xms256m -Xmx256m`，适合 2G 小机器 |

---

## 11. 回滚

镜像按 commit sha 打 tag，回滚就是重新部署旧 tag：

```
GitHub → Actions → Deploy Production → Run workflow → image_tag 填旧 sha
```

流水线部署失败时也会**自动回滚**到 `.deployed_tag` 记录的上一个版本。服务器上也有历史 sha：

```bash
cd /opt/moon
cat .deployed_tag                 # 当前在跑的版本
git log --oneline -10             # 找要回退的 commit
```

手动回滚（不经过 Actions）：

```bash
cd /opt/moon
export IMAGE_PREFIX=ghcr.io/<owner>/moon IMAGE_TAG=<旧sha>
git checkout -f <旧sha>            # 同步 compose / nginx 配置
docker compose -f deploy/docker-compose.prod.yml pull backend frontend
docker compose -f deploy/docker-compose.prod.yml up -d --no-deps --force-recreate --wait backend frontend nginx
echo <旧sha> > .deployed_tag
```

若本次发布包含数据库迁移，必要时用 `backups/` 里的备份恢复（见第 8 节）。