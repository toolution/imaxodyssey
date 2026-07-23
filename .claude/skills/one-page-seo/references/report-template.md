# One Page SEO Report Template

Write the final report in Chinese and keep this section order. Replace placeholders with measured evidence. Omit no scored category.

```markdown
# On Page SEO 体检报告

- 页面：{canonical URL}
- 关键词：{primary keyword}
- 总分：{normalized score}/100（{grade} · {label}）
- 原始得分：{raw}/126
- 主题聚焦度：{focus}%
- 抓取：状态 {status} · 耗时 {time}ms · HTML {size}KB · 正文 {units} 词/字 · 内链 {internal} · 外链 {external} · 图片 {images}
- 当前 Title：{title}
- 当前 Description：{description}

## Meta 元信息({score}/25)
- [{status}] Title 标题({points}/6)：{evidence}
- [{status}] Meta Description 描述({points}/5)：{evidence}
- [{status}] Canonical 规范链接({points}/3)：{evidence}
- [{status}] Robots 收录指令({points}/3)：{evidence}
- [{status}] Viewport 移动适配({points}/3)：{evidence}
- [{status}] 字符编码声明({points}/2)：{evidence}
- [{status}] HTML lang 语言声明({points}/2)：{evidence}
- [{status}] Favicon 站点图标({points}/1)：{evidence}

## 内容质量({score}/19)
- [{status}] H1 主标题({points}/5)：{evidence}
- [{status}] 标题层级结构({points}/3)：{evidence}
- [{status}] 正文词数（1200~1800 为佳）({points}/5)：{evidence}
- [{status}] 渲染方式({points}/3)：{evidence}
- [ℹ] 需求承接方式：{interaction or CTA observation}
- [{status}] 文本/代码比({points}/3)：{evidence}

## 关键词优化({score}/40)
- [{status}] 主题聚焦度（页面是否围绕关键词展开）：{focus evidence}
- [{status}] 关键词出现在 Title({points}/8)：{evidence}
- [{status}] 关键词出现在 Description({points}/4)：{evidence}
- [{status}] 关键词出现在 H1({points}/8)：{evidence}
- [{status}] 关键词出现在 H2/H3({points}/3)：{evidence}
- [{status}] 关键词出现在 URL（域名或路径）({points}/2)：{evidence}
- [{status}] 关键词出现在开头 100 词({points}/3)：{evidence}
- [{status}] 关键词密度({points}/2)：{phrase count and density evidence}
- [{status}] 密度榜位置加权覆盖({points}/10)：{1-to-5-gram ranks and bucket scores}
- [ℹ] SERP 竞争（Sitelinks 信号）：{live evidence or 未验证}

## 链接({score}/7)
- [{status}] 站内链接({points}/3)：{evidence}
- [{status}] 锚文本质量({points}/3)：{evidence}
- [{status}] 外链 target=_blank 安全({points}/1)：{evidence}
- [ℹ] 站外链接：{external and nofollow counts}

## 图片与媒体({score}/8)
- [{status}] 图片 Alt 属性({points}/5)：{evidence}
- [{status}] 图片宽高声明（防布局抖动）({points}/2)：{evidence}
- [{status}] 图片懒加载({points}/1)：{evidence}

## 社交与结构化数据({score}/10)
- [{status}] Open Graph 标签({points}/4)：{evidence}
- [{status}] Twitter/X 卡片({points}/2)：{evidence}
- [{status}] 结构化数据 JSON-LD({points}/4)：{rendered types and validation evidence}

## 技术与抓取({score}/17)
- [{status}] HTTPS 加密({points}/3)：{evidence}
- [{status}] HTTP 状态与跳转({points}/3)：{evidence}
- [{status}] 响应速度({points}/3)：{evidence}
- [{status}] HTML 体积({points}/2)：{evidence}
- [{status}] URL 规范性({points}/2)：{evidence}
- [ℹ] 多语言 hreflang：{count, languages, and validity observation}
- [{status}] robots.txt({points}/2)：{evidence}
- [{status}] Sitemap 站点地图({points}/2)：{evidence}

## 全页 2 词密度榜 Top 10（页面实际反复强调的词）
> 词频密度=次数÷总词数；占位密度=次数×词数÷总词数。前者看榜单排序，后者与关键词密度同口径，用于识别堆砌。

1. {ngram} ×{count}（词频 {frequency}% · 占位 {occupancy}%）
...
10. {ngram} ×{count}（词频 {frequency}% · 占位 {occupancy}%）

## 标题大纲
- H1 {heading}
  - H2 {heading}
    - H3 {heading}

## 具体修改方案

### 必须修复
| 优先级 | 问题 | 当前证据 | 具体修改 | 预期复核项 |
| --- | --- | --- | --- | --- |
| P0/P1/P2 | {failed or warning item} | {evidence} | {implementation-ready fix} | {rubric item} |

### 推荐文案
- Title：`{one recommended final title}`（长度 {length}）
- Meta Description：`{one recommended final description}`（长度 {length}）
- H1：`{one recommended final H1}`

### 正文调整
#### {section or paragraph location}
- 当前问题：{specific intent, clarity, thinness, or stuffing issue}
- 建议替换：

  > {complete natural replacement copy}

- 调整目的：{one sentence}

### 保持不变
- {passing elements that should not be rewritten}

## 复核清单
- {recrawl and remeasure each changed item}

> 说明：本报告只评估 On Page SEO。得分高不代表一定获得靠前排名；排名还受网页权重、页面体验、用户行为、竞争强度与搜索引擎系统等因素影响。
```

## Output requirements

- Sort mandatory fixes by impact: indexability and conflicting canonical first, then Title/H1/intent, then content and media polish.
- Include every `[✕]` and `[⚠]` item in `必须修复`; do not bury them in prose.
- Provide one recommended final version of each metadata field, not a list of vague alternatives. Optional A/B variants may follow only when useful.
- Do not invent paragraph rewrites when the source paragraph is unavailable. State what source content is needed.
- If there are no failures or warnings, replace `必须修复` with `无强制修改项`, retain `保持不变`, and clearly label any copy changes as optional tests.

