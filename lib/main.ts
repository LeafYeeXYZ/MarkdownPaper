import { marked } from 'marked'
import puppeteer from 'puppeteer'
import fs from 'node:fs/promises'
import path from 'node:path'
import { readFileSync } from 'node:fs'
import { APS } from '../theme/aps/aps'
import type { MarkdownPaperTheme } from '../theme/theme'
import type { PDFOptions } from 'puppeteer'
import markedKatex from 'marked-katex-extension'
// @ts-ignore
import katexCss from 'katex/dist/katex.css' with { type: 'text' }
import { asBlob } from 'html-docx-js-typescript'

/** 应用参数 */
class MarkdownPaperOptions {
  /** markdown 文件绝对路径 */
  src: string
  /** pdf 文件绝对路径 */
  out: string
  /** 是否输出 html */
  outputHTML: boolean
  /** 是否输出 docx */
  outputDOCX: boolean
  /** 样式 */
  theme: MarkdownPaperTheme
  /** 正确格式 */
  static format = `mdp <markdown> [--options]

    <markdown>:  markdown 文件相对路径
    --out=<path>:  输出文件相对路径 (默认为 <markdown>)
    --theme=<name>:  论文模板 (默认为 APS)
    --outputHTML:  输出 html 文件 (默认不输出)
    --outputDOCX:  输出 docx 文件 (默认不输出)

    模板的自定义参数见模板说明`
  /**
   * 生成应用参数
   * @param args 命令行参数
   * @param cwd 当前工作目录
   */
  constructor(args: string[], cwd: string) {
    // 默认参数
    this.src = ''
    this.out = ''
    this.outputHTML = false
    this.outputDOCX = false
    this.theme = new APS(args)
    // 解析路径参数
    if (args.length === 0) throw SyntaxError()
    else args[0] = `--src=${args[0]}`
    // 解析其他参数
    args.forEach(arg => {
      switch (arg.split('=')[0]) {
        case '--src': {
          const a = arg.split('=')
          if (a.length !== 2 || a[1] === '') throw SyntaxError()
          this.src = a[1].endsWith('.md') ? path.resolve(cwd, a[1]) : path.resolve(cwd, a[1] + '.md')
          break
        }
        case '--out': {
          const a = arg.split('=')
          if (a.length !== 2 || a[1] === '') throw SyntaxError()
          this.out = a[1].endsWith('.pdf') ? path.resolve(cwd, a[1]) : path.resolve(cwd, a[1] + '.pdf')
          break
        }
        case '--theme': {
          const a = arg.split('=')
          if (a.length !== 2 || a[1] === '') throw SyntaxError()
          switch (a[1].toUpperCase()) {
            case 'APS': {
              break
            }
            default: {
              throw Error(`模板 ${a[1]} 不存在`)
            }
          }
          break
        }
        case '--outputHTML': {
          this.outputHTML = true
          break
        }
        case '--outputDOCX': {
          this.outputDOCX = true
          break
        }
      }
    })
    // 检查参数
    if (this.out === '') this.out = this.src.replace('.md', '.pdf')
  }
}

/**
 * 渲染 markdown
 * @param options 参数
 */
async function renderMarkdown(
  options: MarkdownPaperOptions,
): Promise<void> {
  // 读取 markdown 文件
  const raw = await fs.readFile(options.src, { encoding: 'utf-8' })
  // 生成 html 文件
  const html = await mdToHtml(raw, options.theme, path.basename(options.src).replace('.md', ''))
  // 保存 pdf 文件
  await htmlToPdf(
    html.replace(/<img src="(.+?)"/g, (match, p1) => {
      if (p1.startsWith('http')) return match
      try {
        const url = path.resolve(path.dirname(options.src), decodeURI(p1))
        const data = readFileSync(url).toString('base64')
        return `<img src="data:image/${path.extname(p1).replace('.', '')};base64,${data}"`
      } catch (_) {
        console.error(`图片 ${p1} 不存在`)
        return match
      }
    }),
    options.out,
    options.theme.pdfOptions,
    options.theme.script
  )
  // 保存 html 文件
  options.outputHTML && await fs.writeFile(options.out.replace('.pdf', '.html'), html)
  // 保存 docx 文件
  const docx = await asBlob(html)
  const docxBuffer = new Uint8Array(docx instanceof Blob ? await docx.arrayBuffer() : docx.buffer)
  options.outputDOCX && await fs.writeFile(options.out.replace('.pdf', '.docx'), docxBuffer)
  options.outputDOCX && console.warn('导出的 DOCX 文件可能存在格式丢失, 请手动调整\n')
}

/**
 * 把 html 转换为 pdf
 * @param html html 字符串, 图片为 base64
 * @param dist pdf 文件绝对路径
 * @param options pdf 参数, 无需设置路径
 * @param script 在网页中要执行的函数
 */
async function htmlToPdf(html: string, dist: string, options: PDFOptions, script: () => void): Promise<void> {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setContent(html)
  // 执行脚本
  await page.evaluate(script)
  await page.pdf({ path: dist, ...options })
  await browser.close()
}

/**
 * 把 markdown 转换为 html
 * @param md markdown 字符串
 * @param theme 论文模板
 * @param pageTitle 页面标题
 * @returns html 字符串
 */
async function mdToHtml(
  md: string,
  theme: MarkdownPaperTheme,
  pageTitle: string = 'MarkdownPaper'
): Promise<string> {
  // 设置 marked
  marked.use(markedKatex({ throwOnError: false }))
  // 预处理 markdown
  let html = await theme.preParseMarkdown(md)
  // 转换 markdown 为 html
  html = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <title>${pageTitle}</title>
      <style>${theme.css}</style>
      <style>\n${katexCss}\n</style>
    </head>
    <body>
      ${await marked(html)}
    </body>
    </html>
  `
  // 预处理 html
  html = await theme.preParseHTML(html)
  return html
}


export {
  MarkdownPaperOptions,
  renderMarkdown,
  htmlToPdf,
  mdToHtml,
  APS
}
export type {
  MarkdownPaperTheme
}