#!/usr/bin/env bun

import { resolve } from 'node:path'
import { Command } from 'commander'
import { render } from '../lib/main'
import { cliOptions } from '../lib/types'
import { version } from '../package.json'

const program = new Command()
const cwd = process.cwd()

program
	.name('mdp')
	.description('MarkdownPaper CLI')
	.version(version)
	.argument('<markdown>', 'Markdown文件相对路径')
	.option('--out <path>', '输出文件相对路径 (默认和Markdown文件相同)')
	.option('--theme <name>', '论文模板 (默认为心理学报)', 'APS')
	.option('--html --output-html', '输出HTML文件', false)
	.option('--docx --output-docx', '输出DOCX文件', false)
	.option('--hide-footer', '隐藏页脚页码', false)
	.option('--punctuation <zh/en/origin>', '标点符号格式', 'zh')
	.command('themes', '显示所有可用的论文模板')
	.action((markdown, options) => {
		console.log('开始生成')
		const src = markdown.endsWith('.md')
			? resolve(cwd, markdown)
			: resolve(cwd, `${markdown}.md`)
		const out = options.out
			? resolve(cwd, options.out)
			: src.replace(/\.md$/, '.pdf')
		const opts = cliOptions.parse({
			...options,
			src,
			out,
		})
		render(opts)
			.then(() => {
				console.log('生成成功')
				process.exit(0)
			})
			.catch((error) => {
				console.error(`生成失败: ${error.message}`)
				process.exit(1)
			})
	})

program.parse(process.argv)
