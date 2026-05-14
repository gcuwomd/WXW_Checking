import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // 自动导入 Vue API (如 ref, reactive) 和 Element Plus 组件 API (如 ElMessage)
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia'],
      dts: false,
    }),
    // 自动按需导入 Element Plus 组件
    Components({
      resolvers: [ElementPlusResolver()],
      dts: false,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // 新增开发服务器代理配置
  server: {
    proxy: {
      // 捕获所有以 /api 开头的请求
      '/api': {
        target: 'http://114.132.92.175:1216', // 你的后端接口物理地址
        changeOrigin: true, // 允许跨域
        // 路径重写：把 '/api/login' 变成 '/login' 发给后端
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})