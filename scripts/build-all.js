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
  
  // 设置环境变量
  process.env.TARGET_BROWSER = browser
  
  try {
    // 使用Vite构建
    await build({
      configFile: resolve(__dirname, '../vite.config.js'),
      mode: 'production'
    })
    
    console.log(chalk.green(`✅ ${browser} build completed`))
    
    // 创建zip文件
    await createZip(browser)
    
  } catch (error) {
    console.error(chalk.red(`❌ ${browser} build failed:`), error)
    throw error
  }
}

async function createZip(browser) {
  const buildDir = `builds/build_${browser}`
  const zipPath = `builds/${browser}-extension.zip`
  
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