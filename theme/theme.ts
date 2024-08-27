import type { PDFOptions } from 'puppeteer-core'

export interface MarkdownPaperTheme {
  /** 
   * css 样式  
   * 不含 \<style>\</style> 
   */
  css: string
  /**
   * 预处理 markdown 字符串  
   * 用于转换自定义标签等
   * @param md markdown 字符串
   * @returns 转换后的 markdown 字符串
   */
  preParseMarkdown(md: string): Promise<string>
  /**
   * 预处理 html 字符串  
   * 将在保存 html 文件前调用
   * @param html html 字符串
   * @returns 转换后的 html 字符串
   */
  preParseHTML(html: string): Promise<string>
  /**
   * 在网页中要执行的函数  
   * 将在保存 html 文件后调用
   */
  script(): void
  /**
   * PDF 参数  
   * 无需设置路径
   */
  pdfOptions: PDFOptions
}