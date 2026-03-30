import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // 假设你的路由文件在 src/router/index.js
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue' // 引入所有图标以便全局注册

// 导入 Element Plus 的全局消息和弹窗组件，方便在非 setup 区域调用
import { ElMessage, ElMessageBox } from 'element-plus'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 全局注册 Element Plus 图标组件
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 将 Element Plus 的消息和弹窗组件挂载到全局，便于在任何地方调用 (如非 Vue 组件、路由守卫等)
window.ElMessage = ElMessage
window.ElMessageBox = ElMessageBox

app.mount('#app')