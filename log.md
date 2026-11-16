---
project: MiYa-site
title: MiYa 网站
status: in-progress
visibility: public
version: 1.0.0
updated: '2026-11-16'
progress: 70
priority: low
tags:
  - static-site
  - seo
  - i18n
links:
  site: 'https://miya.eden-tan.com/'
  repo: 'https://github.com/edent95/miya-site'
milestones:
  - name: 上线 miya.eden-tan.com(五种语言 · 首页 / 隐私 / 支持,不装统计)
    done: true
  - name: Google Search Console 收录 + 网站地图
    done: false
  - name: 结构化数据(MobileApplication / FAQPage)+ 分享图
    done: false
log_format: rag-v1
---

# MiYa 网站 开发日志

- MiYa(iPhone / Apple Watch 健康报告 App,源码在私有仓库 edent95/Health)的公开网站。
  源码 edent95/miya-site,GitHub Pages,GoDaddy 上 `miya` 的 CNAME 指向 `edent95.github.io`。
- 纯静态、零依赖:`node build.mjs` 生成 `dist/`;文案在 `src/content/<语言>.json`。
- 不装任何统计、不设 cookie、不加载外部资源;效果只看 Search Console / Bing / App Store Connect。
- 这一段在第一个 `## YYYY-MM-DD` 之前,解析器看不见,只写给人和 agent。

## 格式约定 (rag-v1)

每条 `###` 是一个独立检索块:重复主语,不用「它 / 上述」。七个字段:`type` `scope` `impact`
`changed` `ripples` `verified` `keywords`。`ripples` 写「改了这里,谁的假设失效了、谁要跟着改、
下次谁会踩坑」,答不出写「无」,不要留空。

- **必须用脚本追加**:`node scripts/append-log.mjs < 条目.md`(首行 `### 标题`;ID 与 `## 日期` 由脚本补)。
  `logs/entries/` 存在,所以每条写成一个新文件,几个分支同时写也不冲突。
- 顺序「旧 → 新」;不要手写 `## 日期`,不要读整个文件再写回。
- SEO 每次只改一个主要变量,在条目里写清预期影响哪个数、什么时候回来看。
