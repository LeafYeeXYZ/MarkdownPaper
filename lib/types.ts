import type { PDFOptions } from 'puppeteer'
import { z } from 'zod'
import { themeAPS } from './themes/aps'

/**
 * MarkdownPaper 主题 ID
 */
export enum MarkdownPaperThemes {
	APS = 'APS',
}

export const themeLabels: Record<MarkdownPaperThemes, string> = {
	[MarkdownPaperThemes.APS]: '心理学报',
}

export const themes: Record<MarkdownPaperThemes, MarkdownPaperTheme> = {
	[MarkdownPaperThemes.APS]: themeAPS,
}

/**
 * MarkdownPaper CLI 选项的 Zod Schema
 */
export const cliOptions = z.object({
	src: z.string(),
	out: z.string(),
	theme: z.nativeEnum(MarkdownPaperThemes),
	outputHtml: z.boolean(),
	outputDocx: z.boolean(),
	hideFooter: z.boolean(),
	punctuation: z.enum(['zh', 'en', 'origin']),
})

/**
 * MarkdownPaper CLI 选项 (详见 `bin/mdp.ts`)
 */
export type MarkdownPaperOptions = z.infer<typeof cliOptions>

/**
 * MarkdownPaper 论文模板
 * @param args 命令行参数, 如果不提供, 则只有效返回 id 和 label 参数
 */
export type MarkdownPaperTheme = (args: MarkdownPaperOptions) => Promise<{
	/**
	 * 主题ID
	 */
	id: MarkdownPaperThemes
	/**
	 * 主题名称
	 */
	label: string
	/**
	 * css 样式
	 * 不含 \<style>\</style>
	 */
	css: string
	/**
	 * 预处理 markdown 字符串 (用于转换自定义标签等)
	 * @param md markdown 字符串
	 * @returns 转换后的 markdown 字符串
	 */
	preParseMarkdown(md: string): Promise<string>
	/**
	 * 预处理 html 字符串
	 * @param html html 字符串
	 * @returns 转换后的 html 字符串
	 */
	preParseHtml(html: string): Promise<string>
	/**
	 * 在网页中要执行的函数
	 */
	script(): void
	/**
	 * PDF 参数 (无需设置路径)
	 */
	pdfOptions: PDFOptions
}>
