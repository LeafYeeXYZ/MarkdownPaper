以心理学报等学术论文的格式从 Markdown 生成 PDF / HTML / DOCX 文件

# 使用方法

## 1 用 Markdown 撰写论文

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

#### 1.1.2 数学公式

段内数学公式: $c = \pm\sqrt{a^2 + b^2}$

单独数学公式:

$$
c = \pm\sqrt{a^2 + b^2}
$$

#### 1.1.3 图片

![](图片路径)

> 图片标题

#### 1.1.4 表格

> 表格标题

| 表头1 | 表头2 |
| :---: | :---: |
| 内容1 | 内容2 |

##### 参考文献

- 文献1
- 文献2
- 文献3

--- 

(上面的是分页符)

##### 附录
```

> 数学公式语法详见 [https://katex.org](https://katex.org) 和[这篇中文文章](https://kissingfire123.github.io/2022/02/18_数学公式katex常用语法总结)

## 2 安装 `Bun`

`Bun` 是一个现代的 `JavaScript` / `TypeScript` 运行环境, 本项目基于 `Bun` 环境开发; 请在官网 [bun.sh](https://bun.sh) 下载并安装 `Bun`, 也可以直接使用 `npm install -g bun` 安装

## 3 安装 `MarkdownPaper`

```bash
bun add -g markdown-paper
```

> 如果您安装过旧版本的 `MarkdownPaper` (小于 `2.0.0`), 请先卸载旧版本再安装新版本

## 4 生成论文

运行 `mdp` 命令以使用 `MarkdownPaper` 命令行工具从 `Markdown` 文件生成论文

如果您不熟悉命令行工具, 可以尝试我的另一个项目 [EasyPaper](https://github.com/LeafYeeXYZ/EasyPaper), 它实现了大部分 `MarkdownPaper` 的功能并提供了图形界面

```bash
# 查看帮助信息
mdp
# 从当前工作目录下的 example.md 文件生成 PDF 文件
mdp example.md
# 从当前工作目录下的 example.md 文件生成 PDF 文件并输出到指定路径
mdp example.md --out=D:/example.pdf
# 从当前工作目录下的 example.md 文件生成 PDF 和 HTML 文件
mdp example.md --outputHTML
# 从当前工作目录下的 example.md 文件生成 PDF 和 DOCX 文件
mdp example.md --outputDOCX
```

| 参数 | 说明 |
| :---: | :---: |
| `--out=xxx` | 输出文件相对路径<br>默认为源文件路径的同名 `PDF` 文件 |
| `--theme=xxx` | 论文模板, 默认为 `aps` (`Acta Psychologica Sinica`)<br>暂时没有其他模板, 欢迎贡献 |
| `--outputHTML` | 输出 `HTML` 文件, 默认不输出 |
| `--outputDOCX` | 输出 `DOCX` 文件, 默认不输出<br>**导出后样式可能无法完全保留, 请自行调整** |

# 模板说明

`/theme/theme.ts` 中的 `MarkdownnPaperTheme` 接口定义了模板的样式, 按照类似于 `aps` 文件夹的结构可自定义模板; 模板可以提供自定义功能

模板制作完成后, 在 `/lib/main.ts` 中导入并添加到 `class MarkdownPaperOptions -> constructor -> case '--theme':` 中, 并在下方添加使用文档即可

推荐所有主题的文档和编写格式都尽量与 `aps` 主题保持一致

## APS 模板

### 额外命令行参数

| 参数 | 说明 |
| :---: | :---: |
| `--showTitle` | 在页眉显示文件名, 默认不显示 |
| `--hideFooter` | 隐藏页码, 默认显示 |
| `--zhPunctuation` | 将正文中的英文标点符号替换为中文标点符号, 默认不替换<br>仅替换 `PDF` 和 `DOCX` 文件 |
| `--enPunctuation` | 将正文中的中文标点符号替换为英文标点符号, 默认不替换<br>仅替换 `PDF` 和 `DOCX` 文件 |

### 编写格式

同上

# 更新日志

- `2.5.0` (2025-02-07): 支持分页符
- `2.4.0` (2024-12-08): 导出 `DOCX` 文件时, 不再依赖 `Python`
- `2.3.0` (2024-08-31): 支持数学公式
- `2.2.0` (2024-08-26): 半重构, 优化导入导出, 优化文档
- `2.1.1` (2024-07-12): 修复字体错误
- `2.1.0` (2024-06-26): 支持 `MacOS` 系统, 改为在线加载字体
- `2.0.0` (2024-06-20): 重构代码, 完善模板功能
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