# MiYa 网站(miya.eden-tan.com)

MiYa iOS / Apple Watch App 的介绍、隐私政策与支持页。五种语言(English、简体中文、繁體中文、日本語、Español),
纯静态、零依赖,**不装任何统计、不设 cookie、不加载外部字体或脚本**(CI 会检查)。

```bash
MIYA_CONTACT_EMAIL=<联系邮箱> node build.mjs   # 生成 dist/
python3 -m http.server 0 --bind 127.0.0.1 -d dist   # 本机预览
```

- 文案:`src/content/<语言>.json`,结构必须和 `en.json` 一致(build 会检查);`{email}` 会换成联系邮箱。
- 联系邮箱不进仓库:GitHub 仓库变量 `MIYA_CONTACT_EMAIL`。
- 部署:push 到 `main` → GitHub Actions → GitHub Pages,自定义域名见 `CNAME`(build 生成)。
- DNS:GoDaddy 上 `miya` 的 CNAME 指向 `edent95.github.io`。
- 隐私政策要和 App 的真实行为一致;App 加了会传数据的功能(哪怕只传到用户自己的设备),先改这里。
