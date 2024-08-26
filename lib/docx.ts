declare var self: Worker

import { $ } from 'bun'

self.onmessage = async (e) => {
  const pdfPath = e.data as string
  await $`pdf2docx convert ${pdfPath}`
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
