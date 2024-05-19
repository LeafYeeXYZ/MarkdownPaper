declare var self: Worker

import { $ } from 'bun'
import { Options } from './main'

self.onmessage = async (e) => {
  const options = e.data as Options
  await $`pdf2docx convert ${options.out}`
    .then(() => {
      postMessage('success')
    })
    .catch(() => {
      postMessage('error')
    })
    .finally(() => {
      process.exit(0)
    })
}
