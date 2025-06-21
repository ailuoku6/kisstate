#!/bin/bash

# 启用严格模式，确保脚本安全运行
set -euo pipefail

# 设置根目录路径
ROOT_DIR=$(git rev-parse --show-toplevel)

# 源文件和目标路径
SRC_FILES=("$ROOT_DIR/README.md" "$ROOT_DIR/README_EN.md")
DEST_DIR="$ROOT_DIR/packages/kiss-state"

# 检查目标目录是否存在
if [ ! -d "$DEST_DIR" ]; then
    echo "❌ 错误：目标目录不存在 - $DEST_DIR"
    exit 1
fi

# 初始化变更计数器
changed_count=0

echo "🔍 开始检查 README 文件更新..."

# 处理每个 README 文件
for src_file in "${SRC_FILES[@]}"; do
    # 提取文件名
    filename=$(basename "$src_file")
    dest_file="$DEST_DIR/$filename"
    
    # 检查源文件是否存在
    if [ ! -f "$src_file" ]; then
        echo "⚠️  警告：源文件不存在 - $filename，跳过"
        continue
    fi
    
    # 检查是否需要更新
    if [ ! -f "$dest_file" ] || ! cmp -s "$src_file" "$dest_file"; then
        # 复制文件（保留权限和时间戳）
        cp -p "$src_file" "$dest_file"
        
        # 添加到暂存区
        git add "$dest_file"
        
        # 输出更新信息
        if [ ! -f "$dest_file" ]; then
            echo "✅ 已创建: $filename → $DEST_DIR/"
        else
            echo "🔄 已更新: $filename → $DEST_DIR/ (检测到差异)"
        fi
        
        ((changed_count++))
    else
        echo "⏩ 无需更新: $filename (内容相同)"
    fi
done

# 输出最终结果
if [ "$changed_count" -gt 0 ]; then
    echo "📝 $changed_count 个文件已更新并添加到暂存区"
else
    echo "🎉 所有 README 文件已是最新"
fi

echo "✅ 操作完成"