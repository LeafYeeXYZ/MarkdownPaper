import { marked } from 'marked'
import puppeteer from 'puppeteer-core'
import fs from 'node:fs/promises'
import path from 'node:path'
import { readFileSync, statSync } from 'node:fs'

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
  /** 样式 */
  style: string
  /** 正确格式 */
  static format = `mdp <markdown> [--options]

    <markdown>:  markdown 文件相对路径
    --out=<path>:  输出文件相对路径 (默认为 <markdown>)
    --style=<path>:  样式文件相对路径 (默认为 APS)
    --outputHTML:  输出 html 文件 (默认不输出)
    --outputDOCX:  输出 docx 文件 (默认不输出)
    --showTitle:  在页眉显示文件名 (默认不显示)
    --hideFooter:  不添加页脚 (默认添加)
    --browser=<path>:  自定义浏览器路径 (默认为 Edge)`
  /**
   * 生成应用参数
   * @param args 命令行参数
   * @param cwd 当前工作目录
   */
  constructor(args: string[], cwd: string) {
    // 默认参数
    this.src = ''
    this.out = ''
    this.style = path.resolve(import.meta.dir, '../css/APS.css')
    this.outputHTML = false
    this.outputDOCX = false
    this.showTitle = false
    this.hideFooter = false
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
        case '--style': {
          const a = arg.split('=')
          if (a.length !== 2 || a[1] === '') throw SyntaxError()
          this.style = a[1].endsWith('.css') ? path.resolve(import.meta.dir, '../css', a[1]) : path.resolve(import.meta.dir, '../css', a[1] + '.css')
          try {
            statSync(this.style)
          } catch (_) {
            this.style = a[1].endsWith('.css') ? path.resolve(cwd, a[1]) : path.resolve(cwd, a[1] + '.css')
            try {
              statSync(this.style)
            } catch (_) {
              throw Error('样式文件不存在')
            }
          }
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
    if (this.out === '') this.out = this.src.replace('.md', '.pdf')
  }
}

class Labels {
  /**
   * 转换 markdown
   * @param md markdown 字符串
   * @returns 转换后的字符串
   */
  static transform(md: string): string {
    md = Labels.author(md)
    md = Labels.school(md)
    md = Labels.keywords(md)
    md = Labels.abstract(md)
    return md
  }
  /**
   * 作者
   * @param md markdown 字符串
   * @returns 转换后的字符串
   * @example
   * #author# xxx
   * ->
   * <div class="author">xxx</div>
   */
  static author(md: string): string {
    return md.replace(/#author# (.*)/mg, '<div class="author">$1</div>')
  }
  /**
   * 单位
   * @param md markdown 字符串
   * @returns 转换后的字符串
   * @example
   * #school# xxx
   * ->
   * <div class="school">xxx</div>
   */
  static school(md: string): string {
    return md.replace(/#school# (.*)/mg, '<div class="school">$1</div>')
  }
  /**
   * 关键词
   * @param md markdown 字符串
   * @returns 转换后的字符串
   * @example
   * #keywords# xxx
   * ->
   * <div class="keywords">xxx</div>
   */
  static keywords(md: string): string {
    return md.replace(/#keywords# (.*)/mg, '<div class="keywords">$1</div>')
  }
  /**
   * 摘要
   * @param md markdown 字符串
   * @returns 转换后的字符串
   * @example
   * #abstract# xxx
   * ->
   * <div class="abstract">xxx</div>
   */
  static abstract(md: string): string {
    return md.replace(/#abstract# (.*)/mg, '<div class="abstract">$1</div>')
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
    console.log('\n开始生成\n')
    const options = new Options(args, cwd)
    // 渲染 markdown
    await renderMarkdown(options)
    console.log('生成成功\n')

  } catch (e) {
    if (e instanceof SyntaxError) console.error(`参数错误, 正确格式:\n${Options.format}\n`)
    else if (e instanceof Error) console.error(`错误:\n${e.message}\n`)

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
  let md = await fs.readFile(options.src, { encoding: 'utf-8' })
  // 处理标签
  md = Labels.transform(md)
  // 转换 markdown 为 html
  const html = await marked(md)
  // 读取 css 文件
  const css = await fs.readFile(options.style, { encoding: 'utf-8' })
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
  web = web.replace(/<img src="(.+?)"/g, (match, p1) => {
    if (p1.startsWith('http')) return match
    try {
      const url = path.resolve(path.dirname(options.src), decodeURI(p1))
      const data = readFileSync(url).toString('base64')
      return `<img src="data:image/${path.extname(p1).replace('.', '')};base64,${data}"`
    } catch (_) {
      console.error(`图片 ${p1} 不存在, 已跳过`)
      return match
    }
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