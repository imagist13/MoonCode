# 部署相关文件
assets/                # 部署相关脚本 / 模板（不进 git 的占位目录）
nginx/
  conf.d/              # 整体挂载到容器 /etc/nginx/conf.d（覆盖镜像自带 default.conf）
    moon.conf          # 主反向代理 + 静态资源
    moon-ssl.conf      # HTTPS（Let's Encrypt / 自签）
  snippets/            # upstream / location 片段
  certs/               # 证书目录（不进 git）
docker-compose.prod.yml  # 生产 compose（基于根目录 compose，覆盖为生产参数）
.env.production.example  # 生产环境变量示例
DEPLOY.md              # 完整部署文档
