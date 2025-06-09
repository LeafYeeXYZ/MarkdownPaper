import fs from 'node:fs/promises'
import { asBlob } from 'html-docx-js-typescript'
// @ts-ignore
import katexCss from 'katex/dist/katex.css' with { type: 'text' }
import { marked } from 'marked'
import markedKatex from 'marked-katex-extension'
import puppeteer from 'puppeteer'
import { type MarkdownPaperOptions, themes } from './types'

/**
 * 渲染 MarkdownPaper 文档
 * @param options MarkdownPaper CLI 选项
 */
export async function render(options: MarkdownPaperOptions): Promise<void> {
	const theme = await themes[options.theme](options)
	const markdown = await fs.readFile(options.src, { encoding: 'utf-8' })
	marked.use(markedKatex({ throwOnError: false }))
	const html = await theme.preParseHtml(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <title>MarkdownPaper</title>
      <style>\n${theme.css}\n</style>
      <style>\n${katexCss}\n</style>
    </head>
    <body>
      ${await marked(await theme.preParseMarkdown(markdown))}
    </body>
    </html>
  `)
	const browser = await puppeteer.launch()
	const page = await browser.newPage()
	await page.setContent(html)
	await page.evaluate(theme.script)
	await page.pdf({ path: options.out, ...theme.pdfOptions })
	const finalHtml = await page.content()
	if (options.outputHtml) {
		await fs.writeFile(options.out.replace('.pdf', '.html'), finalHtml)
	}
	if (options.outputDocx) {
		const docx = await asBlob(finalHtml)
		const docxBuffer = new Uint8Array(
			docx instanceof Blob ? await docx.arrayBuffer() : docx.buffer,
		)
		await fs.writeFile(options.out.replace('.pdf', '.docx'), docxBuffer)
		console.warn('注意: 导出的Word文件可能存在格式丢失, 请手动调整')
	}
	await browser.close()
}
