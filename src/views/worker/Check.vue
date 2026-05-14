<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Link } from '@element-plus/icons-vue'
import request from '@/utils/request.js'

// 核心数据源
const websiteList = ref([])
const tableLoading = ref(false)
const submitLoading = ref(false)

// 控制弹窗显示隐藏的变量
const dialogVisible = ref(false)
const feedbackFormRef = ref(null)

// 反馈表单的数据模型 (字段名与后端对齐)
const feedbackForm = reactive({
  websiteId: null,
  websiteName: '',
  problemType: '200', // 对应 statusCode
  remark: '' // 始终存在的备注字段
})

// 检查结果选项
const feedbackOptions = [
  { value: '200', label: '网站访问正常 (200)' },
  { value: '404', label: '404 Not Found' },
  { value: '400', label: '400 Bad Request' },
  { value: '403', label: '403 Forbidden' },
  { value: '402', label: '402 Payment Required' },
  { value: '401', label: '401 Unauthorized' },
  { value: '500', label: '500 Internal Server Error' },
  { value: '502', label: '502 Bad Gateway' },
  { value: '其他', label: '其他' }
]

// 表单校验规则
const rules = reactive({
  problemType: [{ required: true, message: '请选择检查结果', trigger: 'change' }],
  remark: [
    {
      validator: (rule, value, callback) => {
        // 如果选择了"其他"，则备注必须填写；否则为选填
        if (feedbackForm.problemType === '其他' && !value) {
          callback(new Error('选择“其他”时，请详细填写备注描述'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

// 获取今日待检查网站列表
const fetchTodoList = async () => {
  tableLoading.value = true
  try {
    const res = await request.get('/GET/website/todo/list')
    websiteList.value = (res || []).map(item => ({
      id: item.websiteId,
      name: item.websiteName,
      url: item.websiteUrl,
      status: 0 // 本地附加状态：0 待检查，1 已完成
    }))
  } catch (error) {
    console.error('获取待检查列表失败:', error)
  } finally {
    tableLoading.value = false
  }
}

onMounted(() => {
  fetchTodoList()
})

// 点击提交反馈按钮的事件
const handleFeedback = (row) => {
  feedbackForm.websiteId = row.id
  feedbackForm.websiteName = row.name
  feedbackForm.problemType = '200'
  feedbackForm.remark = '' // 每次打开弹窗清空上次的备注
  dialogVisible.value = true
}

// 提交反馈到后端的事件
const submitFeedback = () => {
  feedbackFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        // 构建传给后端的 InspectionResultVO 结构
        const payload = {
          websiteId: feedbackForm.websiteId,
          statusCode: feedbackForm.problemType,
          remark: feedbackForm.remark // 无论什么状态，都将 remark 提交给后端
        }

        await request.post('/POST/website/inspectionResults', payload)

        window.ElMessage.success('反馈提交成功！')

        // 状态更新：将对应的网站状态改为“已完成”
        const site = websiteList.value.find((item) => item.id === feedbackForm.websiteId)
        if (site) {
          site.status = 1
        }

        dialogVisible.value = false
      } catch (error) {
        console.error('提交反馈失败:', error)
      } finally {
        submitLoading.value = false
      }
    } else {
      window.ElMessage.warning('请检查表单填写是否完整')
      return false
    }
  })
}

const handleVisit = (row) => {
  if (row.status === 0) {
    window.ElMessage.success(`正在前往检查：${row.name}`)
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

      <el-table v-if="!isAllCompleted" v-loading="tableLoading" :data="pagedWebsiteList" border style="width: 100%"
        stripe>
        <template #empty>
          <el-empty description="暂无待检查的网站任务" />
        </template>
        <el-table-column type="index" label="序号" width="70" align="center" />

        <el-table-column prop="name" label="网站名称" min-width="150" show-overflow-tooltip />

        <el-table-column label="网站链接" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <el-link type="primary" :href="row.url" target="_blank" :icon="Link" @click="handleVisit(row)">
              {{ row.url }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column label="检查状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'warning' : 'success'">
              {{ row.status === 0 ? '待检查' : '已完成' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" :disabled="row.status === 1" @click="handleFeedback(row)">
              提交反馈
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!isAllCompleted" class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50]"
          background layout="total, sizes, prev, pager, next" :total="websiteList.length" />
      </div>

      <el-result v-else icon="success" title="恭喜你完成今日任务！" sub-title="所有待检查的网站均已反馈完毕，辛苦了~" />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="`提交反馈 - ${feedbackForm.websiteName}`" width="min(500px, 90vw)">
      <el-form :model="feedbackForm" :rules="rules" ref="feedbackFormRef" label-width="90px">
        <el-form-item label="检查结果" prop="problemType">
          <el-select v-model="feedbackForm.problemType" placeholder="请选择检查结果" style="width: 100%">
            <el-option v-for="item in feedbackOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="问题/备注" prop="remark">
          <el-input type="textarea" v-model="feedbackForm.remark" rows="4" placeholder="正常情况下可不填；发现问题请详细描述..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="submitFeedback">确 认 提 交</el-button>
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