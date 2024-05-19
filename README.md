**以心理学报的格式从 Markdown 生成 PDF**

## 使用方法
```bash
# 安装 (只能用 Bun)
bun add -g leaf-markdown-pdf
# 使用
mdpdf --src=xxx [--out=xxx] [--outputHTML] [--browser=xxx] [--showTitle]
```

| 参数 | 说明 |
| :---: | :---: |
| `--src=xxx` | 源文件路径, **必须** |
| `--out=xxx` | 输出文件路径, 默认为源文件路径的同名 `PDF` 文件 |
| `--outputHTML` | 输出 `HTML` 文件, 默认不输出 |
| `--browser=xxx` | 自定义浏览器可执行文件, 非 `Windows` 系统则必须 |
| `--showTitle` | 在页眉显示文件名, 默认不显示 |

## 编写格式
```markdown
# 中文标题
<div class='author'>作者信息</div>
<div class='school'>单位信息</div>
<div class='abstract'><span>摘</span><span>要</span>
  摘要内容
</div>
<div class='keywords'><span>关键词</span>
  关键词内容
</div>

## 1 一级标题
### 1.1 二级标题
#### 1.1.1 三级标题
正文

##### 参考文献
- 文献1
- 文献2
- 文献3
```