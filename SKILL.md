---
name: iskill-github-publisher
description: 把本地 AI skill 发布到 GitHub（统一 iskill- 前缀、gh 建仓库、SSH 推送），并准备 SkillHub 认领。当用户想把某个 WorkBuddy skill 上架到技能市场、用 GitHub 仓库认领 SkillHub、或批量管理 iskill- 系列仓库时使用。当用户提到「发布 skill 到 GitHub」「上架 SkillHub」「iskill 前缀」「github 认领」时使用。
agent_created: true
---

# iskill-github-publisher

把本地 WorkBuddy skill 一键发布到 GitHub，统一 `iskill-` 前缀，并准备好到 SkillHub 认领。
本 skill 由一次真实的发布流程沉淀而来，内置了当时踩到的坑（见「踩坑清单」）。

## 何时用
- 用户写/改完一个 skill，想把它推到 GitHub（为了 SkillHub 认领或备份/协作）。
- 用户要批量管理 `iskill-` 系列 skill 的命名与仓库。
- 用户提到「上架 SkillHub」「GitHub 认领 skill」。

## iskill- 命名约定（四者一致）
一个 AI skill 的以下四处必须统一用 `iskill-` 前缀：
1. **GitHub 仓库名** —— 例 `iskill-english-scene-app`
2. **本地 git 目录名** —— 例 `/Users/lv/WorkBuddy/iskill-english-scene-app/`
3. **`~/.workbuddy/skills/` 下的 active 目录名** —— 例 `~/.workbuddy/skills/iskill-english-scene-app/`
4. **`SKILL.md` 里的 `name:` 字段** —— 例 `name: iskill-english-scene-app`

> 改名时四处一起改；只改其中几处会在 WorkBuddy 里出现「目录名与调用名不一致」的混乱。

> **前缀可自定义**：脚本默认前缀为 `iskill-`，可用 `--prefix <前缀>` 覆盖（如 `--prefix team` → 仓库名 `team-xxx`）。不传 `--prefix` 时一律走 `iskill-` 约定。

## 前置条件
- 本机已装 `gh`：`/opt/homebrew/bin/gh`（**非交互 shell 默认 PATH 不含 Homebrew，调用必须用绝对路径**；脚本已自动回退到绝对路径）。
- `gh auth login` 已完成（账号如 `aispin`，token 含 `repo` 权限）。
- git 通过 **SSH** 访问 GitHub（密钥已配置，`ssh -T git@github.com` 可认证）。
- 若 skill 尚未有 `README.md`，建仓库前补一份（公开仓库展示 + SkillHub 认领都更顺）。

## 踩坑清单（重要，别再踩）
1. **gh 路径**：非交互 shell 里 `gh` 可能 `command not found`。一律用 `/opt/homebrew/bin/gh`（脚本已处理）。
2. **`gh repo create --push` 会静默失败**：之前一次空输出、没建仓库、没设远程。改用 `gh repo create <名> --public --source=. --remote=origin --confirm`（**不带 --push**）先建仓库，再手动 `git push`。
3. **远程改 SSH**：`gh repo create` 默认把远程设成 https，但用户用 SSH。建完改 `git remote set-url origin git@github.com:<账号>/<名>.git` 再 push。
4. **账号别写死**：从 `gh auth status` 解析 `Logged in to github.com account <账号>`，脚本自动取。
5. **幂等**：仓库已存在时 `gh repo create` 会报错，先 `gh repo view <账号>/<名>` 探测，存在则复用。
6. **改 active 目录名会改 WorkBuddy 调用名**：重命名 `~/.workbuddy/skills/<名>` 后，调用名随之改变，可能需要重新扫描/触发。这是可选步骤，需用户确认。
7. **`gh repo create` 可能「假失败」**（2026-09-26 实踩）：返回 `GraphQL: Name already exists on this account`，但仓库其实已创建成功（描述、可见性均正确，远程也可能已设好）。遇到该报错先用 `gh repo view <账号>/<名> --json createdAt,description` 确认实际状态，别盲目重试或换名。
8. **`.gitignore` 别用裸 `app/` 这类宽模式**：会连 `templates/app/` 一起排除，导致只提交了半个仓库还不易察觉。提交后必须 `git ls-files | wc -l` 核对文件数（或 `git ls-files | head` 抽查），写法用锚定根目录的 `/app/`。
9. **沙箱环境推送需授权**：git push / gh 网络操作可能被沙箱拦截，若失败需在授权后重跑（命令本身没问题）。
10. **文件名含 `[...]` 时 git 会当通配符**（2026-09-26 实踩）：视频号下载的测试 mp4 文件名形如 `标题 [UzFf...].mp4`，`git rm --cached *.mp4` 展开后，git 把文件名里的 `[...]` 解析成 pathspec 字符类而报 `did not match any files`。对这类文件名要用 `git ls-files -z | grep -z '\.mp4$' | xargs -0 git rm --cached` 这类 NUL 安全写法，或直接 `git filter-branch --index-filter 'git rm --cached --ignore-unmatch -q "*.mp4"'` 全历史清理。提交后务必用 `git ls-files | grep -i '\.mp4$'` 复核清干净。

## 用法（推荐：脚本）
```
bash ~/.workbuddy/skills/iskill-github-publisher/scripts/publish.sh \
  --src ~/.workbuddy/skills/<原名字> \
  [--name <短名>]            # 缺省=原目录名自动加前缀
  [--prefix <前缀>]          # 缺省 iskill（即 iskill-），可用其它前缀覆盖，如 team
  [--out-base ~/WorkBuddy]   # 快照输出基目录，缺省 $HOME/WorkBuddy
  [--desc "一句话简介"]       # 仓库描述
  [--rename-active]          # 额外把 active 目录也改名（改变调用名，谨慎）
  [--dry-run]                # 只做快照+commit，不建仓库不推送（用于验证）
```
脚本会自动：算目标名（缺省 `iskill-` 前缀，`--prefix` 可覆盖）→ 复制 SKILL.md/README.md/app/scripts 到快照 → 改写 SKILL.md 的 `name:` → git init+commit → gh 建仓库（不 push）→ 远程改 SSH → push → 打印地址。

## 手动步骤（排错/自定义时参考）
1. 决定仓库名 `iskill-<short>`；确认 GitHub 上无重名（`gh repo view <账号>/<名>` 应报 Not Found）。
2. 复制 skill 目录为 `/Users/lv/WorkBuddy/iskill-<short>/`，根放 `SKILL.md` + `README.md` + `app/` + `scripts/`。
3. 把 `SKILL.md` 的 `name:` 改成 `iskill-<short>`。
4. `cd` 进快照，`git init` → `git add -A` → `git commit`。
5. `/opt/homebrew/bin/gh repo create iskill-<short> --public --source=. --remote=origin --confirm`（**无 --push**）。
6. `git remote set-url origin git@github.com:<账号>/iskill-<short>.git`；`git push -u origin main`。
7. （可选）把 `~/.workbuddy/skills/<原>` 改名为 `iskill-<short>`，并同步改其 `SKILL.md` 的 `name:`。

## SkillHub 认领后续（需用户在浏览器完成）
登录 SkillHub（WorkBuddy 内：专家 → 技能 → 发布；或 skillhub.cn）→ 「**从 GitHub 导入/认领**」→ 授权 GitHub → 选中该仓库 → 填信息（名称/简介/使用示例/分类如「教育/语言学习」/权限声明写「本地文件读写 + 执行本地脚本」、无网络权限）→ 提交审核（1–3 工作日）→ 通过后上架，全平台可搜可装。
