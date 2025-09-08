# Chrome扩展构建和打包指南

## 快速开始

### 方法1: 一键构建并打包 (推荐)
```bash
yarn build:chrome:zip
```
这个命令会：
1. 使用Vite构建生产版本
2. 复制Chrome扩展必需的文件（manifest.json、background.js等）
3. 自动创建`chrome.zip`文件

### 方法2: 分步骤构建
```bash
# 仅构建（不打包）
yarn build:chrome

# 手动打包（在build:chrome之后）
yarn build:chrome:zip
```

## 构建产物

### 构建目录: `dist/`
- `index.html` - 主页面
- `manifest.json` - Chrome扩展配置文件
- `background.js` - 后台脚本
- `popup.html` - 弹窗页面（如果存在）
- `popup.css` - 弹窗样式
- `popup.js` - 弹窗脚本
- `assets/` - 静态资源（CSS、JS、字体文件等）

### 打包文件: `chrome.zip`
- 包含`dist/`目录下的所有文件
- 大小约5.13MB
- 可直接上传到Chrome Web Store

## 安装和测试

### 开发者模式安装
1. 打开Chrome浏览器
2. 进入扩展管理页面: `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目根目录下的`dist/`文件夹

### Chrome Web Store上传
1. 执行 `yarn build:chrome:zip`
2. 登录 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
3. 上传生成的`chrome.zip`文件

## 配置文件说明

### 源文件
- `chrome.manifest.json` - Chrome扩展配置模板
- `chrome.background.js` - 后台脚本源文件
- `src/popup.*` - 弹窗相关文件

### 构建过程
1. Vite构建主应用到`dist/`
2. 复制扩展文件到`dist/`
3. 打包`dist/`为`chrome.zip`

## 故障排除

### 构建失败
- 确保Node.js版本 >= 24.0.0
- 检查依赖是否完整安装: `yarn install`
- 清理缓存: `rm -rf node_modules/.cache`

### 扩展无法加载
- 检查`dist/manifest.json`是否存在
- 验证manifest文件格式是否正确
- 确保所有引用的文件都在`dist/`目录中

### zip文件过大
- 当前大小约5.13MB，主要由字体文件占用
- 如需优化可考虑：
  - 使用web字体CDN
  - 压缩图片资源
  - 启用代码分割

## 相关命令

```bash
# 开发
yarn dev                    # 启动开发服务器

# 构建
yarn build                  # 构建所有浏览器版本
yarn build:chrome           # 仅构建Chrome版本
yarn build:chrome:zip       # 构建Chrome版本并打包
yarn build:firefox          # 仅构建Firefox版本

# 测试
yarn test                   # 运行单元测试
yarn lint                   # 代码检查
yarn format                 # 代码格式化
```