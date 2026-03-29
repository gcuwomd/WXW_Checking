<script setup>
import { ref } from 'vue'

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
      
      <el-table :data="logList" border style="width: 100%" stripe>
        <template #empty>
          <el-empty description="暂无干事检查日志" />
        </template>
        <el-table-column type="index" label="序号" width="80" align="center" />
        <el-table-column prop="workerName" label="检查干事" width="150" />
        <el-table-column prop="websiteName" label="被查网站" width="220" />
        <el-table-column label="检查结果" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.result === '正常' ? 'success' : 'danger'">
              {{ row.result }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="提交时间" width="200" align="center" />
        <el-table-column label="操作" align="center">
          <template #default="{ row }">
            <el-button size="small" type="primary" plain @click="handleDetail(row)">查看反馈描述</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>