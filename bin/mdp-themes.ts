#!/usr/bin/env node

import { Command } from 'commander'

import { themeLabels } from '../lib/types.ts'
import pkg from '../package.json' with { type: 'json' }

const { version } = pkg

const program = new Command()

program
  .name('mdp-themes')
  .description('MarkdownPaper CLI - 显示所有可用的论文模板')
  .version(version)
  .action(() => {
    console.log('可用的论文模板:')
    for (const [id, label] of Object.entries(themeLabels)) {
      console.log(`- ${id} (${label})`)
    }
  })

program.parse(process.argv)
