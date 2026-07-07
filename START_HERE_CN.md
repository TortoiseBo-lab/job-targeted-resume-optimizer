# 中文零代码上手指南

这个仓库不是一个可以直接点开使用的网站。它是一套公开知识包：把目标公司、目标岗位、JD、候选人经历和简历模板选择方法整理成 AI 可以读取的规则。

你可以把它理解成：给 ChatGPT / Claude / Gemini 使用的一套“目标岗位驱动简历优化说明书”。

## 最简单用法

打开下面这个文件，复制里面的 Prompt：

- [prompts/chatgpt-copy-paste-cn.md](prompts/chatgpt-copy-paste-cn.md)

然后在 ChatGPT、Claude 或 Gemini 里发送：

1. 这段 Prompt。
2. 你的原始简历内容。
3. 目标公司。
4. 目标岗位。
5. 目标岗位 JD。

AI 会先做岗位信号分析，再做经历匹配、缺口判断、模板路线选择，最后生成可投递的 Word/PDF 简历和单独优化报告。

## 更强一点的用法

如果你使用的 AI 支持上传文件，把这些文件一起上传：

- `knowledge-base/playbooks/targeted-resume-playbook.md`
- `knowledge-base/templates/catalog.json`
- `knowledge-base/index.json`

再根据目标方向补充相关规则文件。例如申请 Google Software Engineer，可以加：

- `knowledge-base/companies/google/rules.json`
- `knowledge-base/industries/software-engineering/rules.json`
- `knowledge-base/styles/big-tech/rules.json`

如果申请投行，可以加：

- `knowledge-base/industries/investment-banking/rules.json`
- `knowledge-base/styles/investment-banking/rules.json`

如果申请咨询，可以加：

- `knowledge-base/companies/mckinsey/rules.json`
- `knowledge-base/industries/consulting/rules.json`
- `knowledge-base/styles/consulting/rules.json`

## 你应该期待什么结果

一次好的输出应该包含：

1. 目标岗位信号拆解。
2. 你的经历与 JD 的直接匹配、可迁移匹配和缺口。
3. 推荐的简历结构和模板路线。
4. 可投递的最终版 Word/PDF 简历。
5. 每处修改的理由。
6. 还需要补问你的问题，比如指标、规模、工具、业务结果。

## 重要原则

这套方法不能替你编造经历。它的强点是：

- 从目标公司和目标岗位反推简历重点。
- 帮你选择应该突出哪些经历。
- 把泛泛的 bullet 改成更像目标岗位语言的表达。
- 明确哪些地方证据不足，应该继续补材料。

不要让 AI 伪造公司、岗位、日期、奖项、工具、指标或结果。缺什么就让它列成问题问你。

## 给项目作者的使用方式

如果你只是想自己测试这个项目是否有用，推荐从这个最小案例开始：

1. 选一个真实 JD。
2. 选一个已有简历。
3. 用 `prompts/chatgpt-copy-paste-cn.md` 跑一次。
4. 再上传对应规则文件跑第二次。
5. 比较两次输出：第二次应该更像“目标公司和岗位定制”，而不是普通简历润色。
