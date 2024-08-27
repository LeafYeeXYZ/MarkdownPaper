import type { MarkdownPaperTheme } from '../theme'
import type { PDFOptions } from 'puppeteer'
import fs from 'node:fs'
import path from 'node:path'

export class APS implements MarkdownPaperTheme {

  css: string
  preParseMarkdown: (md: string) => Promise<string>
  preParseHTML: (html: string) => Promise<string>
  script: () => void
  pdfOptions: PDFOptions

  constructor(
    args: string[] = [],
  ) {
  
    // 默认自定义参数
    let showTitle: boolean = false
    let hideFooter: boolean = false
    let zhPunctuation: boolean = false
    let enPunctuation: boolean = false
    // 解析参数
    args.forEach(arg => {
      switch (arg.split('=')[0]) {
        case '--showTitle': showTitle = true; break
        case '--hideFooter': hideFooter = true; break
        case '--zhPunctuation': zhPunctuation = true; break
        case '--enPunctuation': enPunctuation = true; break
      }
    })

    // css
    this.css = fs.readFileSync(path.resolve(import.meta.dirname, 'aps.css'), 'utf-8')
    
    // preParseMarkdown
    this.preParseMarkdown = async (md: string): Promise<string> => {
      // 作者
      md = md.replace(/#author# (.*)/mg, '<div class="author">$1</div>')
      // 单位
      md = md.replace(/#school# (.*)/mg, '<div class="school">$1</div>')
      // 关键词
      md = md.replace(/#keywords# (.*)/mg, '<div class="keywords">$1</div>')
      // 摘要
      md = md.replace(/#abstract# (.*)/mg, '<div class="abstract">$1</div>')
      // 返回处理后的字符串
      return md
    }

    // preParseHTML
    this.preParseHTML = async (html: string): Promise<string> => {
      // 把包裹图片的 p 标签去掉
      html = html.replace(/<p><img (.*?)><\/p>/g, '<img $1>')
      // 返回处理后的字符串
      return html
    }

    // script
    // 替换标点
    if (zhPunctuation && !enPunctuation) {
      this.script = () => {
        const nodes = document.querySelectorAll('body > p, .abstract, .keywords, .author, .school')
        nodes.forEach(node => {
          let text = node.textContent ?? ''
          // 替换中英文逗号和句号
          text = text.replace(/, /g, '，').replace(/\. /g, '。').replace(/\.$/, '。')
          // 替换中英文冒号
          text = text.replace(/: /g, '：')
          // 替换中英文分号
          text = text.replace(/; /g, '；')
          // 替换中英文感叹号
          text = text.replace(/! /g, '！').replace(/!$/, '！')
          // 替换中英文问号
          text = text.replace(/\? /g, '？').replace(/\?$/, '？')
          // 替换中英文括号
          text = text.replace(/ \(/g, '（').replace(/\) /g, '）')
          // 恢复et al.,
          text = text.replace(/et al\.，/g, 'et al., ').replace(/et al。/g, 'et al. ')
          // 设置新文本
          node.textContent = text
        })
      }
    } else if (!zhPunctuation && enPunctuation) {
      this.script = () => {
        const nodes = document.querySelectorAll('body > p, .abstract, .keywords, .author, .school')
        nodes.forEach(node => {
          let text = node.textContent ?? ''
          // 替换中英文逗号和句号
          text = text.replace(/，/g, ', ').replace(/。 /g, '. ')
          // 替换中英文冒号
          text = text.replace(/：/g, ': ')
          // 替换中英文分号
          text = text.replace(/；/g, '; ')
          // 替换中英文感叹号
          text = text.replace(/！/g, '! ')
          // 替换中英文问号
          text = text.replace(/？/g, '? ')
          // 替换中英文括号
          text = text.replace(/（/g, ' (').replace(/）/g, ') ')
          // 设置新文本
          node.textContent = text
        })
      }
    } else {
      this.script = () => {}
    }

    // pdfOptions
    this.pdfOptions = { 
      format: 'A4',
      margin: { 
        top: '2cm', 
        right: '2.5cm', 
        bottom: '2cm', 
        left: '2.5cm' 
      },
      displayHeaderFooter: showTitle || !hideFooter,
      headerTemplate: showTitle ? `<div style="font-size: 9px; font-family: 'SimSun'; color: #333; padding: 5px; margin-left: 0.6cm;"> <span class="title"></span> </div>` : `<div></div>`,
      footerTemplate: hideFooter ? `<div></div>` : `<div style="font-size: 9px; font-family: 'SimSun'; color: #333; padding: 5px; margin: 0 auto;">第 <span class="pageNumber"></span> 页 / 共 <span class="totalPages"></span> 页</div>`,
    }
  }
}

export const baseAPS: MarkdownPaperTheme = {
  css:  `
    * {
      font-family: 'Times', 'Times New Roman', '宋体', 'SimSun', '华文宋体', 'STSong'; /* 所有数字和英文字体都用 Times New Roman */
      line-height: 1.55em; /* 1.5倍行距 */
      margin: 0;
    }

    h1 { /* 中文题目: 二号黑体 */
      font-size: 29px;
      font-weight: normal;
      font-family: '黑体', 'SimHei', '华文黑体', 'STHeiti';
      text-align: center;
      margin-bottom: 9px;
    }
    .author { /* 作者姓名: 四号仿宋 */
      font-size: 18px;
      font-weight: normal;
      font-family: '仿宋', 'Fangsong', '华文仿宋', 'STFangsong';
      text-align: center;
      margin-bottom: 3px;
    }
    .school { /* 作者单位: 小五宋体 */
      font-size: 12px;
      text-align: center;
      margin-bottom: 38px;
    }
    .abstract { /* 摘要和关键词: 五号宋体 */
      font-size: 14px;
      text-align: justify;
      padding: 0 28px;
      &::before { 
        content: '摘　要';
        font-weight: normal;
        font-family: '黑体', 'SimHei', '华文黑体', 'STHeiti';
        display: inline-block;
        margin-right: 14px;
      }
    }
    .keywords { 
      font-size: 14px;
      margin-bottom: 31px; 
      padding: 0 28px;
      &::before { 
        content: '关键词';
        font-weight: normal;
        font-family: '黑体', 'SimHei', '华文黑体', 'STHeiti';
        display: inline-block;
        margin-right: 14px;
      }
    }

    h2 { /* 一级标题: 四号宋体 */
      font-size: 18px;
      font-weight: normal;
      margin: 7px 0;
    }
    h3 { /* 二级标题: 五号黑体 */
      font-size: 14px;
      font-weight: normal;
      font-family: '黑体', 'SimHei', '华文黑体', 'STHeiti';
      margin: 5px 0;
    }
    h4 { /* 三级标题: 五号黑体 */
      font-size: 14px;
      font-weight: normal;
      font-family: '黑体', 'SimHei', '华文黑体', 'STHeiti';
      margin: 3px 0;
    }

    p { /* 正文: 五号宋体 */
      font-size: 14px;
      text-indent: 24px;
      text-align: justify;
    }

    h5 { /* "参考文献": 五号黑体 */
      font-size: 14px;
      font-weight: normal;
      font-family: '黑体', 'SimHei', '华文黑体', 'STHeiti';
      text-align: center;
      margin-bottom: 7px;
      margin-top: 20px;
    }
    ul, ol { /* 参考文献的项目: 小五号宋体 */
      list-style-type: none;
      padding: 0;
      & > li { 
        font-size: 12px;
        margin: 6px 0;
        text-align: justify;
        text-indent: -24px;
        padding-left: 24px;
      }
      & a {
        text-decoration: none;
        color: black;
      }
    }

    img {
      display: block;
      max-width: 100%;
      margin: 0 auto;
      margin-top: 10px;
    }

    blockquote, blockquote > p { /* 图片和表格的标题: 小五号宋体 */
      font-size: 12px;
      font-weight: normal;
      text-align: center;
      margin: 0;
    }
    blockquote > p { margin: 6px 0; }
    table { /* 表格: 小五号宋体 */
      font-size: 12px;
      position: relative;
      border-top: 1px solid black;
      border-bottom: 1px solid black;
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
      margin-bottom: 10px;
      & th, & td {
        font-weight: normal;
      }
      & thead::after { /* 用来做三线表中间的横线 */
        content: '';
        display: block;
        position: absolute;
        border-top: 1px solid #00000060;
        width: 100%;
      }
    }

    b, strong { /* 加粗按黑体处理 */
      font-weight: normal;
      font-family: '黑体', 'SimHei', '华文黑体', 'STHeiti';
    }
  `,
  preParseMarkdown: async (md: string): Promise<string> => {
    // 作者
    md = md.replace(/#author# (.*)/mg, '<div class="author">$1</div>')
    // 单位
    md = md.replace(/#school# (.*)/mg, '<div class="school">$1</div>')
    // 关键词
    md = md.replace(/#keywords# (.*)/mg, '<div class="keywords">$1</div>')
    // 摘要
    md = md.replace(/#abstract# (.*)/mg, '<div class="abstract">$1</div>')
    // 返回处理后的字符串
    return md
  },
  preParseHTML: async (html: string): Promise<string> => {
    // 把包裹图片的 p 标签去掉
    html = html.replace(/<p><img (.*?)><\/p>/g, '<img $1>')
    // 返回处理后的字符串
    return html
  },
  script: () => {},
  pdfOptions: {}
}