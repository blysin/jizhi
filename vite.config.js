import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  
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
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html')
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
        'axios'
      ]
    }
  }
})