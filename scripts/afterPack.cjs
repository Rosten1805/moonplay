const { cpSync, existsSync } = require('fs')
const path = require('path')

exports.default = async function afterPack(context) {
  const src = path.join(__dirname, '..', '.next', 'standalone', 'node_modules')
  const dest = path.join(
    context.appOutDir,
    'resources',
    'app',
    '.next',
    'standalone',
    'node_modules'
  )

  if (!existsSync(src)) {
    throw new Error(`afterPack: standalone node_modules not found at ${src}`)
  }

  console.log('  → Copying standalone node_modules into packaged app...')
  cpSync(src, dest, { recursive: true })
  console.log('  ✓ Done')
}
