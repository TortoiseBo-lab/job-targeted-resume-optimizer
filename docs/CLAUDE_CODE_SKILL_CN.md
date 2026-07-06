# Claude Code Skill 安装与使用

这个仓库可以作为 Claude Code skill 使用。装好后，用户可以在 Claude Code 里输入：

```txt
/job-targeted-resume-optimizer
```

然后让 Claude Code 根据简历、目标公司、目标岗位和 JD 直接生成定制简历草稿与优化报告。

## 这是什么

Claude Code skill 可以理解成“给 Claude Code 装一个专门能力”。  
这个 skill 会告诉 Claude Code：

- 去读取本仓库的 `knowledge-base`。
- 根据目标公司和目标岗位选择规则。
- 根据 JD 拆解岗位信号。
- 根据候选人真实经历改写简历。
- 输出简历草稿、修改理由、证据缺口和补问问题。

## 最简单安装方式

用户先把仓库下载到电脑：

```bash
git clone https://github.com/TortoiseBo-lab/job-targeted-resume-optimizer.git
cd job-targeted-resume-optimizer
```

然后在这个目录里打开 Claude Code：

```bash
claude
```

因为仓库里已经包含：

```txt
.claude/skills/job-targeted-resume-optimizer/SKILL.md
```

Claude Code 会把它识别成项目级 skill。

## 如何使用

在 Claude Code 里输入：

```txt
/job-targeted-resume-optimizer
```

然后继续输入你的需求，例如：

```txt
请帮我针对 Google Software Engineer Intern 优化简历。

我的简历在：
./inputs/resume.md

JD 在：
./inputs/google-swe-intern-jd.md

目标市场：US
输出 Markdown，并尽可能告诉我还缺哪些量化信息。
```

Claude Code 会读取仓库知识库，并默认生成：

```txt
outputs/google-software-engineer-intern-targeted-resume.md
```

## 推荐文件结构

为了让用户更容易使用，可以这样放材料：

```txt
job-targeted-resume-optimizer/
  inputs/
    resume.md
    target-jd.md
  outputs/
```

如果没有 `inputs` 和 `outputs` 文件夹，可以创建：

```bash
mkdir -p inputs outputs
```

## 一句话使用模板

复制这段到 Claude Code：

```txt
/job-targeted-resume-optimizer

请帮我制作一版目标岗位定制简历。

我的简历文件：./inputs/resume.md
目标岗位 JD：./inputs/target-jd.md
目标公司：
目标岗位：
目标市场：

请输出：
1. 定制后的英文简历 Markdown
2. 岗位信号分析
3. 经历匹配表
4. 修改理由
5. 还需要我补充的问题
```

## 如果用户想全局安装

如果用户希望在任何 Claude Code 项目里都能用这个 skill，可以把 skill 复制到用户级 Claude Code skills 目录：

```bash
mkdir -p ~/.claude/skills
cp -R .claude/skills/job-targeted-resume-optimizer ~/.claude/skills/
```

但注意：只复制 skill 文件时，Claude Code 不一定能自动读取本仓库的 `knowledge-base`。  
更稳的方式是仍然在本仓库目录里运行 Claude Code，或者启动 Claude Code 时把本仓库作为额外目录加入。

## 适合用户说的话

用户不需要懂 GitHub。可以这样理解：

1. 下载这个仓库。
2. 在仓库里打开 Claude Code。
3. 把简历和 JD 放进 `inputs`。
4. 输入 `/job-targeted-resume-optimizer`。
5. Claude Code 会在 `outputs` 里生成目标岗位定制简历。

