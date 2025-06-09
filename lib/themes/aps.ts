import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { type MarkdownPaperTheme, MarkdownPaperThemes } from '../types'

const cssPath = resolve(import.meta.dirname, 'aps.css')
const cssContent = await readFile(cssPath, 'utf-8')

export const themeAPS: MarkdownPaperTheme = async (args) => {
	let script: () => void = () => {}
	if (args.punctuation === 'zh') {
		script = () => {
			const nodes = document.querySelectorAll(
				'body > p, .abstract, .keywords, .author, .school',
			)
			// biome-ignore lint/complexity/noForEach: ...
			nodes.forEach((node) => {
				let text = node.textContent ?? ''
				// 替换中英文逗号和句号
				text = text
					.replace(/, /g, '，')
					.replace(/\. /g, '。')
					.replace(/\.$/, '。')
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
				text = text
					.replace(/et al\.，/g, 'et al., ')
					.replace(/et al。/g, 'et al. ')
				// 设置新文本
				node.textContent = text
			})
		}
	} else if (args.punctuation === 'en') {
		script = () => {
			const nodes = document.querySelectorAll(
				'body > p, .abstract, .keywords, .author, .school',
			)
			// biome-ignore lint/complexity/noForEach: ...
			nodes.forEach((node) => {
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
	}
	return {
		id: MarkdownPaperThemes.APS,
		label: '心理学报',
		css: cssContent,
		script,
		preParseMarkdown: async (md: string): Promise<string> => {
			return md
				.replace(/#author# (.*)/gm, '<div class="author">$1</div>')
				.replace(/#school# (.*)/gm, '<div class="school">$1</div>')
				.replace(/#keywords# (.*)/gm, '<div class="keywords">$1</div>')
				.replace(/#abstract# (.*)/gm, '<div class="abstract">$1</div>')
		},
		preParseHtml: async (html: string): Promise<string> => {
			// 把包裹图片的 p 标签去掉
			return html.replace(/<p><img (.*?)><\/p>/g, '<img $1>')
		},
		pdfOptions: {
			format: 'A4',
			margin: {
				top: '2cm',
				right: '2.5cm',
				bottom: '2cm',
				left: '2.5cm',
			},
			displayHeaderFooter: !args.hideFooter,
			headerTemplate: '<div></div>',
			footerTemplate: args.hideFooter
				? '<div></div>'
				: '<div style="font-size: 9px; font-family: \'SimSun\'; color: #333; padding: 5px; margin: 0 auto;">第 <span class="pageNumber"></span> 页 / 共 <span class="totalPages"></span> 页</div>',
		},
	}
}
