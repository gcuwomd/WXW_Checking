import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建 axios 实例
const request = axios.create({
    // 对应 vite.config.js 中的代理路径
    baseURL: '/api',
    timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
    (config) => {
        const userStore = useUserStore()
        // 如果 store 中有 token，则在所有请求头中携带 Bearer Token
        if (userStore.token) {
            config.headers['Authorization'] = `Bearer ${userStore.token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 响应拦截器
request.interceptors.response.use(
    (response) => {
        const res = response.data
        // 兼容后端返回的 code: 200 或 code: 0 为成功的情况
        if (res.code === 200 || res.code === 0) {
            return res.data
        } else {
            // 业务错误，抛出全局提示
            ElMessage.error(res.message || '系统繁忙，请稍后再试')
            return Promise.reject(new Error(res.message || 'Error'))
        }
    },
    (error) => {
        if (error.response) {
            const status = error.response.status
            if (status === 401) {
                ElMessage.error('登录状态已过期，请重新登录')
                const userStore = useUserStore()
                userStore.clearUserInfo()
                router.push('/')
            } else {
                ElMessage.error(error.message || '网络请求错误')
            }
        } else {
            ElMessage.error('网络连接异常，请检查您的网络')
        }
        return Promise.reject(error)
    }
)

export default request