#!/usr/bin/env node

console.log(`
✅ Chrome扩展构建完成！

📁 构建产物位置: dist/

📦 要创建扩展zip包，请运行:
   yarn build:chrome:zip

或者手动打包:
   1. 打开Chrome浏览器，进入扩展管理页面 (chrome://extensions/)
   2. 开启"开发者模式"
   3. 点击"加载已解压的扩展程序"
   4. 选择 dist/ 目录

💡 提示: 使用 yarn build:chrome:zip 命令可以自动构建并打包为 chrome.zip 文件
`)