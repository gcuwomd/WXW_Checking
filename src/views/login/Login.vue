<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user.js'
import request from '@/utils/request.js'

const router = useRouter()
const loginFormRef = ref(null)
const userStore = useUserStore()
const loading = ref(false)

// 表单绑定的数据对象
const loginForm = reactive({
  username: '', // 界面显示为账号/学号
  password: ''
})

// 表单校验规则
const rules = reactive({
  username: [{ required: true, message: '账号不能为空', trigger: 'blur' }],
  password: [{ required: true, message: '密码不能为空', trigger: 'blur' }]
})

// 登录点击事件
const handleLogin = () => {
  loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 第一步：调用登录接口获取 Token
        // 注意：这里根据后端需求将 username 作为 studentNum 传递
        const loginRes = await request.get('/login', {
          params: {
            studentNum: loginForm.username,
            password: loginForm.password
          }
        })

        // 提取 Token。根据通常习惯，loginRes 可能是 Token 字符串或包含 Token 的对象
        const token = loginRes.token || loginRes.accessToken || (typeof loginRes === 'string' ? loginRes : '')

        if (!token) {
          window.ElMessage.error('未获取到有效的登录凭证')
          return
        }

        // 存入 Pinia，拦截器会自动将其放入后续请求的 Header 中
        userStore.setToken(token)

        // 第二步：获取用户详细个人信息
        const profileRes = await request.get('/GET/users/profile')

        // 第三步：精准匹配角色和姓名
        // 根据你的反馈，管理员返回的是 "管理员"
        const isAdmin = profileRes.role === '管理员'

        // 更新全局用户信息状态
        userStore.setUserInfo({
          username: profileRes.studentName || '用户',
          role: isAdmin ? 'admin' : 'worker'
        })

        window.ElMessage.success('登录成功！即将进入系统')

        // 第四步：路由跳转
        if (isAdmin) {
          router.push('/admin')
        } else {
          router.push('/worker')
        }
      } catch (error) {
        console.error('登录流程执行失败:', error)
      } finally {
        loading.value = false
      }
    } else {
      return false
    }
  })
}
</script>

<template>
  <div class="login-container">
    <div class="top-left-info">
      <img src="/wxw.png" alt="部门图标" class="logo-small" />
      <span>学生网络与信息工作委员会·网站运维部</span>
    </div>

    <div class="login-box">
      <div class="login-header">
        <img src="/wxw.png" alt="部门图标" class="logo" />
        <h2 class="title">网站检查系统</h2>
      </div>

      <el-form :model="loginForm" ref="loginFormRef" :rules="rules" size="large">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入学号" clearable />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password
            @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-btn" @click="handleLogin" :loading="loading">登 录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-image: url('/LoginBackground.jpg');
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-box {
  width: 100%;
  max-width: 420px;
  box-sizing: border-box;
  padding: 50px 40px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.02));
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.login-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 35px;
}

.logo {
  width: 45px;
  height: 45px;
  margin-right: 15px;
}

.title {
  margin: 0;
  font-size: 26px;
  font-weight: 600;
  color: #222222;
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.top-left-info {
  position: absolute;
  top: 30px;
  left: 30px;
  display: flex;
  align-items: center;
  color: #ffffff;
  font-size: 18px;
  font-weight: 500;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  z-index: 10;
}

.logo-small {
  width: 30px;
  height: 30px;
  margin-right: 10px;
}

:deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.85);
  border-radius: 12px;
  box-shadow: none !important;
  padding: 0 15px;
  border: 1px solid transparent;
  transition: all 0.3s;
}

:deep(.el-input__wrapper.is-focus) {
  background-color: #ffffff;
  border: 1px solid #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2) !important;
}

:deep(.el-input__inner) {
  height: 46px;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

.login-btn {
  width: 100%;
  height: 48px;
  margin-top: 5px;
  font-size: 18px;
  letter-spacing: 4px;
  border-radius: 12px;
  font-weight: bold;
  background: linear-gradient(135deg, #409eff, #337ecc);
  border: none;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(64, 158, 255, 0.6);
}

@media (max-width: 768px) {
  .login-box {
    width: 90%;
    padding: 40px 20px;
  }

  .top-left-info {
    display: none;
  }
}
</style>