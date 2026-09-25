# Docker 清理脚本
# 使用方法: ./cleanup-docker.sh

echo "===== Docker 空间清理 ====="
echo ""

# 查看当前空间使用
echo "📊 当前 Docker 空间使用情况:"
docker system df

echo ""
echo "===== 开始清理 ====="

# 1. 清理停止的容器
echo "🗑️  清理已停止的容器..."
docker container prune -f

# 2. 清理 dangling images（无标签的镜像）
echo "🗑️  清理无标签镜像..."
docker image prune -f

# 3. 清理 build cache
echo "🗑️  清理构建缓存..."
docker builder prune -f

# 4. 清理未使用的 volumes（谨慎使用，确认数据已备份）
echo "❓ 是否清理未使用的 volumes？（数据卷不常用不会自动清理）"
echo "   当前 volumes:"
docker volume ls

# 5. 清理未使用的网络
echo "🗑️  清理未使用的网络..."
docker network prune -f

echo ""
echo "===== 清理完成 ====="
echo "📊 清理后空间使用情况:"
docker system df

echo ""
echo "===== 完整清理（可选） ====="
echo "如需释放更多空间，可以运行以下命令（会删除所有未使用的镜像、容器、网络）:"
echo "  docker system prune -a"
