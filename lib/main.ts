import { marked } from 'marked'
import puppeteer from 'puppeteer-core'
import fs from 'node:fs/promises'
import path from 'node:path'
import { readFileSync } from 'node:fs'
import { APS } from '../theme/aps/aps'
import { Theme } from '../theme/theme'

/** 应用参数 */
export class Options {
  /** markdown 文件绝对路径 */
  src: string
  /** pdf 文件绝对路径 */
  out: string
  /** 自定义浏览器 */
  browser: string
  /** 是否输出 html */
  outputHTML: boolean
  /** 是否输出 docx */
  outputDOCX: boolean
  /** 样式 */
  theme: Theme
  /** 正确格式 */
  static format = `mdp <markdown> [--options]

    <markdown>:  markdown 文件相对路径
    --out=<path>:  输出文件相对路径 (默认为 <markdown>)
    --theme=<name>:  论文模板 (默认为 APS)
    --outputHTML:  输出 html 文件 (默认不输出)
    --outputDOCX:  输出 docx 文件 (默认不输出)
    --browser=<path>:  自定义浏览器路径 (默认为 Edge)

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
    this.theme = new APS(args, cwd)
    this.browser = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
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
        case '--browser': {
          const a = arg.split('=')
          if (a.length !== 2 || a[1] === '') throw SyntaxError()
          this.browser = a[1]
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
export async function renderMarkdown(options: Options): Promise<void> {
  // 读取 markdown 文件
  let md = await fs.readFile(options.src, { encoding: 'utf-8' })
  // 预处理 markdown
  md = options.theme.preParseMarkdown(md)
  // 转换 markdown 为 html
  const html = await marked(md)
  // 创建网页文件
  const title = path.basename(options.src).replace('.md', '')
  let web = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>${options.theme.css}</style>
    </head>
    <body>
      ${html}
    </body>
    </html>
  `
  // 预处理 html
  web = options.theme.preParseHTML(web)
  // 保存 html 文件
  options.outputHTML && await fs.writeFile(options.out.replace('.pdf', '.html'), web)
  // 把图片转换为 base64
  web = web.replace(/<img src="(.+?)"/g, (match, p1) => {
    if (p1.startsWith('http')) return match
    try {
      const url = path.resolve(path.dirname(options.src), decodeURI(p1))
      const data = readFileSync(url).toString('base64')
      return `<img src="data:image/${path.extname(p1).replace('.', '')};base64,${data}"`
    } catch (_) {
      console.error(`图片 ${p1} 不存在`)
      return match
    }
  })
  // 创建浏览器
  const browser = await puppeteer.launch({ executablePath: options.browser })
  // 创建页面
  const page = await browser.newPage()
  // 设置页面内容
  await page.setContent(web)
  // 执行脚本
  await page.evaluate(options.theme.script)
  // 生成 pdf
  await page.pdf({ path: options.out, ...options.theme.pdfOptions })
  // 关闭浏览器
  await browser.close()
  // 保存 docx 文件
  if (options.outputDOCX) {
    await new Promise<void>((resolve, reject) => {
      const worker = new Worker(new URL('docx.ts', import.meta.url).href)
      worker.onmessage = (e) => {
        switch (e.data) {
          case 'success': {
            console.log('')
            resolve()
            break
          }
          case 'error': {
            reject(Error('生成 docx 文件失败'))
            break
          }
          default: {
            reject(Error('调用 Python 时发生未知错误'))
            break
          }
        }
      }
      worker.postMessage(options)
    })
  }
}