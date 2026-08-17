FROM elasticsearch:7.17.24

# 安装 IK 中文分词插件（版本必须与 ES 主版本一致）
# 使用官方 GitHub release 源；如服务器访问 GitHub 受限，可改用阿里云镜像
#   https://mirrors.aliyun.com/elasticstack/7.x/yum/...
# 或中科大镜像：
#   https://mirrors.ustc.edu.cn/elasticstack/7.x/...
ARG IK_VERSION=7.17.24
ARG IK_DOWNLOAD_URL=https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v${IK_VERSION}/elasticsearch-analysis-ik-${IK_VERSION}.zip

RUN elasticsearch-plugin install --batch ${IK_DOWNLOAD_URL}
