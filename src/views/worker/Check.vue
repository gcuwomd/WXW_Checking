<script setup>
import { ref, reactive, computed } from 'vue'
import { Link } from '@element-plus/icons-vue'

// status: 0 表示待检查，1 表示已反馈
const websiteList = ref([
  { id: 1, name: '计算机学院官网', url: 'https://www.baidu.com', status: 0 },
  { id: 2, name: '学校教务处', url: 'https://cn.bing.com', status: 0 },
  { id: 3, name: '校图书馆', url: 'https://github.com', status: 1 }
])

// 控制弹窗显示隐藏的变量
const dialogVisible = ref(false)
const feedbackFormRef = ref(null)

// 反馈表单的数据模型
const feedbackForm = reactive({
  websiteId: null,
  websiteName: '',
  problemType: '正常',
  description: ''
})

// 检查结果选项
const feedbackOptions = [
  { value: '正常', label: '网站访问正常' },
  { value: '404', label: '404 Not Found' },
  { value: '400', label: '400 Bad Request' },
  { value: '403', label: '403 Forbidden' },
  { value: '402', label: '402 Payment Required' },
  { value: '401', label: '401 Unauthorized' },
  { value: '500', label: '500 Internal Server Error' },
  { value: '其他', label: '其他' }
]

// 表单校验规则
const rules = reactive({
  problemType: [{ required: true, message: '请选择检查结果', trigger: 'change' }],
  description: [
    {
      validator: (rule, value, callback) => {
        if (feedbackForm.problemType === '其他' && !value) {
          callback(new Error('请填写其他问题描述'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

// 点击提交反馈按钮的事件
const handleFeedback = (row) => {
  // 初始化表单数据，将当前行的数据带入弹窗
  feedbackForm.websiteId = row.id
  feedbackForm.websiteName = row.name
  feedbackForm.problemType = '正常'
  feedbackForm.description = ''
  // 打开弹窗
  dialogVisible.value = true
}

// 提交反馈到后端的事件
const submitFeedback = () => {
  feedbackFormRef.value.validate((valid) => {
    if (valid) {
      const feedbackContent =
        feedbackForm.problemType === '其他' ? feedbackForm.description : feedbackForm.problemType

      console.log('即将提交的反馈数据:', {
        websiteId: feedbackForm.websiteId,
        feedback: feedbackContent
      })
      ElMessage.success('反馈提交成功！')
      // 模拟前端状态更新：将对应的网站状态改为“已完成”
      const site = websiteList.value.find((item) => item.id === feedbackForm.websiteId)
      if (site) {
        site.status = 1
      }

      // 关闭弹窗
      dialogVisible.value = false
    } else {
      ElMessage.warning('请检查表单填写是否完整')
      return false
    }
  })
}

const handleVisit = (row) => {
  if (row.status === 0) {
    ElMessage.success(`正在前往检查：${row.name}`)
  }
}

// 判断是否所有任务都已经完成
const isAllCompleted = computed(() => {
  return websiteList.value.length > 0 && websiteList.value.every(item => item.status === 1)
})

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const pagedWebsiteList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return websiteList.value.slice(start, start + pageSize.value)
})
</script>

<template>
  <div class="check-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>待检查网站列表</span>
        </div>
      </template>

      <!-- 网站列表数据表格 -->
      <el-table v-if="!isAllCompleted" :data="pagedWebsiteList" border style="width: 100%" stripe>
        <template #empty>
          <el-empty description="暂无待检查的网站任务" />
        </template>
        <el-table-column type="index" label="序号" width="70" align="center" />

        <el-table-column prop="name" label="网站名称" min-width="150" show-overflow-tooltip />

        <!-- 核心：使用插槽将 url 渲染为超链接 -->
        <el-table-column label="网站链接" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <!-- target="_blank" 表示在新标签页打开，不覆盖当前系统页面 -->
            <el-link type="primary" :href="row.url" target="_blank" :icon="Link" @click="handleVisit(row)">
              {{ row.url }}
            </el-link>
          </template>
        </el-table-column>

        <!-- 使用插槽将状态渲染为彩色标签 -->
        <el-table-column label="检查状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'warning' : 'success'">
              {{ row.status === 0 ? '待检查' : '已完成' }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" :disabled="row.status === 1" @click="handleFeedback(row)">
              提交反馈
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div v-if="!isAllCompleted" class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50]"
          background layout="total, sizes, prev, pager, next" :total="websiteList.length" />
      </div>

      <!-- 全部完成时的恭喜状态 -->
      <el-result v-else icon="success" title="恭喜你完成今日任务！" sub-title="所有待检查的网站均已反馈完毕，辛苦了~" />
    </el-card>

    <!-- 提交反馈的弹窗 (Dialog) -->
    <el-dialog v-model="dialogVisible" :title="`提交反馈 - ${feedbackForm.websiteName}`" width="min(500px, 90vw)">
      <el-form :model="feedbackForm" :rules="rules" ref="feedbackFormRef" label-width="90px">
        <el-form-item label="检查结果" prop="problemType">
          <el-select v-model="feedbackForm.problemType" placeholder="请选择检查结果" style="width: 100%">
            <el-option v-for="item in feedbackOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="feedbackForm.problemType === '其他'" label="问题描述" prop="description">
          <el-input type="textarea" v-model="feedbackForm.description" rows="4" placeholder="请详细描述发现的问题..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitFeedback">确 认 提 交</el-button>
        </span>
      </template>
    </el-dialog>
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