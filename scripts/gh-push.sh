#!/usr/bin/env bash
# iskill-github-publisher · gh-push.sh —— 全 agent 统一 GitHub 推送配方（无弹窗、防身份泄漏）
#
# 为什么存在（2026-09-30 定稿）：
#   沙箱会话里 GitHub 推送有三条坑：
#   ① SSH（git@github.com）被沙箱权限墙拦，不可用；
#   ② /opt/homebrew/etc/gitconfig 自带 [credential] helper = osxkeychain，
#      任何没显式禁用 helper 的 HTTPS push 都会读写 macOS 钥匙串 → 每次弹确认框；
#   ③ 全局 ~/.gitconfig 的身份是真实邮箱（Levin/mamboer@live.com），
#      仓库本地 user.* 静默丢失时 commit 会回退到它 → 隐私泄漏。
#   本脚本把三者一次治好，推送后并核对远端 sha（防止「假失败/假成功」）。
#
# 用法：
#   gh-push.sh <本地仓库目录> [分支=main] [owner/repo]
#     owner/repo 缺省从 origin URL 解析（SSH/HTTPS 格式均可）。
#   环境变量：
#     GH_PROXY   代理地址，缺省 http://127.0.0.1:10080（本机实测稳定通道）
#     GH_NAME    commit 作者名，缺省 ZEO
#     GH_EMAIL   commit 邮箱，缺省 <id>+<login>@users.noreply.github.com（从 gh api user 动态取）
#
# 退出码：0 成功且远端 sha 已核对一致；非 0 失败（原因见输出）。

set -euo pipefail

# 禁掉 git 的交互式凭据提示：token 取空/失效时直接快速失败，
# 而不是挂在 "Username for 'https://github.com':" 等到被超时杀掉（exit 137）
export GIT_TERMINAL_PROMPT=0
export GIT_ASKPASS=true

GH="$(command -v gh || true)"
[ -x /opt/homebrew/bin/gh ] && GH=/opt/homebrew/bin/gh
[ -z "$GH" ] && { echo "✖ 找不到 gh"; exit 1; }

REPO_DIR="${1:?用法: gh-push.sh <仓库目录> [分支=main] [owner/repo]}"
BRANCH="${2:-main}"
SLUG_ARG="${3:-}"
PROXY="${GH_PROXY:-http://127.0.0.1:10080}"

[ -d "$REPO_DIR/.git" ] || { echo "✖ $REPO_DIR 不是 git 仓库"; exit 1; }
cd "$REPO_DIR"

# ---- 1) 解析 owner/repo ----
if [ -n "$SLUG_ARG" ]; then
  SLUG="$SLUG_ARG"
else
  URL="$(git remote get-url origin 2>/dev/null || true)"
  [ -z "$URL" ] && { echo "✖ 未设 origin 远程，且未指定 owner/repo"; exit 1; }
  SLUG="$(echo "$URL" | sed -E 's#^git@github\.com:##; s#^https://github\.com/##; s#\.git$##')"
  echo "$URL" | grep -q github.com || { echo "✖ origin 不是 github.com 远程: $URL"; exit 1; }
fi

# ---- 2) 身份守卫：隐私邮箱，防回退泄漏 ----
CUR_EMAIL="$(git config user.email || true)"
CUR_NAME="$(git config user.name || true)"
WANT_NAME="${GH_NAME:-ZEO}"
if [ -z "${GH_EMAIL:-}" ]; then
  # 从 gh api user 动态取 id+login（api.github.com 不走代理也通）
  GH_EMAIL="$("$GH" api user --jq '"\(.id)+\(.login)@users.noreply.github.com"' 2>/dev/null || true)"
fi
[ -z "$GH_EMAIL" ] && GH_EMAIL="85879+aispin@users.noreply.github.com"
if [ "$CUR_EMAIL" != "$GH_EMAIL" ] || [ "$CUR_NAME" != "$WANT_NAME" ]; then
  echo "⚠ 身份非隐私配置（当前: ${CUR_NAME:-<空>} <${CUR_EMAIL:-<空>}>），已重设仓库级身份: $WANT_NAME <$GH_EMAIL>"
  git config user.name "$WANT_NAME"
  git config user.email "$GH_EMAIL"
fi

# ---- 3) 统一推送：代理 + 禁用 credential.helper + token 内嵌 ----
#    -c credential.helper= （置空）必须带：否则命中 /opt/homebrew/etc/gitconfig 的
#    osxkeychain → 沙箱拦截钥匙串 → 弹窗。gh auth token 已存明文 hosts.yml，只读文件不碰钥匙串。
#    HTTP 版本做两档尝试：HTTP/1.1 是历史稳定档；2026-10-01 实测它也会间歇
#    "send-pack: unexpected disconnect"，同通道 HTTP/2 反而成功 → 失败后自动换档重试。
#    每次尝试后都核对远端 sha，唯一可信判据（git 输出会假失败/假成功）。
TOKEN="$("$GH" auth token)"
[ -z "$TOKEN" ] && { echo "✖ gh auth token 为空（检查 ~/.config/gh/hosts.yml 或 gh auth login）"; exit 1; }

LOCAL_SHA="$(git rev-parse HEAD)"
PUSH_URL="https://${GH_USER:-aispin}:${TOKEN}@github.com/${SLUG}.git"
check_remote() {
  git -c "http.proxy=$PROXY" -c credential.helper= \
    ls-remote "https://github.com/${SLUG}.git" "refs/heads/${BRANCH}" 2>/dev/null | awk '{print $1}'
}

OK=0
for VER in HTTP/1.1 ""; do
  LABEL="${VER:-HTTP/2(默认)}"
  echo "▶ git push (proxy=$PROXY version=${LABEL}) → github.com/$SLUG $BRANCH"
  git -c "http.proxy=$PROXY" ${VER:+-c "http.version=$VER"} -c credential.helper= \
       push "$PUSH_URL" "$BRANCH" 2>&1 || echo "⚠ push 命令报错（可能是假失败，以 sha 为准）"
  for i in 1 2 3; do
    REMOTE_SHA="$(check_remote)" && [ -n "$REMOTE_SHA" ] && break
    [ "$i" -lt 3 ] && sleep 1    # 代理偶发 SSL_ERROR_SYSCALL → 重试
  done
  if [ -n "$REMOTE_SHA" ] && [ "$REMOTE_SHA" = "$LOCAL_SHA" ]; then
    echo "✓ 远端已核对一致: ${REMOTE_SHA}（${SLUG}@${BRANCH}，via ${LABEL}）"
    OK=1
    break
  fi
done
if [ "$OK" -ne 1 ]; then
  echo "✖ 两档 HTTP 版本均未核对一致: local=$LOCAL_SHA remote=${REMOTE_SHA:-<空>}"
  echo "  gh api repos/${SLUG}/commits?per_page=1 --jq '.[0].sha'   # API 通道可作旁证"
  exit 1
fi
