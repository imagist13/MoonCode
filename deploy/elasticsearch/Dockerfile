FROM elasticsearch:7.17.24

# 安装 IK 中文分词插件（版本必须与 ES 主版本一致）
# 阿里云镜像，国内服务器可达；如需切换可改成：
#   GitHub: https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v${IK_VERSION}/elasticsearch-analysis-ik-${IK_VERSION}.zip
#   中科大:  https://mirrors.ustc.edu.cn/elasticstack/...
ARG IK_VERSION=7.17.24
ARG IK_DOWNLOAD_URL=https://mirrors.aliyun.com/elasticstack/7.x/downloads/elasticsearch-plugins/analysis-ik/elasticsearch-analysis-ik-${IK_VERSION}.zip

RUN elasticsearch-plugin install --batch ${IK_DOWNLOAD_URL}
