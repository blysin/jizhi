import { build } from 'vite'
import { resolve } from 'path'
import archiver from 'archiver'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import chalk from 'chalk'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function buildChrome() {
  console.log(chalk.blue('🚀 Building Chrome extension...'))
  
  // 设置环境变量
  process.env.TARGET_BROWSER = 'chrome'
  
  const startTime = Date.now()
  
  try {
    // 使用Vite构建
    await build({
      configFile: resolve(__dirname, '../vite.config.js'),
      mode: 'production'
    })
    
    console.log(chalk.green('✅ Chrome build completed'))
    
    // 复制Chrome扩展文件
    await copyExtensionFiles()
    
    // 创建zip文件
    await createChromeZip()
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(chalk.green(`🎉 Chrome extension build and packaging completed in ${duration}s!`))
    
    // 显示构建结果
    console.log(chalk.cyan('\n📋 Build Results:'))
    const distDir = 'dist'
    const zipFile = 'chrome.zip'
    
    if (fs.existsSync(distDir)) {
      console.log(chalk.green(`  ✅ Build output: ${distDir}/`))
    }
    if (fs.existsSync(zipFile)) {
      const stats = fs.statSync(zipFile)
      const size = (stats.size / 1024 / 1024).toFixed(2)
      console.log(chalk.blue(`  📦 Extension package: ${zipFile} (${size}MB)`))
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Chrome build failed:'), error)
    process.exit(1)
  }
}

async function copyExtensionFiles() {
  const distDir = 'dist'
  
  console.log(chalk.blue('📋 Copying Chrome extension files...'))
  
  // 复制manifest文件
  const manifestSrc = 'chrome.manifest.json'
  const manifestDest = resolve(distDir, 'manifest.json')
  
  if (fs.existsSync(manifestSrc)) {
    fs.copyFileSync(manifestSrc, manifestDest)
    console.log(chalk.green('  ✅ manifest.json copied'))
  } else {
    console.warn(chalk.yellow('  ⚠️  chrome.manifest.json not found'))
  }
  
  // 复制background script
  const backgroundSrc = 'chrome.background.js'
  const backgroundDest = resolve(distDir, 'background.js')
  
  if (fs.existsSync(backgroundSrc)) {
    fs.copyFileSync(backgroundSrc, backgroundDest)
    console.log(chalk.green('  ✅ background.js copied'))
  } else {
    console.warn(chalk.yellow('  ⚠️  chrome.background.js not found'))
  }
  
  // 复制popup文件（如果存在）
  const popupFiles = ['src/popup.html', 'src/popup.css', 'src/popup.js']
  
  popupFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const fileName = file.split('/').pop()
      const dest = resolve(distDir, fileName)
      fs.copyFileSync(file, dest)
      console.log(chalk.green(`  ✅ ${fileName} copied`))
    }
  })
  
  // 复制静态图标文件
  const srcStaticDir = 'src/static'
  const srcIconsDir = resolve(srcStaticDir, 'icons')
  
  if (fs.existsSync(srcIconsDir)) {
    const iconsDestDir = resolve(distDir, 'src', 'static', 'icons')
    
    // 创建目标目录
    if (!fs.existsSync(iconsDestDir)) {
      fs.mkdirSync(iconsDestDir, { recursive: true })
    }
    
    // 复制图标文件
    const iconFiles = fs.readdirSync(srcIconsDir)
    iconFiles.forEach(file => {
      if (file.endsWith('.png') || file.endsWith('.svg') || file.endsWith('.ico')) {
        const src = resolve(srcIconsDir, file)
        const dest = resolve(iconsDestDir, file)
        fs.copyFileSync(src, dest)
        console.log(chalk.green(`  ✅ src/static/icons/${file} copied`))
      }
    })
    console.log(chalk.green('  ✅ Source static icons copied'))
  } else {
    console.warn(chalk.yellow('  ⚠️  src/static/icons directory not found'))
  }
  
  // 复制原有的静态图标文件（如果存在）
  const staticDir = 'static'
  const iconsDir = resolve(staticDir, 'icons')
  
  if (fs.existsSync(iconsDir)) {
    const iconsDestDir = resolve(distDir, 'icons')
    
    // 创建目标目录
    if (!fs.existsSync(iconsDestDir)) {
      fs.mkdirSync(iconsDestDir, { recursive: true })
    }
    
    // 复制图标文件
    const iconFiles = fs.readdirSync(iconsDir)
    iconFiles.forEach(file => {
      if (file.endsWith('.png') || file.endsWith('.svg') || file.endsWith('.ico')) {
        const src = resolve(iconsDir, file)
        const dest = resolve(iconsDestDir, file)
        fs.copyFileSync(src, dest)
        console.log(chalk.green(`  ✅ icons/${file} copied`))
      }
    })
    console.log(chalk.green('  ✅ Static icons copied'))
  } else {
    console.warn(chalk.yellow('  ⚠️  static/icons directory not found'))
  }
}

async function createChromeZip() {
  const buildDir = 'dist'
  const zipPath = 'chrome.zip'
  
  // 删除旧的zip文件
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath)
    console.log(chalk.yellow('🧹 Removed old chrome.zip'))
  }
  
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath)
    const archive = archiver('zip', { zlib: { level: 9 } })
    
    output.on('close', () => {
      const size = (archive.pointer() / 1024 / 1024).toFixed(2)
      console.log(chalk.green(`📦 chrome.zip created (${size}MB)`))
      resolve()
    })
    
    archive.on('error', (err) => {
      console.error(chalk.red('❌ Archive error:'), err)
      reject(err)
    })
    
    archive.pipe(output)
    
    // 打包dist目录下的所有文件
    archive.directory(buildDir, false)
    archive.finalize()
  })
}

// 如果直接运行此脚本
if (process.argv[1].endsWith('build-chrome.js')) {
  buildChrome().catch(console.error)
}

export { buildChrome }