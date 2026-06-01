#!/usr/bin/env node

import { resolve } from 'node:path'

import { Command } from 'commander'

import { render } from '../lib/main.ts'
import { cliOptions } from '../lib/types.ts'
import pkg from '../package.json' with { type: 'json' }

const { version } = pkg

const program = new Command()
const cwd = process.cwd()
let browser = '/usr/bin/google-chrome'
switch (process.platform) {
  case 'win32':
    browser = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    break
  case 'darwin':
    browser = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    break
}

program
  .name('mdp')
  .description('MarkdownPaper CLI')
  .version(version)
  .argument('<markdown>', 'Markdown文件相对路径')
  .option('--out <path>', '输出文件相对路径')
  .option('--theme <name>', '论文模板', 'APS')
  .option('--html --output-html', '输出HTML文件', false)
  .option('--docx --output-docx', '输出DOCX文件', false)
  .option('--hide-footer', '隐藏页脚页码', false)
  .option('--punctuation <zh/en/origin>', '标点符号格式', 'zh')
  .option('--browser <path>', 'Puppeteer浏览器路径', browser)
  .command('themes', '显示所有可用的论文模板')
  .action((markdown, options) => {
    console.log('开始生成')
    const src = markdown.endsWith('.md') ? resolve(cwd, markdown) : resolve(cwd, `${markdown}.md`)
    const out = options.out ? resolve(cwd, options.out) : src.replace(/\.md$/, '.pdf')
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
