<script setup>
import { ref, computed } from 'vue'

// 模拟检查日志数据
const logList = ref([
  { id: 101, workerName: '张三', websiteName: '学校官网', result: '正常', description: '无异常', time: '2023-10-25 10:00:00' },
  { id: 102, workerName: '李四', websiteName: '教务处', result: '异常', description: '首页通知图片加载失败，出现404错误', time: '2023-10-25 11:30:00' },
  { id: 103, workerName: '王五', websiteName: '图书馆', result: '正常', description: '', time: '2023-10-26 09:15:00' },
])

// 后端自动检查状态开关
const autoCheckEnabled = ref(true)

// 切换自动检查状态的事件
const handleAutoCheckChange = (val) => {
  if (val) {
    ElMessage.success('已启用后端自动检查功能')
  } else {
    ElMessage.warning('已停用后端自动检查功能')
  }
}

// 查看详细描述
const handleDetail = (row) => {
  ElMessageBox.alert(row.description || '该干事没有填写详细描述', `【${row.websiteName}】检查详情`, {
    confirmButtonText: '关闭'
  })
}

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const pagedLogList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return logList.value.slice(start, start + pageSize.value)
})
</script>

<template>
  <div>
    <el-card shadow="never">
      <template #header>
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
          <span>检查日志</span>
          <div>
            <span style="margin-right: 15px; font-size: 14px; color: #606266;">后端自动检查状态：</span>
            <el-switch
              v-model="autoCheckEnabled"
              active-text="启用"
              inactive-text="停用"
              @change="handleAutoCheckChange"
            />
          </div>
        </div>
      </template>
      
      <el-table :data="pagedLogList" border style="width: 100%" stripe>
        <template #empty>
          <el-empty description="暂无干事检查日志" />
        </template>
        <el-table-column type="index" label="序号" width="70" align="center" />
        <el-table-column prop="workerName" label="检查干事" min-width="100" show-overflow-tooltip />
        <el-table-column prop="websiteName" label="被查网站" min-width="150" show-overflow-tooltip />
        <el-table-column label="检查结果" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.result === '正常' ? 'success' : 'danger'">
              {{ row.result }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="提交时间" min-width="160" align="center" />
        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" plain @click="handleDetail(row)">查看反馈描述</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          background
          layout="total, sizes, prev, pager, next"
          :total="logList.length"
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