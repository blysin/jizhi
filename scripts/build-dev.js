import { build } from 'vite'
import { resolve } from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import chalk from 'chalk'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function buildForDev() {
  console.log(chalk.blue('🚀 Building Chrome extension for development...'))
  
  const buildDir = 'builds/build_chrome_dev'
  
  try {
    // 使用Vite构建到开发目录
    await build({
      configFile: resolve(__dirname, '../vite.config.js'),
      mode: 'development',
      build: {
        outDir: buildDir,
        emptyOutDir: true,
        sourcemap: true,
        minify: false
      }
    })
    
    // 复制扩展相关文件
    await copyExtensionFiles(buildDir)
    
    console.log(chalk.green('✅ Development build completed!'))
    console.log(chalk.yellow(`📁 Extension files are in: ${buildDir}`))
    console.log(chalk.cyan('💡 Load this directory as unpacked extension in Chrome'))
    
  } catch (error) {
    console.error(chalk.red('❌ Development build failed:'), error)
    throw error
  }
}

async function copyExtensionFiles(buildDir) {
  const rootDir = resolve(__dirname, '..')
  
  // 确保构建目录存在
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true })
  }
  
  // 创建开发环境专用的manifest（包含unsafe-eval）
  const manifestSrc = resolve(rootDir, 'chrome.manifest.json')
  const manifestDest = resolve(buildDir, 'manifest.json')
  
  if (fs.existsSync(manifestSrc)) {
    const manifestContent = JSON.parse(fs.readFileSync(manifestSrc, 'utf8'))
    
    // 为开发环境添加unsafe-eval
    if (manifestContent.content_security_policy) {
      manifestContent.content_security_policy.extension_pages = 
        "script-src 'self' 'unsafe-eval'; object-src 'self'"
    }
    
    fs.writeFileSync(manifestDest, JSON.stringify(manifestContent, null, 2))
    console.log(chalk.yellow('📋 Created development manifest.json with unsafe-eval'))
  }
  
  // 复制background脚本
  const backgroundSrc = resolve(rootDir, 'chrome.background.js')
  const backgroundDest = resolve(buildDir, 'background.js')
  if (fs.existsSync(backgroundSrc)) {
    fs.copyFileSync(backgroundSrc, backgroundDest)
    console.log(chalk.yellow('🔧 Copied chrome.background.js'))
  }
  
  // 复制popup相关文件
  const popupFiles = ['popup.html', 'popup.css', 'popup.js']
  const srcDir = resolve(rootDir, 'src')
  
  for (const file of popupFiles) {
    const srcFile = resolve(srcDir, file)
    const destFile = resolve(buildDir, file)
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, destFile)
      console.log(chalk.yellow(`📄 Copied ${file}`))
    }
  }
  
  // 复制static目录（包含图标等静态资源）
  const staticSrc = resolve(rootDir, 'static')
  const staticDest = resolve(buildDir, 'static')
  if (fs.existsSync(staticSrc)) {
    copyDirectorySync(staticSrc, staticDest)
    console.log(chalk.yellow('📁 Copied static directory'))
  }
}

// 递归复制目录的辅助函数
function copyDirectorySync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true })
  
  for (const entry of entries) {
    const srcPath = resolve(src, entry.name)
    const destPath = resolve(dest, entry.name)
    
    if (entry.isDirectory()) {
      copyDirectorySync(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

// 如果直接运行此脚本
if (process.argv[1].endsWith('build-dev.js')) {
  buildForDev().catch(console.error)
}

export { buildForDev }