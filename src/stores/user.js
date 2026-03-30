import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
    // ref() 相当于 state 属性
    const token = ref(localStorage.getItem('token') || '') // 模拟 token
    const userInfo = ref(JSON.parse(localStorage.getItem('userInfo')) || { username: '', role: '' })

    // function() 相当于 actions 和 getters
    const setToken = (newToken) => {
        token.value = newToken
        localStorage.setItem('token', newToken) // 持久化到 localStorage
    }

    const setUserInfo = (newUserInfo) => {
        userInfo.value = newUserInfo
        localStorage.setItem('userInfo', JSON.stringify(newUserInfo)) // 持久化到 localStorage
    }

    const clearUserInfo = () => {
        token.value = ''
        userInfo.value = { username: '', role: '' }
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
    }

    return {
        token,
        userInfo,
        setToken,
        setUserInfo,
        clearUserInfo
    }
})