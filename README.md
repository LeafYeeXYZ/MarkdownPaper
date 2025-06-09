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

`Bun` 是一个现代的 `JavaScript` / `TypeScript` 运行环境, 本项目基于 `Bun` 环境运行; 请在官网 [bun.sh](https://bun.sh) 下载并安装 `Bun`, 也可以直接使用 `npm install -g bun` 安装

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
mdp --help
# 查看版本信息
mdp --version
# 从当前工作目录下的 example.md 文件生成 PDF 文件
mdp example.md
mdp example # 可以省略文件后缀名
```

# 模板说明

`/lib/types.ts` 中的 `MarkdownnPaperTheme` 类型定义了论文模板; 模板制作完成后, 在 `/lib/types.ts` 中导入并添加即可使用
