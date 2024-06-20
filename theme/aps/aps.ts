import { Theme } from '../theme'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { PDFOptions } from 'puppeteer-core'

export class APS extends Theme {

  css: string
  preParseMarkdown: (md: string) => string
  preParseHTML: (html: string) => string
  script: () => void
  pdfOptions: PDFOptions

  constructor(args: string[], cwd: string) {

    super(args, cwd)

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
    this.css = readFileSync(resolve(import.meta.dir, 'aps.css'), 'utf-8')
    
    // preParseMarkdown
    this.preParseMarkdown = (md: string): string => {
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
    // 把包裹图片的 p 标签去掉
    this.preParseHTML = (html: string): string => {
      html = html.replace(/<p><img (.*?)><\/p>/g, '<img $1>')
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
      headerTemplate: showTitle ? `<div style="font-size: 9px; font-family: '宋体'; color: #333; padding: 5px; margin-left: 0.6cm;"> <span class="title"></span> </div>` : `<div></div>`,
      footerTemplate: hideFooter ? `<div></div>` : `<div style="font-size: 9px; font-family: '宋体'; color: #333; padding: 5px; margin: 0 auto;">第 <span class="pageNumber"></span> 页 / 共 <span class="totalPages"></span> 页</div>`,
    }

  }
}