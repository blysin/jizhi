import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  const isBrowserExtension = process.env.TARGET_BROWSER
  
  return {
    plugins: [
      react({
        fastRefresh: true
      })
    ],
    
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: isDev,
      minify: !isDev,
      // 为浏览器扩展优化构建配置
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html')
        },
        output: {
          // 避免使用eval相关的代码分割
          manualChunks: undefined,
          // 确保生成的代码符合CSP要求
          format: 'es'
        }
      }
    },
    
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode)
    },
    
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@constants': resolve(__dirname, 'src/constants'),
        '@sketchs': resolve(__dirname, 'src/sketchs')
      }
    },
    
    server: {
      port: 23002,
      open: false,
      hmr: {
        overlay: true
      }
    },
    
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'styled-components',
        'lodash',
        'axios',
        'p5',
        'react-p5-wrapper'
      ],
      // 确保p5.js正确预构建
      force: true
    }
  }
})