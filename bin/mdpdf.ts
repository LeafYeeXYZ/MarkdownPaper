#!/usr/bin/env bun

import { main } from '../lib/main'

// 获取命令行参数
const args = process.argv.slice(2)
const cwd = process.cwd()

// 渲染 markdown
main(args, cwd)