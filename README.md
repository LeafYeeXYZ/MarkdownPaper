**以心理学报的格式从 Markdown 生成 PDF / HTML / DOCX 文件**

## 使用方法
```bash
# 安装 Bun
npm install -g bun / yarn global add bun / pnpm add -g bun
# 安装 MarkdownPaper
bun add -g leaf-markdown-paper
# 使用 (第一个参数为源文件相对路径)
mdp <path> [--option]
# 查看使用方法
mdp
```

| 参数 | 说明 |
| :---: | :---: |
| `--out=xxx` | 输出文件相对路径<br>默认为源文件路径的同名 `PDF` 文件 |
| `--browser=xxx` | 浏览器相对路径, 非 `Windows` 系统则必须<br>默认为 `C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe` |
| `--style=xxx` | 自定义 `CSS` 文件相对路径/模板<br>默认为 `APS` (`Acta Psychologica Sinica`) |
| `--showTitle` | 在页眉显示文件名, 默认不显示 |
| `--hideFooter` | 隐藏页码, 默认显示 |
| `--zhPunctuation` | 将正文中的英文标点符号替换为中文标点符号, 默认不替换<br>仅替换 `PDF` 和 `DOCX` 文件 |
| `--enPunctuation` | 将正文中的中文标点符号替换为英文标点符号, 默认不替换<br>仅替换 `PDF` 和 `DOCX` 文件 |
| `--outputHTML` | 输出 `HTML` 文件, 默认不输出 |
| `--outputDOCX` | 输出 `DOCX` 文件, 默认不输出<br>**须先执行 `pip install pdf2docx` 安装依赖**<br>使用时推荐开启 `--hideFooter` 参数 |

## 编写格式
```markdown
# 中文标题
#author# 作者信息
#school# 单位信息
#abstract# 摘要内容
#keywords# 关键词内容

## 1 一级标题
### 1.1 二级标题
#### 1.1.1 三级标题
正文

![](图片路径)

> 图片标题

> 表格标题

| 表头1 | 表头2 |
| :---: | :---: |
| 内容1 | 内容2 |

##### 参考文献
- 文献1
- 文献2
- 文献3

##### 附录
```

## 更新日志
- `1.4.0` (2024-05-29): 新增替换中英文标点符号功能
- `1.3.2` (2024-05-28): 优化图表标题显示
- `1.3.1` (2024-05-28): 优化样式
- `1.3.0` (2024-05-26): 支持自定义 `CSS` 文件, 简化编写格式, 优化帮助信息
- `1.2.3` (2024-05-25): 修复中文图片路径导致的错误
- `1.2.2` (2024-05-21): 优化样式, 优化命令
- `1.2.1` (2024-05-21): 优化摘要样式
- `1.2.0` (2024-05-21): 支持表格, 优化书写语法
- `1.1.3` (2024-05-20): 修复图片显示问题, 并新增显示图片标题
- `1.1.2` (2024-05-20): 优化 `DOCX` 文件输出
- `1.1.1` (2024-05-19): 支持 `DOCX` 文件输出
- `1.0.0` (2024-05-19): 初版发布