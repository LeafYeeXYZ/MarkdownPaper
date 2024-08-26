import type { PDFOptions } from 'puppeteer-core'

export abstract class MarkdownPaperTheme {
  /**
   * @param args 命令行参数
   * @param cwd 当前工作目录
   */
  constructor(args?: string[], cwd?: string) {
    this.args = args ?? []
    this.cwd = cwd ?? process.cwd()
  }
  /** 命令行参数 */
  args: string[]
  /** 当前工作目录 */
  cwd: string
  /** 
   * css 样式  
   * 不含 \<style>\</style> 
   */
  abstract css: string
  /**
   * 预处理 markdown 字符串  
   * 用于转换自定义标签等
   * @param md markdown 字符串
   * @returns 转换后的 markdown 字符串
   */
  abstract preParseMarkdown(md: string): Promise<string>
  /**
   * 预处理 html 字符串  
   * 将在保存 html 文件前调用
   * @param html html 字符串
   * @returns 转换后的 html 字符串
   */
  abstract preParseHTML(html: string): Promise<string>
  /**
   * 在网页中要执行的函数  
   * 将在保存 html 文件后调用
   */
  abstract script(): void
  /**
   * PDF 参数  
   * 无需设置路径
   */
  abstract pdfOptions: PDFOptions
}