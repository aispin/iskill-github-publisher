/* ============================================================================
 * iskill-github-publisher · 落地页内容
 * 事实来源：SKILL.md / README.md / scripts/{publish,gh-push}.sh（行数实测）
 * platform: "macos"（依据 PLATFORM-MATRIX.md：全是 bash + 写死 /opt/homebrew/bin/gh
 *           + osxkeychain 处理）→ FAQ 第一条把限制讲清楚
 * showcase: 仓库无真实截图 → items: []
 * ==========================================================================*/
window.PROMO = {
  name: "ISKILL-GITHUB-PUBLISHER",
  brand: "#6e40c9",
  brand2: "#2ea44f",
  repo: "https://github.com/aispin/iskill-github-publisher",
  repoLabel: "aispin/iskill-github-publisher",

  platform: "macos",
  license: "MIT",

  lang: {
    zh: {
      meta: {
        title: "ISKILL-GITHUB-PUBLISHER · 把本地 skill 一键发上 GitHub",
        description: "统一 iskill- 前缀、隐私邮箱提交、gh 建仓、HTTPS+token 推送，再交给 SkillHub 认领——内置一次真实发布踩过的坑。仅 macOS。"
      },
      a11y: { skip: "跳到主要内容" },
      ui: { copy: "复制", copied: "已复制", failed: "复制失败" },
      nav: { features: "能力", shots: "截图", how: "上手", faq: "问答" },

      hero: {
        badge: "AI 技能",
        titlePre: "把本地 skill ",
        titleAccent: "一键发上 GitHub",
        titlePost: "",
        sub: "统一 iskill- 前缀、隐私邮箱提交、gh 建仓、HTTPS + token 推送，再交给你去 SkillHub 认领——内置一次真实发布踩过的坑。",
        ctaPrimary: "复制安装提示词",
        ctaSecondary: "看源码",
        meta1: "bash 脚本",
        meta2: "内置踩坑清单",
        meta3: "MIT 许可"
      },
      terminal: {
        title: "zsh — iskill-github-publisher",
        lines: [
          [{ t: "$ ", c: "p" }, { t: "bash scripts/publish.sh --src ~/.workbuddy/skills/my-skill --dry-run", c: "k" }],
          [{ t: "✓ ", c: "p" }, { t: "快照 + commit 完成（未碰 GitHub）", c: "s" }],
          [{ t: "$ ", c: "p" }, { t: "bash scripts/publish.sh --src ~/.workbuddy/skills/my-skill --desc \"一句话简介\"", c: "k" }],
          [{ t: "✓ ", c: "p" }, { t: "https://github.com/aispin/iskill-my-skill", c: "s" }]
        ]
      },

      stats: [
        { value: "4", label: "处命名必须一致", note: "仓库名 / 本地目录 / active 目录 / SKILL.md 的 name" },
        { value: "12 条", label: "内置踩坑清单", note: "gh 假失败、RPC 408、身份回退…" },
        { value: "2 个", label: "bash 脚本入口", note: "publish.sh（131 行）+ gh-push.sh（103 行）" },
        { value: "0 弹窗", label: "HTTPS + token 推送", note: "token 读明文 hosts.yml，不碰 osxkeychain" }
      ],

      compare: {
        eyebrow: "对比",
        title: "手动发布 vs 交给脚本",
        sub: "",
        before: {
          title: "手动发布",
          items: [
            "仓库名 / 目录名 / active 名 / SKILL.md 的 name 到处对不齐",
            "gh repo create --push 静默失败，不知道到底建没建成",
            "commit 回退全局真邮箱，一推就泄漏"
          ]
        },
        after: {
          title: "交给脚本",
          items: [
            "四处前缀一次统一，自动补 iskill-",
            "建仓与推送彻底拆开，失败可分辨",
            "提交身份守卫，自动改成 GitHub 隐私邮箱"
          ]
        }
      },

      features: {
        eyebrow: "能力",
        title: "它能做什么",
        sub: "",
        items: [
          { icon: "github", title: "一键建仓 + 推送", desc: "publish.sh 算名 → 快照 → 改 SKILL.md 的 name → git init/commit → gh 建公开仓库 → 推 main。" },
          { icon: "branch", title: "统一 iskill- 前缀", desc: "仓库名、本地目录、active 目录、SKILL.md 的 name 四处一致；--prefix 可换成 team- 等自定义前缀。" },
          { icon: "shield", title: "提交身份守卫", desc: "commit 前核对 user.email 是否为 GitHub 隐私邮箱，不一致自动纠偏，杜绝真邮箱泄漏。" },
          { icon: "bolt", title: "专用推送通道", desc: "HTTPS + 代理（10080）+ token 内嵌 + credential.helper 置空，避开直连失败与钥匙串弹窗。" },
          { icon: "refresh", title: "多轮重试 + sha 核对", desc: "代理会间歇 408 / 断流，脚本多轮重试，并以 git ls-remote 的远端 sha 为唯一判据。" },
          { icon: "layers", title: "内置 12 条踩坑", desc: "gh repo create 假失败、Everything up-to-date 误导、文件名含 [] 的 pathspec 坑…全写进文档。" }
        ]
      },

      showcase: {
        eyebrow: "实拍",
        title: "看一眼真东西",
        sub: "",
        items: []
      },

      steps: {
        eyebrow: "上手",
        title: "三步跑起来",
        sub: "命令由 agent 跑，你只说要什么、看结果。",
        items: [
          { title: "交给 AI 装", desc: "把这句话粘进对话框，agent 会自己拉代码、读文档，再告诉你用法。", codeKey: "install" },
          { title: "说要发布哪个技能", desc: "建仓、推送、远端 sha 核对都是它做；推送通道与隐私邮箱的坑它已经自带。", codeName: "prompt", code: "把 ~/.workbuddy/skills/iskill-xxx 发布到 GitHub，仓库名 iskill-xxx，再准备 SkillHub 认领。" },
          { title: "本人去点认领", desc: "推送它做完了，SkillHub 认领要你登录点一下——这是整个流程里唯一必须由本人操作的步骤。" }
        ]
      },


      faq: {
        eyebrow: "问答",
        title: "常见问题",
        items: [
          { q: "Windows 上能用吗？", a: "不能直接用。脚本全是 <b>bash</b>，且写死了 <code>/opt/homebrew/bin/gh</code>、用 <code>-c credential.helper=</code> 处理 macOS 的 osxkeychain——Windows 既没有 <code>/opt/homebrew</code>，也没有这套登录钥匙串。<b>替代方案</b>：在 Git Bash / WSL 里执行，或按 SKILL.md「手动步骤」自己拼命令（<code>gh repo create</code> 建仓 + <code>git push</code> 推送）；推送配方本身是跨平台的，只是本技能没提供 Windows 脚本。" },
          { q: "需要先装什么？", a: "已装 Homebrew 版 <code>gh</code>（<code>/opt/homebrew/bin/gh</code>）并完成 <code>gh auth login</code>；git 走 HTTPS + 本机代理（默认 <code>127.0.0.1:10080</code>）。" },
          { q: "会把我的真实邮箱推上去吗？", a: "不会。脚本内置身份守卫，commit 前把 <code>user.email</code> 校成 <code>&lt;id&gt;+&lt;login&gt;@users.noreply.github.com</code> 隐私邮箱，不一致就自动重设。" },
          { q: "token 会不会写进仓库或 remote？", a: "不会。token 只内嵌在单次 push 命令里，<code>git remote</code> 存的是干净 HTTPS URL；来源 <code>~/.config/gh/hosts.yml</code> 权限 600。" },
          { q: "推送报 408 / Everything up-to-date 怎么办？", a: "这是代理间歇断流。<b>Everything up-to-date 是误导</b>——紧跟 RPC 失败时远端其实还是空的。脚本会多轮重试（3–5 轮）并以 <code>git ls-remote</code> 的远端 sha 为准；也可加大 <code>http.postBuffer</code>。" },
          { q: "SkillHub 认领脚本能代劳吗？", a: "不能。上架第二步「从 GitHub 导入 / 认领」必须在浏览器里完成：登录 SkillHub → 授权 GitHub → 选仓库 → 填信息 → 等审核（1–3 工作日）。" }
        ]
      },

      cta: { title: "把 skill 发出去，别再手工搬", desc: "粘一下安装提示词，dry-run 一遍就能确认发布流程。", primary: "去 GitHub 看看", secondary: "复制安装提示词" },
      footer: { license: "MIT 许可", madeWith: "由 iskill-promo-page 生成" }
    },

    en: {
      meta: {
        title: "ISKILL-GITHUB-PUBLISHER · Ship a local skill to GitHub in one go",
        description: "Unified iskill- prefix, privacy-email commits, gh repo creation and HTTPS+token pushes, ready for SkillHub claiming — with a real publish post-mortem baked in. macOS only."
      },
      a11y: { skip: "Skip to content" },
      ui: { copy: "Copy", copied: "Copied", failed: "Copy failed" },
      nav: { features: "Features", shots: "Screens", how: "Get started", faq: "FAQ" },

      hero: {
        badge: "AI skill",
        titlePre: "Ship a local skill to GitHub ",
        titleAccent: "in one go",
        titlePost: "",
        sub: "Unified iskill- prefix, privacy-email commits, gh repo creation, HTTPS + token pushes — then a hand-off to SkillHub claiming. Built from one real publish with every trap documented.",
        ctaPrimary: "Copy install prompt",
        ctaSecondary: "View source",
        meta1: "bash scripts",
        meta2: "Traps documented",
        meta3: "MIT licensed"
      },
      terminal: {
        title: "zsh — iskill-github-publisher",
        lines: [
          [{ t: "$ ", c: "p" }, { t: "bash scripts/publish.sh --src ~/.workbuddy/skills/my-skill --dry-run", c: "k" }],
          [{ t: "✓ ", c: "p" }, { t: "snapshot + commit done (GitHub untouched)", c: "s" }],
          [{ t: "$ ", c: "p" }, { t: "bash scripts/publish.sh --src ~/.workbuddy/skills/my-skill --desc \"one-liner\"", c: "k" }],
          [{ t: "✓ ", c: "p" }, { t: "https://github.com/aispin/iskill-my-skill", c: "s" }]
        ]
      },

      stats: [
        { value: "4", label: "names that must match", note: "repo / local dir / active dir / SKILL.md name" },
        { value: "12", label: "documented pitfalls", note: "gh silent failure, RPC 408, identity fallback…" },
        { value: "2", label: "bash entry points", note: "publish.sh (131 lines) + gh-push.sh (103 lines)" },
        { value: "0 popups", label: "HTTPS + token pushes", note: "token read from plaintext hosts.yml, no osxkeychain" }
      ],

      compare: {
        eyebrow: "Comparison",
        title: "Manual vs scripted publishing",
        sub: "",
        before: {
          title: "Publishing by hand",
          items: [
            "Repo name / dir name / active name / SKILL.md name drift apart",
            "gh repo create --push fails silently — did it even create the repo?",
            "Commit falls back to your real global email and leaks it on push"
          ]
        },
        after: {
          title: "With the script",
          items: [
            "All four names aligned at once, iskill- auto-applied",
            "Repo creation and push split apart, so failures are distinguishable",
            "Commit identity guard rewrites to your GitHub privacy email"
          ]
        }
      },

      features: {
        eyebrow: "Features",
        title: "What it does",
        sub: "",
        items: [
          { icon: "github", title: "Create repo + push", desc: "publish.sh computes the name → snapshots → rewrites SKILL.md's name → git init/commit → creates a public repo with gh → pushes main." },
          { icon: "branch", title: "Unified iskill- prefix", desc: "Repo, local dir, active dir and SKILL.md name all kept identical; --prefix swaps in your own, e.g. team-." },
          { icon: "shield", title: "Commit identity guard", desc: "Checks user.email is your GitHub privacy address before committing, auto-correcting otherwise to prevent real-email leaks." },
          { icon: "bolt", title: "A dedicated push channel", desc: "HTTPS + proxy (10080) + inline token + credential.helper emptied, avoiding direct-connection failures and keychain popups." },
          { icon: "refresh", title: "Retries + sha verification", desc: "The proxy drops connections with 408s; the script retries and treats git ls-remote's remote sha as the only source of truth." },
          { icon: "layers", title: "12 pitfalls baked in", desc: "gh repo create's fake failure, the misleading Everything up-to-date, [] in filenames tripping pathspec… all documented." }
        ]
      },

      showcase: {
        eyebrow: "Screens",
        title: "See the real thing",
        sub: "",
        items: []
      },

      steps: {
        eyebrow: "Get started",
        title: "Up and running in three steps",
        sub: "The agent runs the commands. You say what you want and check the result.",
        items: [
          { title: "Let your agent install it", desc: "Paste the line into the chat — it clones the repo, reads the docs, and tells you how to use it.", codeKey: "install" },
          { title: "Say which skill to publish", desc: "Repo creation, push and remote-sha verification are on it — it already knows the proxy and private-email pitfalls.", codeName: "prompt", code: "Publish ~/.workbuddy/skills/iskill-xxx to GitHub as iskill-xxx and prepare it for SkillHub claiming." },
          { title: "Claim it yourself", desc: "Pushing is done; claiming on SkillHub needs your own login. It's the only step that can't be delegated." }
        ]
      },


      faq: {
        eyebrow: "FAQ",
        title: "Frequently asked",
        items: [
          { q: "Does it run on Windows?", a: "Not directly. The scripts are all <b>bash</b>, with <code>/opt/homebrew/bin/gh</code> hard-coded and <code>-c credential.helper=</code> handling macOS's osxkeychain — Windows has neither <code>/opt/homebrew</code> nor that login keychain. <b>Workarounds</b>: run it under Git Bash / WSL, or follow the SKILL.md \"manual steps\" to compose the commands yourself (<code>gh repo create</code> then <code>git push</code>). The push recipe itself is cross-platform; this skill just ships no Windows script." },
          { q: "What must be installed first?", a: "A Homebrew <code>gh</code> (<code>/opt/homebrew/bin/gh</code>) with <code>gh auth login</code> done; git over HTTPS through a local proxy (default <code>127.0.0.1:10080</code>)." },
          { q: "Will it push my real email?", a: "No. The identity guard checks <code>user.email</code> before committing and rewrites it to <code>&lt;id&gt;+&lt;login&gt;@users.noreply.github.com</code> if needed." },
          { q: "Does the token end up in the repo or remote?", a: "No. The token is only inlined into a single push command; <code>git remote</code> keeps a clean HTTPS URL, and the source <code>~/.config/gh/hosts.yml</code> is mode 600." },
          { q: "What about 408 / Everything up-to-date errors?", a: "That is the proxy dropping connections. <b>Everything up-to-date is misleading</b> — right after an RPC failure the remote is actually empty. The script retries (3–5 rounds) and trusts <code>git ls-remote</code>'s remote sha; raising <code>http.postBuffer</code> also helps." },
          { q: "Does it handle the SkillHub claim?", a: "No. The second step — import/claim from GitHub — must be done in a browser: log into SkillHub, authorise GitHub, pick the repo, fill the form, then wait for review (1–3 working days)." }
        ]
      },

      cta: { title: "Get your skill out there", desc: "Paste the install prompt and dry-run the whole publish flow.", primary: "Open on GitHub", secondary: "Copy install prompt" },
      footer: { license: "MIT licensed", madeWith: "Built with iskill-promo-page" }
    }
  }
};
