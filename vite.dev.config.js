import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react({
      fastRefresh: true
    })
  ],
  
  server: {
    port: 23002,
    open: true,
    hmr: {
      overlay: true
    }
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
  
  css: {
    devSourcemap: true
  },
  
  define: {
    'process.env.NODE_ENV': JSON.stringify('development'),
    'process.env.TARGET_BROWSER': JSON.stringify('chrome')
  },
  
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'styled-components',
      'lodash',
      'axios',
      'react-p5-wrapper'
    ]
  }
})