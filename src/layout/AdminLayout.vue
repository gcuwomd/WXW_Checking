<script setup>
import { useRouter, useRoute } from 'vue-router'
// 引入 Element Plus 官方图标
import { User, Document, Setting, ArrowDown, Warning } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 退出登录下拉菜单事件
const handleLogout = (command) => {
  if (command === 'logout') {
    ElMessage.success('已安全退出系统')
    // 跳转回登录页
    router.push('/')
  }
}
</script>

<template>
  <el-container class="layout-container">
    <!-- 左侧 侧边栏菜单 -->
    <el-aside width="220px" class="aside-menu">
      <div class="logo-container">
        <img src="/wxw.png" alt="Logo" class="sidebar-logo" />
        <span class="sidebar-title">管理员后台</span>
      </div>
      
      <!-- 侧边栏导航 : router="true" 表示开启路由跳转模式，index会被当做 path -->
      <el-menu
        :default-active="route.path"
        class="el-menu-vertical"
        background-color="#2c3e50"
        text-color="#bfcbd9"
        active-text-color="#409eff"
        router
      >
        <el-menu-item index="/admin/account">
          <el-icon><User /></el-icon>
          <span>账号管理</span>
        </el-menu-item>
        
        <!-- 日志管理 二级导航栏 -->
        <el-sub-menu index="/admin/logs">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>日志管理</span>
          </template>
          <el-menu-item index="/admin/logs/check">检查日志</el-menu-item>
          <el-menu-item index="/admin/logs/api">后端接口日志</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/admin/websites">
          <el-icon><Setting /></el-icon>
          <span>网站库管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 右侧 内容区 -->
    <el-container>
      <!-- 顶部 导航条 -->
      <el-header class="header">
        <div class="header-left">
          <span class="page-title">网站运维部 - 网站检查系统</span>
        </div>
        
        <div class="header-right">
          <el-dropdown @command="handleLogout">
            <span class="user-info">
              <el-icon class="user-avatar"><User /></el-icon>
              你好, 管理员
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
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
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-container { height: 100vh; width: 100vw; }
.aside-menu { background-color: #2c3e50; display: flex; flex-direction: column; }
.logo-container { height: 60px; display: flex; align-items: center; justify-content: center; background-color: #1a252f; }
.sidebar-logo { width: 32px; height: 32px; margin-right: 10px; }
.sidebar-title { color: #ffffff; font-size: 18px; font-weight: 600; }
.el-menu-vertical { border-right: none; flex: 1; }
.header { background-color: #ffffff; box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08); display: flex; justify-content: space-between; align-items: center; padding: 0 20px; z-index: 10; }
.page-title { font-size: 18px; font-weight: 500; color: #333333; }
.user-info { cursor: pointer; display: flex; align-items: center; font-size: 15px; color: #333333; outline: none; }
.user-avatar {
  margin-right: 8px;
}
.main-content { background-color: #f0f2f5; padding: 20px; overflow-y: auto; }
</style>