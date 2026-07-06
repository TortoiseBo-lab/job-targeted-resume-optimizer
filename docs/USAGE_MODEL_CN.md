# 这个项目到底怎么用

你可以把这个项目理解成四层。

## 第一层：GitHub 仓库

GitHub 不是产品网站，也不是用户点一下就生成简历的地方。  
GitHub 是公开放置这套能力的地方，里面包含：

- 简历优化方法论。
- 公司、行业、学校、风格规则。
- 67 个模板路线。
- Claude Code skill。
- Prompt。
- Word/PDF 导出脚本。

它像一个公开的能力包。

## 第二层：普通用户用 Prompt

最简单的使用方式是：

1. 打开 `prompts/chatgpt-copy-paste-cn.md`。
2. 复制里面的 Prompt。
3. 粘贴到 ChatGPT、Claude 或 Gemini。
4. 再粘贴原始简历、目标公司、目标岗位和 JD。

这种模式不需要安装任何东西。

适合：

- 完全不懂代码的人。
- 只想先试试效果的人。
- 想快速得到一版定制简历草稿的人。

## 第三层：Claude Code Skill

更完整的模式是让用户下载这个仓库，并在仓库里打开 Claude Code：

```bash
git clone https://github.com/TortoiseBo-lab/job-targeted-resume-optimizer.git
cd job-targeted-resume-optimizer
claude
```

然后在 Claude Code 里输入：

```txt
/job-targeted-resume-optimizer
```

这种模式下，Claude Code 会读取仓库里的 `knowledge-base`，再根据简历和 JD 做更系统的定制。

适合：

- 会用 Claude Code 的用户。
- 想把简历、JD、输出文件都放在本地的人。
- 想生成 Markdown、Word、PDF 文件的人。

## 第四层：Word 和 PDF 导出

Claude Code skill 先生成 Markdown 简历文件，例如：

```txt
outputs/google-swe-intern-targeted-resume.md
```

然后运行：

```bash
npm run export -- --input outputs/google-swe-intern-targeted-resume.md
```

会生成：

```txt
outputs/google-swe-intern-targeted-resume.docx
outputs/google-swe-intern-targeted-resume.pdf
```

你也可以先试内置示例：

```bash
npm run export:example
```

## 一句话解释

这个项目不是单一网页，而是一套可以被多种 AI 工具调用的简历制作能力。

```txt
普通人：复制 Prompt 到 ChatGPT 使用
Claude Code 用户：安装/打开仓库，用 /job-targeted-resume-optimizer
开发者：读取 knowledge-base 接入自己的产品
需要正式文件：用 export 脚本生成 Word 和 PDF
```

## 最推荐的真实使用流程

1. 用户准备原始简历和目标 JD。
2. 用 Claude Code skill 生成目标岗位定制 Markdown 简历。
3. 检查是否有 AI 标注的 `[Need detail: ...]`。
4. 用户补充缺失指标和细节。
5. 再生成一版最终 Markdown。
6. 运行导出脚本生成 Word 和 PDF。
