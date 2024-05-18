import { marked } from 'marked'
import puppeteer from 'puppeteer-core'
import fs from 'node:fs/promises'
import path from 'node:path'

/**
 * 校验参数
 * @param args 命令行参数
 * @returns src: markdown 文件路径 (绝对路径)
 * @returns out: pdf 文件路径 (绝对路径)
 * @returns err: 错误信息
 */
export function validateArgs(args: string[]): { src: string, out: string, err: Error | null } {
  // 如果没有传参
  if (!args) {
    return { src: '', out: '', err: new Error('Example: md --src=src [--out=out]') }

  // 如果第一个参数不是 --src=xxx
  } else if (!args[0].startsWith('--src=') || args[0].split('=')[1] === '') {
    return { src: '', out: '', err: new Error('Example: md --src=src [--out=out]') }

  // 如果有第二个参数，但不是 --out=xxx
  } else if (args[1] && (!args[1].startsWith('--out=') || args[1].split('=')[1] === '')) {
    return { src: '', out: '', err: new Error('Example: md --src=src [--out=out]') }
  }

  // 校验通过
  const src = args[0].split('=')[1].endsWith('.md') ? args[0].split('=')[1] : args[0].split('=')[1] + '.md'
  const out = args[1] ? (args[1].split('=')[1].endsWith('.pdf') ? args[1].split('=')[1] : args[1].split('=')[1] + '.pdf') : src.replace(/\.md$/, '.pdf')
  return { 
    src: path.resolve(process.cwd(), src),
    out: path.resolve(process.cwd(), out),
    err: null 
  }
}

/**
 * 渲染 markdown
 * @param src markdown 文件路径 (绝对路径)
 * @param out pdf 文件路径 (绝对路径)
 * @returns 错误信息
 */
export async function renderMarkdown(src: string, out: string): Promise<null> {
  // 读取 markdown 文件
  console.log('读取 markdown 文件')
  const md = await fs.readFile(src)
  // 转换 markdown 为 html
  console.log('转换 markdown 为 html')
  const html = await marked(md.toString())
  // 读取 css 文件
  console.log('读取 css 文件')
  const css = await fs.readFile(path.resolve(import.meta.dir, 'index.css'))
  // 创建网页文件
  console.log('创建网页文件')
  const web = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <title>Markdown</title>
      <style>${css}</style>
    </head>
    <body>
      ${html}
    </body>
    </html>
  `
  // 调试 - 保存 html 文件
  await fs.writeFile(path.resolve(process.cwd(), 'demo.html'), web)
  // 创建浏览器
  console.log('创建浏览器')
  const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' })
  // 创建页面
  console.log('创建页面')
  const page = await browser.newPage()
  // 设置页面内容
  console.log('设置页面内容')
  await page.setContent(web)
  // 生成 pdf
  console.log('生成 pdf')
  await page.pdf({ 
    path: out, 
    format: 'A4',
    margin: { top: '36px', right: '36px', bottom: '36px', left: '36px' }
  })
  // 关闭浏览器
  console.log('关闭浏览器')
  await browser.close()
  // 返回
  return null  
}