#!/usr/bin/env bash
# iskill-github-publisher · 把本地 AI skill 发布到 GitHub（iskill- 前缀 + SSH 推送）
#
# 用法：
#   publish.sh --src <active skill 目录> [--name <短名>] [--prefix <前缀>] [--out-base <目录>] [--desc "简介"] [--rename-active] [--dry-run]
#
# 行为：
#   1. 计算目标名（--name 或 src 目录名，缺省 iskill- 前缀，可用 --prefix 覆盖）
#   2. 在 <out-base>/<目标名> 建仓库快照（复制 SKILL.md / README.md / app/ / scripts/）
#   3. 把快照里 SKILL.md 的 name: 改成目标名
#   4. git init + commit（分支统一 main）
#   5. gh repo create（公开，不自动 push）→ 已存在则复用
#   6. 远程改 SSH，git push -u origin main
#   7. 打印仓库地址
#   --rename-active：额外把 src 活动目录改名为目标名（改变 WorkBuddy 调用名，需谨慎）
#   --dry-run      ：只做快照+commit，不建仓库不推送（用于验证）

set -euo pipefail

# gh 绝对路径（非交互 shell 默认 PATH 不含 Homebrew）
GH="$(command -v gh || true)"
[ -x /opt/homebrew/bin/gh ] && GH=/opt/homebrew/bin/gh
[ -z "$GH" ] && { echo "✖ 找不到 gh，请先 brew install gh 并 gh auth login"; exit 1; }

SRC="" NAME="" PREFIX="iskill" OUT_BASE="$HOME/WorkBuddy" DESC="" RENAME_ACTIVE=0 DRY_RUN=0
while [ $# -gt 0 ]; do
  case "$1" in
    --src)        SRC="$2"; shift 2;;
    --name)       NAME="$2"; shift 2;;
    --out-base)   OUT_BASE="$2"; shift 2;;
    --desc)       DESC="$2"; shift 2;;
    --prefix)     PREFIX="$2"; shift 2;;
    --rename-active) RENAME_ACTIVE=1; shift;;
    --dry-run)    DRY_RUN=1; shift;;
    -h|--help)    sed -n '2,14p' "$0"; exit 0;;
    *) echo "未知参数: $1"; exit 1;;
  esac
done

[ -z "$SRC" ] && { echo "✖ 必需 --src <active skill 目录>"; exit 1; }
SRC="$(cd "$SRC" && pwd)"
[ -f "$SRC/SKILL.md" ] || { echo "✖ $SRC 不是 skill 目录（缺 SKILL.md）"; exit 1; }

# 计算目标名（缺省 iskill- 前缀，可用 --prefix 覆盖；自动补尾随 -）
PREFIX="${PREFIX%-}"
PREFIX_DASH="$PREFIX-"
BASENAME="$(basename "$SRC")"
if [ -z "$NAME" ]; then
  if [[ "$BASENAME" == "${PREFIX_DASH}"* ]]; then NAME="$BASENAME"; else NAME="${PREFIX_DASH}$BASENAME"; fi
else
  [[ "$NAME" == "${PREFIX_DASH}"* ]] || NAME="${PREFIX_DASH}$NAME"
fi

# GitHub 账号（从 gh auth status 解析，不写死）
ACCOUNT="$("$GH" auth status 2>&1 | grep -oE 'Logged in to github.com account [^ ]+' | awk '{print $NF}')"
[ -z "$ACCOUNT" ] && { echo "✖ 无法从 gh auth status 获取账号，请先 gh auth login"; exit 1; }

DEST="$OUT_BASE/$NAME"
echo "▶ 目标名（前缀 ${PREFIX_DASH}）: $NAME"
echo "▶ 账号     : $ACCOUNT"
echo "▶ 快照目录 : $DEST"

# 1) 复制 skill 内容到快照
rm -rf "$DEST"
mkdir -p "$DEST"
for item in SKILL.md README.md app scripts; do
  [ -e "$SRC/$item" ] && cp -R "$SRC/$item" "$DEST/"
done
[ -f "$DEST/SKILL.md" ] || { echo "✖ 复制后快照缺少 SKILL.md"; exit 1; }

# 2) 改写 SKILL.md 的 name: 字段（只改 frontmatter 第一处）
if command -v python3 >/dev/null 2>&1; then
  python3 - "$DEST/SKILL.md" "$NAME" <<'PY'
import sys, re
p, n = sys.argv[1], sys.argv[2]
s = open(p, encoding='utf-8').read()
s = re.sub(r'(?m)^name:\s*\S+', f'name: {n}', s, count=1)
open(p, 'w', encoding='utf-8').write(s)
PY
else
  sed -i.bak -E '1,/^name:/s/^name:.*/name: '"$NAME"'/' "$DEST/SKILL.md" && rm -f "$DEST/SKILL.md.bak"
fi
echo "• SKILL.md name 改为 $NAME"

# 3) git init + commit（分支统一 main）
cd "$DEST"
git init -q
b="$(git symbolic-ref --short HEAD 2>/dev/null || echo master)"
[ "$b" != "main" ] && git branch -m main 2>/dev/null || true
git add -A
git -c user.name="${GIT_USER:-ZEO}" -c user.email="${GIT_EMAIL:-85879+aispin@users.noreply.github.com}" \
    commit -q -m "feat: $NAME 初始版本（${PREFIX_DASH}前缀，SkillHub 认领用）"
echo "• 已 commit（分支 main）"

if [ "$DRY_RUN" = 1 ]; then
  echo ""
  echo "✓ [dry-run] 快照就绪于 ${DEST:-UNSET}（未建仓库/未推送）。"
  echo "  确认无误后去掉 --dry-run 再跑一次即可。"
  exit 0
fi

# 4) gh repo create（不 push）；已存在则复用
if "$GH" repo view "$ACCOUNT/$NAME" --json name >/dev/null 2>&1; then
  echo "• 仓库已存在，复用：$ACCOUNT/$NAME"
else
  "$GH" repo create "$NAME" --public --source=. --remote=origin --confirm \
    --description "${DESC:-WorkBuddy AI skill（${PREFIX_DASH}系列）。}" 2>&1 \
    || { echo "✖ gh repo create 失败"; exit 1; }
fi

# 5) SSH 远程 + 推送
git remote set-url origin "git@github.com:$ACCOUNT/$NAME.git" 2>/dev/null \
  || git remote add origin "git@github.com:$ACCOUNT/$NAME.git"
git push -u origin main 2>&1

echo ""
echo "✓ 完成：https://github.com/$ACCOUNT/$NAME"

# 6) 可选：改名活动目录
if [ "$RENAME_ACTIVE" = 1 ]; then
  NEW_SRC="$(dirname "$SRC")/$NAME"
  if [ "$NEW_SRC" != "$SRC" ] && [ ! -e "$NEW_SRC" ]; then
    mv "$SRC" "$NEW_SRC"
    echo "• 活动目录已改名：$NEW_SRC（WorkBuddy 调用名变为 $NAME，可能需重新扫描）"
  else
    echo "• 活动目录改名跳过（目标已存在或同名）"
  fi
fi
