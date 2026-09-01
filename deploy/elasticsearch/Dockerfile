FROM elasticsearch:7.17.24

# 安装 IK 中文分词插件（版本必须与 ES 主版本一致）
# 使用 infinilabs 官方 release 源，国内可达
ARG IK_VERSION=7.17.24
ARG IK_DOWNLOAD_URL=https://release.infinilabs.com/analysis-ik/stable/elasticsearch-analysis-ik-${IK_VERSION}.zip

RUN elasticsearch-plugin install --batch ${IK_DOWNLOAD_URL}
