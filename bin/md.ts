#!/usr/bin/env bun

import {
  validateArgs,
  renderMarkdown,
} from '../src/index'

// 获取命令行参数
const args = process.argv.slice(2)
// 校验错误的函数
const check = (err: Error | null) => {
  if (err) {
    console.error(err.message)
    process.exit(1)
  }
}

// 校验参数
const { src, out, err } = validateArgs(args)
check(err)

// 渲染 markdown
renderMarkdown(src, out)
  .then(() => console.log('\n生成成功\n'))
  .catch((err) => {
    console.error(err.message)
    process.exit(1)
  })