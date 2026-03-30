<script setup>
import { ref, computed } from 'vue'

// 模拟后端接口报错日志数据
const apiLogList = ref([
  { id: 1, time: '2023-10-26 14:22:15', apiPath: '/api/v1/worker/websites', method: 'GET', statusCode: 500, errorMsg: 'Internal Server Error: Database connection timeout.' },
  { id: 2, time: '2023-10-26 15:05:33', apiPath: '/api/v1/admin/login', method: 'POST', statusCode: 401, errorMsg: 'Unauthorized: Invalid username or password.' },
  { id: 3, time: '2023-10-26 16:45:00', apiPath: '/api/v1/worker/feedback', method: 'POST', statusCode: 403, errorMsg: 'Forbidden: Insufficient permissions.' },
  { id: 4, time: '2023-10-26 17:10:12', apiPath: '/api/v1/admin/account', method: 'DELETE', statusCode: 404, errorMsg: 'Not Found: Target user does not exist.' },
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const pagedApiLogList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return apiLogList.value.slice(start, start + pageSize.value)
})
</script>

<template>
  <div>
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>后端接口日志</span>
        </div>
      </template>
      
      <el-table :data="pagedApiLogList" border style="width: 100%" stripe>
        <template #empty>
          <el-empty description="暂无后端接口报错日志" />
        </template>
        <el-table-column type="index" label="序号" width="70" align="center" />
        <el-table-column prop="time" label="发生时间" min-width="160" align="center" />
        <el-table-column prop="method" label="请求方式" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.method === 'GET' ? 'success' : (row.method === 'POST' ? 'primary' : 'warning')">
              {{ row.method }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="apiPath" label="接口路径" min-width="180" show-overflow-tooltip />
        <el-table-column label="状态码" width="100" align="center">
          <template #default="{ row }">
            <!-- 5开头显示红色，4开头显示橙色 -->
            <el-tag :type="row.statusCode >= 500 ? 'danger' : 'warning'" effect="dark">
              {{ row.statusCode }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="errorMsg" label="错误详细信息" min-width="200" show-overflow-tooltip />
      </el-table>
      
      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          background
          layout="total, sizes, prev, pager, next"
          :total="apiLogList.length"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  overflow-x: auto;
}
</style>