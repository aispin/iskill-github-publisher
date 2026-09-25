# iskill-github-publisher

把本地 WorkBuddy **AI skill** 一键发布到 GitHub：自动统一 `iskill-` 前缀、改用 SSH 远程推送，并准备好到 **SkillHub** 认领。

本 skill 由一个真实的发布流程沉淀而来，内置了当时踩到的坑（见文末「踩坑清单」），避免你重蹈覆辙。

---

## 它能做什么

给定一个本地 skill 目录（含 `SKILL.md`），它自动完成：

1. 计算 `iskill-` 名（目录名缺前缀时自动补上）
2. 复制 `SKILL.md` / `README.md` / `app/` / `scripts/` 到一份仓库快照
3. 把快照里 `SKILL.md` 的 `name:` 改写为统一的 `iskill-` 名
4. `git init` + `commit`（分支统一 `main`，作者用 GitHub 隐私邮箱，不暴露真邮箱）
5. `gh repo create` 建公开仓库（不带 `--push`，规避静默失败）
6. 把远程改成 **SSH** 再 `git push`
7. 打印仓库地址 —— 之后即可到 SkillHub 认领

---

## iskill- 命名约定（四处一致）

一个 AI skill 的以下四处必须统一用 `iskill-` 前缀：

| 位置 | 示例 |
|---|---|
| GitHub 仓库名 | `iskill-english-scene-app` |
| 本地 git 目录名 | `/Users/lv/WorkBuddy/iskill-english-scene-app/` |
| `~/.workbuddy/skills/` 下的 active 目录名 | `~/.workbuddy/skills/iskill-english-scene-app/` |
| `SKILL.md` 的 `name:` 字段 | `name: iskill-english-scene-app` |

> 改名时四处一起改；只改其中几处会出现「目录名与 WorkBuddy 调用名不一致」的混乱。

> **前缀可自定义**：脚本默认前缀为 `iskill-`，可用 `--prefix <前缀>` 覆盖（如 `--prefix team` → 仓库名 `team-xxx`）。不传 `--prefix` 时一律走 `iskill-` 约定。

---

## 前置条件

- 本机已装 `gh`（`/opt/homebrew/bin/gh`），且 `gh auth login` 完成（token 含 `repo` 权限）
- git 通过 **SSH** 访问 GitHub（`ssh -T git@github.com` 可认证）
- 若要发布到 SkillHub，**仓库必须为 Public**

---

## 用法

```bash
bash ~/.workbuddy/skills/iskill-github-publisher/scripts/publish.sh \
  --src ~/.workbuddy/skills/<原名字> \
  [--name <短名>]            # 缺省=原目录名自动加前缀
  [--prefix <前缀>]          # 缺省 iskill（即 iskill-），可用其它前缀覆盖，如 team
  [--out-base ~/WorkBuddy]   # 快照输出基目录，缺省 $HOME/WorkBuddy
  [--desc "一句话简介"]       # 仓库描述
  [--rename-active]          # 额外把 active 目录也改名（改变 WorkBuddy 调用名，谨慎）
  [--dry-run]                # 只做快照+commit，不建仓库不推送（先验证）
```

常用组合：

```bash
# 先验证快照是否正确（不碰 GitHub）
bash ~/.workbuddy/skills/iskill-github-publisher/scripts/publish.sh \
  --src ~/.workbuddy/skills/my-skill --dry-run

# 确认无误后正式发布
bash ~/.workbuddy/skills/iskill-github-publisher/scripts/publish.sh \
  --src ~/.workbuddy/skills/my-skill \
  --desc "WorkBuddy 技能：……"
```

---

## 发布后：到 SkillHub 认领

1. 登录 SkillHub（WorkBuddy 内：专家 → 技能 → 发布；或 skillhub.cn）
2. 选「**从 GitHub 导入 / 认领**」→ 授权 GitHub → 选中该仓库
3. 填信息：名称 / 简介 / 使用示例 / 分类（如「教育 / 语言学习」）/ 权限声明（写「本地文件读写 + 执行本地脚本」，本类 skill 通常无网络权限）
4. 提交审核（1–3 工作日，查安全 / 稳定 / 合规）→ 通过后上架，全平台可搜可装

---

## 踩坑清单（重要，别再踩）

1. **gh 路径**：非交互 shell 里 `gh` 可能 `command not found`，一律用绝对路径 `/opt/homebrew/bin/gh`（脚本已自动回退）。
2. **`gh repo create --push` 会静默失败**：改用 `gh repo create <名> --public --source=. --remote=origin --confirm`（不带 `--push`）先建仓库，再手动 `git push`。
3. **远程改 SSH**：`gh repo create` 默认设 https 远程，但一般用 SSH，建完改 `git remote set-url origin git@github.com:<账号>/<名>.git` 再 push。
4. **账号别写死**：从 `gh auth status` 解析账号，脚本自动取。
5. **幂等**：仓库已存在时 `gh repo create` 会报错，先探测，存在则复用。
6. **改 active 目录名会改 WorkBuddy 调用名**：重命名 `~/.workbuddy/skills/<名>` 后调用名随之变，可能需重新扫描；这是可选步骤，需确认。
7. **隐私**：提交/发布的 git 作者统一用 GitHub 隐私邮箱 `<id>+<login>@users.noreply.github.com`，**不要把真实邮箱写进会被推送的文件**。

---

## 许可证

MIT（随你心意）。
