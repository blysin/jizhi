import { build } from 'vite'
import { resolve } from 'path'
import archiver from 'archiver'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import chalk from 'chalk'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const browsers = ['chrome', 'firefox']

async function buildForBrowser(browser) {
  console.log(chalk.blue(`🚀 Building for ${browser}...`))
  
  const buildDir = `builds/build_${browser}`
  
  // 设置环境变量
  process.env.TARGET_BROWSER = browser
  
  try {
    // 使用Vite构建到临时目录
    await build({
      configFile: resolve(__dirname, '../vite.config.js'),
      mode: 'production',
      build: {
        outDir: buildDir,
        emptyOutDir: true
      }
    })
    
    // 复制扩展相关文件
    await copyExtensionFiles(browser, buildDir)
    
    console.log(chalk.green(`✅ ${browser} build completed`))
    
    // 创建zip文件
    await createZip(browser)
    
  } catch (error) {
    console.error(chalk.red(`❌ ${browser} build failed:`), error)
    throw error
  }
}

async function copyExtensionFiles(browser, buildDir) {
  const rootDir = resolve(__dirname, '..')
  
  // 确保构建目录存在
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true })
  }
  
  // 复制manifest文件
  const manifestSrc = resolve(rootDir, `${browser}.manifest.json`)
  const manifestDest = resolve(buildDir, 'manifest.json')
  if (fs.existsSync(manifestSrc)) {
    fs.copyFileSync(manifestSrc, manifestDest)
    console.log(chalk.yellow(`📋 Copied ${browser}.manifest.json`))
  }
  
  // 复制background脚本
  const backgroundSrc = resolve(rootDir, `${browser}.background.js`)
  const backgroundDest = resolve(buildDir, 'background.js')
  if (fs.existsSync(backgroundSrc)) {
    fs.copyFileSync(backgroundSrc, backgroundDest)
    console.log(chalk.yellow(`🔧 Copied ${browser}.background.js`))
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
    console.log(chalk.yellow(`📁 Copied static directory`))
  }
  
  // 复制src/static/icons目录中的PNG图标文件
  const srcStaticIconsSrc = resolve(rootDir, 'src', 'static', 'icons')
  const srcStaticIconsDest = resolve(buildDir, 'src', 'static', 'icons')
  if (fs.existsSync(srcStaticIconsSrc)) {
    // 确保目标目录存在
    if (!fs.existsSync(srcStaticIconsDest)) {
      fs.mkdirSync(srcStaticIconsDest, { recursive: true })
    }
    
    // 复制PNG图标文件
    const iconFiles = fs.readdirSync(srcStaticIconsSrc)
    iconFiles.forEach(file => {
      if (file.endsWith('.png') || file.endsWith('.svg') || file.endsWith('.ico')) {
        const srcFile = resolve(srcStaticIconsSrc, file)
        const destFile = resolve(srcStaticIconsDest, file)
        fs.copyFileSync(srcFile, destFile)
        console.log(chalk.yellow(`🖼️ Copied src/static/icons/${file}`))
      }
    })
    console.log(chalk.yellow(`📁 Copied src/static/icons directory`))
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

async function createZip(browser) {
  const buildDir = `builds/build_${browser}`
  const zipPath = `builds/${browser}-extension.zip`
  
  // 检查构建目录是否存在且不为空
  if (!fs.existsSync(buildDir)) {
    throw new Error(`Build directory ${buildDir} does not exist`)
  }
  
  const files = fs.readdirSync(buildDir)
  if (files.length === 0) {
    throw new Error(`Build directory ${buildDir} is empty`)
  }
  
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath)
    const archive = archiver('zip', { zlib: { level: 9 } })
    
    output.on('close', () => {
      const size = (archive.pointer() / 1024 / 1024).toFixed(2)
      console.log(chalk.green(`📦 ${browser}-extension.zip created (${size}MB)`))
      resolve()
    })
    
    archive.on('error', (err) => {
      console.error(chalk.red(`❌ Archive error for ${browser}:`), err)
      reject(err)
    })
    
    archive.pipe(output)
    archive.directory(buildDir, false)
    archive.finalize()
  })
}

async function buildAll() {
  console.log(chalk.cyan('🔧 Starting multi-browser build process...'))
  
  // 清理旧的构建产物
  if (fs.existsSync('builds')) {
    fs.rmSync('builds', { recursive: true, force: true })
    console.log(chalk.yellow('🧹 Cleaned old builds'))
  }
  
  const startTime = Date.now()
  
  try {
    // 并行构建所有浏览器
    await Promise.all(browsers.map(buildForBrowser))
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(chalk.green(`🎉 All builds completed successfully in ${duration}s!`))
    
    // 显示构建结果
    console.log(chalk.cyan('\\n📋 Build Results:'))
    browsers.forEach(browser => {
      const buildDir = `builds/build_${browser}`
      const zipFile = `builds/${browser}-extension.zip`
      
      if (fs.existsSync(buildDir)) {
        console.log(chalk.green(`  ✅ ${browser}: ${buildDir}`))
      }
      if (fs.existsSync(zipFile)) {
        const stats = fs.statSync(zipFile)
        const size = (stats.size / 1024 / 1024).toFixed(2)
        console.log(chalk.blue(`  📦 ${browser}: ${zipFile} (${size}MB)`))
      }
    })
    
  } catch (error) {
    console.error(chalk.red('❌ Build process failed:'), error)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (process.argv[1].endsWith('build-all.js')) {
  buildAll().catch(console.error)
}

export { buildAll, buildForBrowser }