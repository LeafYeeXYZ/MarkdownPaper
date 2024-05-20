import { marked } from 'marked'
import puppeteer from 'puppeteer-core'
import fs from 'node:fs/promises'
import path from 'node:path'
import { readFileSync } from 'node:fs'

export class Options {
  /** markdown 文件绝对路径 */
  src: string
  /** pdf 文件绝对路径 */
  out: string
  /** 是否输出 html */
  outputHTML: boolean
  /** 自定义浏览器 */
  browser: string
  /** 显示文件名 */
  showTitle: boolean
  /** 是否输出 docx */
  outputDOCX: boolean
  /** 不添加页脚 */
  hideFooter: boolean
  /** 正确格式 */
  static format = 'mdp xxx\nmdp --src=xxx [--out=xxx] [--outputHTML] [--browser=xxx] [--showTitle] [--outputDOCX] [--hideFooter]'
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
    this.showTitle = false
    this.hideFooter = false
    this.browser = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
    // 单参数简写
    if (args.length === 1 && !args[0].startsWith('--')) args[0] = '--src=' + args[0]
    // 解析参数
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
        case '--outputHTML': {
          this.outputHTML = true
          break
        }
        case '--showTitle': {
          this.showTitle = true
          break
        }
        case '--outputDOCX': {
          this.outputDOCX = true
          break
        }
        case '--hideFooter': {
          this.hideFooter = true
          break
        }
        case '--browser': {
          const a = arg.split('=')
          if (a.length !== 2 || a[1] === '') throw SyntaxError()
          this.browser = a[1]
          break
        }
        default: {
          throw SyntaxError()
        }
      }
    })
    // 检查参数
    if (this.src === '') throw SyntaxError()
    if (this.out === '') this.out = this.src.replace('.md', '.pdf')
  }
}

/**
 * 主函数
 * @param args 命令行参数
 * @param cwd 当前工作目录
 */
export async function main(args: string[], cwd: string): Promise<void> {

  try {
    // 如果没有参数, 显示帮助信息
    if (args.length === 0) {
      console.log(`\n使用方法:\n${Options.format}\n`)
      process.exit(0)
    }
    // 解析参数
    const options = new Options(args, cwd)
    console.log('\n开始生成\n')
    // 渲染 markdown
    await renderMarkdown(options)
    console.log('生成成功\n')

  } catch (e) {
    if (e instanceof SyntaxError) console.error(`\n参数错误, 正确格式:\n${Options.format}\n`)
    else if (e instanceof Error) console.error(`\n错误, 错误信息:\n${e.name}\n${e.message}\n`)

  } finally {
    process.exit(0)

  }
}

/**
 * 渲染 markdown
 * @param options 参数
 */
async function renderMarkdown(options: Options): Promise<void> {
  // 读取 markdown 文件
  const md = await fs.readFile(options.src, { encoding: 'utf-8' })
  // 转换 markdown 为 html
  const html = await marked(md)
  // 读取 css 文件
  const css = await fs.readFile(path.resolve(import.meta.dir, '../css/APS.css'))
  // 创建网页文件
  const title = path.basename(options.src).replace('.md', '')
  let web = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>${css}</style>
    </head>
    <body>
      ${html}
    </body>
    </html>
  `
  // 把包裹图片的 p 标签去掉, 并添加标题 <div class="image-title">...</div>
  web = web.replace(/<p><img (.*?)><\/p>/g, '<img $1>')
  web = web.replace(/<img src="(.*?)" alt="(.*?)">/g, '<div class="image-title">$2</div><img src="$1" alt="$2">')
  // 保存 html 文件
  options.outputHTML && await fs.writeFile(options.out.replace('.pdf', '.html'), web)
  // 把图片转换为 base64
  web = web.replace(/src="(.+?)"/g, (match, p1) => {
    if (p1.startsWith('http')) return match
    const data = readFileSync(path.resolve(path.dirname(options.src), p1)).toString('base64')
    return `src="data:image/${path.extname(p1).replace('.', '')};base64,${data}"`
  })
  // 创建浏览器
  const browser = await puppeteer.launch({ executablePath: options.browser })
  // 创建页面
  const page = await browser.newPage()
  // 设置页面内容
  await page.setContent(web)
  // 生成 pdf
  await page.pdf({ 
    path: options.out,
    format: 'A4',
    margin: { 
      top: '2cm', 
      right: '2.5cm', 
      bottom: '2cm', 
      left: '2.5cm' 
    },
    displayHeaderFooter: options.showTitle || !options.hideFooter,
    headerTemplate: options.showTitle ? `<div style="font-size: 9px; font-family: '宋体'; color: #333; padding: 5px; margin-left: 0.6cm;"> <span class="title"></span> </div>` : `<div></div>`,
    footerTemplate: options.hideFooter ? `<div></div>` : `<div style="font-size: 9px; font-family: '宋体'; color: #333; padding: 5px; margin: 0 auto;">第 <span class="pageNumber"></span> 页 / 共 <span class="totalPages"></span> 页</div>`,
  })
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