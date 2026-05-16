<script setup>
import { ref, reactive, onMounted } from 'vue'
import request from '@/utils/request.js'
import { ElMessage } from 'element-plus'

// 表格与加载状态
const tableData = ref([])
const total = ref(0)
const loading = ref(false)

// 筛选与分页参数 (根据后端要求，默认值为 '全部')
const queryParams = reactive({
  page: 1,
  limit: 10,
  kinds: '全部',
  type: '全部'
})

// 未检查人员弹窗状态
const dialogVisible = ref(false)
const uncheckList = ref([])
const uncheckLoading = ref(false)

// 格式化 ISO 时间为 "年月日 时分秒"
const formatTime = (timeStr) => {
  if (!timeStr) return '--'
  const date = new Date(timeStr)
  if (isNaN(date)) return timeStr.replace('T', ' ') // 兜底处理

  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')

  return `${y}年${m}月${d}日 ${hh}:${mm}:${ss}`
}

// 获取日志列表 (包含极致兼容的分页总数提取)
const getList = async () => {
  loading.value = true
  try {
    const res = await request.get('/GET/logs/website/log', { params: queryParams })

    let currentTotal = 0

    // 兼容后端不同命名习惯的分页返回结构
    if (res && res.records) {
      tableData.value = res.records
      currentTotal = res.total || 0
    } else if (res && res.list) {
      tableData.value = res.list
      currentTotal = res.total || 0
    } else if (Array.isArray(res)) {
      tableData.value = res
    } else if (res && res.data && Array.isArray(res.data)) {
      tableData.value = res.data
      currentTotal = res.total || res.data.total || 0
    } else {
      tableData.value = []
    }

    // 严谨的数字提取，防备 total 在外层的情况
    if (!currentTotal && res && res.total) {
      currentTotal = Number(res.total)
    }

    total.value = currentTotal || tableData.value.length
  } catch (error) {
    console.error('获取日志列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索操作
const handleSearch = () => {
  queryParams.page = 1
  getList()
}

// 重置搜索参数
const resetQuery = () => {
  queryParams.kinds = '全部'
  queryParams.type = '全部'
  handleSearch()
}

// 查看上一周期未检查人员
const handleViewUncheck = async () => {
  dialogVisible.value = true
  uncheckLoading.value = true
  uncheckList.value = []
  try {
    const res = await request.get('/GET/logs/website/uncheck')

    if (Array.isArray(res)) {
      uncheckList.value = res
    } else if (res && Array.isArray(res.data)) {
      uncheckList.value = res.data
    } else if (res && res.list) {
      uncheckList.value = res.list
    }

    if (uncheckList.value.length === 0) {
      ElMessage.success('上一周期所有人都完成了检查任务！')
    }
  } catch (error) {
    console.error('获取未检查人员失败:', error)
  } finally {
    uncheckLoading.value = false
  }
}

// 获取状态码对应的 Tag 颜色
const getStatusType = (code) => {
  const statusCode = String(code)
  if (statusCode === '200') return 'success'
  if (statusCode.startsWith('4') || statusCode.startsWith('5')) return 'danger'
  if (statusCode.startsWith('3')) return 'warning'
  return 'info'
}

// 分页条数改变
const handleSizeChange = (val) => {
  queryParams.limit = val
  queryParams.page = 1
  getList()
}

// 当前页码改变
const handleCurrentChange = (val) => {
  queryParams.page = val
  getList()
}

onMounted(() => {
  getList()
})
</script>

<template>
  <div class="log-container">
    <div class="filter-header">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="检查人类别">
          <el-select v-model="queryParams.kinds" placeholder="请选择或输入" allow-create filterable style="width: 160px;">
            <el-option label="全部" value="全部" />
            <el-option label="自动检查" value="自动检查" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态码">
          <el-select v-model="queryParams.type" placeholder="请选择状态码" allow-create filterable style="width: 140px;">
            <el-option label="全部" value="全部" />
            <el-option label="200 (正常)" value="200" />
            <el-option label="404 (找不到)" value="404" />
            <el-option label="500 (服务器错误)" value="500" />
            <el-option label="502 (网关错误)" value="502" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
          <el-button icon="RefreshRight" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="action-btn">
        <el-button type="warning" icon="Warning" @click="handleViewUncheck">
          查看上一周期未检人员
        </el-button>
      </div>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe class="custom-table">

      <el-table-column type="index" label="序号" width="60" align="center" />

      <el-table-column prop="websiteId" label="网站ID" align="center" width="100" />

      <el-table-column prop="checkerId" label="检查人" align="center" width="140">
        <template #default="scope">
          <el-tag :type="scope.row.checkerId === 'Auto' ? 'info' : 'primary'" effect="plain">
            {{ scope.row.checkerId === 'Auto' ? '自动检查' : scope.row.checkerId || '未知' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="checkRound" label="检查轮次" align="center" width="100">
        <template #default="scope">
          <el-tag type="warning" effect="light">第 {{ scope.row.checkRound || 1 }} 轮</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="statusCode" label="状态码" align="center" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.statusCode)" effect="dark">
            {{ scope.row.statusCode || 'N/A' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="remark" label="反馈备注" align="center" min-width="180" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ scope.row.remark || '无' }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="createTime" label="检查时间" align="center" width="220">
        <template #default="scope">
          {{ formatTime(scope.row.createTime) }}
        </template>
      </el-table-column>

    </el-table>

    <div class="pagination-wrapper">
      <el-pagination v-model:current-page="queryParams.page" v-model:page-size="queryParams.limit"
        :page-sizes="[10, 20, 50, 100]" background layout="total, sizes, prev, pager, next, jumper" :total="total"
        @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>

    <el-dialog title="上一周期未检人员名单" v-model="dialogVisible" width="500px" destroy-on-close>
      <div v-loading="uncheckLoading" class="uncheck-content">
        <el-empty v-if="uncheckList.length === 0" description="太棒了，所有人均已完成检查！" :image-size="100" />
        <el-table v-else :data="uncheckList" border stripe max-height="400">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="studentName" label="姓名" align="center">
            <template #default="scope">
              {{ scope.row.studentName || scope.row.username || scope.row }}
            </template>
          </el-table-column>
          <el-table-column prop="studentNum" label="学号" align="center" />
        </el-table>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="dialogVisible = false">关 闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.log-container {
  padding: 24px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  min-height: calc(100vh - 120px);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px dashed #ebeef5;
}

.action-btn {
  margin-bottom: 18px;
}

.custom-table {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.uncheck-content {
  min-height: 150px;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-dialog) {
  border-radius: 12px;
}
</style>