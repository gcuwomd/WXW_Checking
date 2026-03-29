import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      // 这行代码的作用就是，当用户访问网站根目录 (/) 时，  
      // 加载并显示我们刚刚编写的 Login.vue 组件。
      component: () => import('../views/login/Login.vue')
    },
    {
      // 干事端主布局路由
      path: '/worker',
      name: 'workerLayout',
      component: () => import('../layout/Layout.vue'),
      // 访问 /worker 时，自动重定向到工作台子页面
      redirect: '/worker/check',
      // children 就是子路由：它们会在 Layout 组件内的 <router-view> 中渲染
      children: [
        {
          path: 'check',
          name: 'workerCheck',
          component: () => import('../views/worker/Check.vue')
        },
        {
          path: 'instructions',
          name: 'workerInstructions',
          component: () => import('../views/worker/Instructions.vue')
        }
      ]
    },
    {
      // 管理员端主布局路由
      path: '/admin',
      name: 'adminLayout',
      component: () => import('../layout/AdminLayout.vue'),
      redirect: '/admin/account',
      children: [
        {
          path: 'account',
          name: 'adminAccount',
          component: () => import('../views/admin/AccountManage.vue')
        },
        {
          path: 'logs/check',
          name: 'adminCheckLogs',
          component: () => import('../views/admin/LogView.vue')
        },
        {
          path: 'logs/api',
          name: 'adminApiLogs',
          component: () => import('../views/admin/ApiLogView.vue')
        },
        {
          path: 'websites',
          name: 'adminWebsites',
          component: () => import('../views/admin/WebsiteManage.vue')
        }
      ]
    }
  ]
})

export default router
