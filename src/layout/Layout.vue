<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user.js'
// 引入 Element Plus 官方图标
import { Document, Monitor, ArrowDown, User, Fold } from '@element-plus/icons-vue'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

// 退出登录下拉菜单事件
const handleLogout = (command) => {
  if (command === 'logout') {
    ElMessage.success('已安全退出系统')
    userStore.clearUserInfo() // 清空用户信息
    // 跳转回登录页
    router.push('/')
  }
}

// 手机端响应式状态
const isMobile = ref(false)
const showMobileMenu = ref(false)

const checkDevice = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) showMobileMenu.value = false
}

onMounted(() => {
  checkDevice()
  window.addEventListener('resize', checkDevice)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkDevice)
})
</script>

<template>
  <el-container class="layout-container">
    <!-- 手机端菜单遮罩层 -->
    <div v-if="showMobileMenu && isMobile" class="mobile-overlay" @click="showMobileMenu = false"></div>

    <!-- 左侧 侧边栏菜单 -->
    <el-aside width="220px" :class="['aside-menu', { 'mobile-show': showMobileMenu }]">
      <div class="logo-container">
        <img src="/wxw.png" alt="Logo" class="sidebar-logo" />
        <span class="sidebar-title">干事工作台</span>
      </div>

      <!-- 侧边栏导航 : router="true" 表示开启路由跳转模式，index会被当做 path -->
      <el-menu :default-active="route.path" class="el-menu-vertical" background-color="#2c3e50" text-color="#bfcbd9"
        active-text-color="#409eff" router @select="() => { if (isMobile) showMobileMenu = false }">
        <el-menu-item index="/worker/check">
          <el-icon>
            <Monitor />
          </el-icon>
          <span>网站检查</span>
        </el-menu-item>
        <el-menu-item index="/worker/instructions">
          <el-icon>
            <Document />
          </el-icon>
          <span>使用说明</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 右侧 内容区 -->
    <el-container>
      <!-- 顶部 导航条 -->
      <el-header class="header">
        <div class="header-left">
          <el-icon class="menu-toggle" @click="showMobileMenu = !showMobileMenu">
            <Fold />
          </el-icon>
          <span class="page-title">网站运维部 - 网站检查系统</span>
        </div>

        <div class="header-right">
          <el-dropdown trigger="click" @command="handleLogout">
            <span class="user-info">
              <el-icon class="user-avatar">
                <User />
              </el-icon>
              你好, {{ userStore.userInfo.username || '用户' }}
              <el-icon class="el-icon--right">
                <ArrowDown />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主体内容 (子路由出口) -->
      <el-main class="main-content">
        <!-- 在这里加载 /worker/dashboard 或其它子页面 -->
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-container {
  height: 100vh;
  width: 100vw;
}

.aside-menu {
  background-color: #2c3e50;
  display: flex;
  flex-direction: column;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #1a252f;
}

.sidebar-logo {
  width: 32px;
  height: 32px;
  margin-right: 10px;
}

.sidebar-title {
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
}

.el-menu-vertical {
  border-right: none;
  flex: 1;
}

.header-left {
  display: flex;
  align-items: center;
}

.header {
  background-color: #ffffff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  z-index: 10;
}

.page-title {
  font-size: 18px;
  font-weight: 500;
  color: #333333;
}

.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 15px;
  color: #333333;
  outline: none;
}

.user-avatar {
  margin-right: 8px;
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}

.menu-toggle {
  display: none;
  font-size: 22px;
  margin-right: 15px;
  cursor: pointer;
  color: #333333;
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
}

/* 手机端样式适配 */
@media (max-width: 768px) {
  .aside-menu {
    position: fixed;
    left: -220px;
    top: 0;
    bottom: 0;
    z-index: 100;
    transition: left 0.3s ease;
  }

  .aside-menu.mobile-show {
    left: 0;
  }

  .menu-toggle {
    display: block;
  }

  .page-title {
    font-size: 16px;
  }

  .user-info {
    font-size: 14px;
  }

  .main-content {
    padding: 12px;
  }
}
</style>