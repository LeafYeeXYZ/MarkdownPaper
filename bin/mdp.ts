#!/usr/bin/env bun

import { MarkdownPaperOptions, renderMarkdown } from '../lib/main.ts'
/** 命令行参数 */
const args = process.argv.slice(2)
/** 当前工作目录 */
const cwd = process.cwd()
/**
 * 主函数
 * @param args 命令行参数
 * @param cwd 当前工作目录
 */
void async function main(args: string[], cwd: string) {
  try {
    // 如果没有参数, 显示帮助信息
    if (args.length === 0) {
      console.log(`\n使用方法:\n${MarkdownPaperOptions.format}\n`)
      process.exit(0)
    }
    // 解析参数
    console.log('\n开始生成\n')
    const options = new MarkdownPaperOptions(args, cwd)
    // 渲染 markdown
    await renderMarkdown(options)
    console.log('生成成功\n')
  } 
  catch (e) {
    if (e instanceof SyntaxError) {
      console.error(`参数错误, 正确格式:\n${MarkdownPaperOptions.format}\n`)
    } else if (e instanceof Error) {
      console.error(`错误:\n${e.message}\n`)
    }
  } 
  finally {
    process.exit(0)
  }
}(args, cwd)