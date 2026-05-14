<script setup>
import { ref, reactive, onMounted } from 'vue'
import request from '@/utils/request.js'

// 表格与加载状态
const tableData = ref([])
const total = ref(0)
const loading = ref(false)

// 筛选与分页参数
const queryParams = reactive({
  page: 1,
  limit: 10,
  requestMethod: '全部',
  statusCode: '全部'
})

// 获取 API 日志列表
const getList = async () => {
  loading.value = true
  try {
    const res = await request.get('/GET/logs/api', { params: queryParams })

    // 兼容多种分页数据结构
    if (res && res.records) {
      tableData.value = res.records
      total.value = res.total || 0
    } else if (res && res.list) {
      tableData.value = res.list
      total.value = res.total || 0
    } else if (Array.isArray(res)) {
      tableData.value = res
      total.value = res.length
    } else if (res && res.data && Array.isArray(res.data)) {
      tableData.value = res.data
      total.value = res.total || res.data.length
    } else {
      tableData.value = []
    }
  } catch (error) {
    console.error('获取API日志列表失败:', error)
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
  queryParams.requestMethod = '全部'
  queryParams.statusCode = '全部'
  handleSearch()
}

// 获取请求方法对应的 Tag 样式
const getMethodType = (method) => {
  const m = String(method).toUpperCase()
  if (m === 'GET') return 'primary'
  if (m === 'POST') return 'success'
  if (m === 'PUT') return 'warning'
  if (m === 'DELETE') return 'danger'
  return 'info'
}

// 获取状态码对应的 Tag 样式
const getStatusType = (code) => {
  const statusCode = String(code)
  if (statusCode === '200' || statusCode === '0') return 'success'
  if (statusCode.startsWith('4')) return 'warning'
  if (statusCode.startsWith('5')) return 'danger'
  return 'info'
}

// 分页条数改变
const handleSizeChange = (val) => {
  queryParams.limit = val
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
  <div class="api-log-container">
    <div class="filter-header">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="请求方法">
          <el-select v-model="queryParams.requestMethod" placeholder="请选择" style="width: 140px;">
            <el-option label="全部" value="全部" />
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态码">
          <el-select v-model="queryParams.statusCode" placeholder="请选择或输入" allow-create filterable
            style="width: 140px;">
            <el-option label="全部" value="全部" />
            <el-option label="200 (成功)" value="200" />
            <el-option label="400 (请求错误)" value="400" />
            <el-option label="401 (未授权)" value="401" />
            <el-option label="404 (未找到)" value="404" />
            <el-option label="500 (服务器错误)" value="500" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
          <el-button icon="RefreshRight" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe class="custom-table">
      <el-table-column type="index" label="序号" width="60" align="center" />

      <el-table-column prop="requestMethod" label="请求方法" align="center" width="120">
        <template #default="scope">
          <el-tag :type="getMethodType(scope.row.requestMethod || scope.row.method)" effect="dark" round>
            {{ scope.row.requestMethod || scope.row.method || '未知' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="requestUrl" label="请求路径" align="left" min-width="220" show-overflow-tooltip>
        <template #default="scope">
          <span style="font-family: monospace;">{{ scope.row.requestUrl || scope.row.path || scope.row.url || '--'
            }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="statusCode" label="状态码" align="center" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.statusCode || scope.row.status)" effect="plain">
            {{ scope.row.statusCode || scope.row.status || 'N/A' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="operator" label="操作人" align="center" width="150" show-overflow-tooltip>
        <template #default="scope">
          {{ scope.row.operator || scope.row.studentNum || scope.row.username || '系统/匿名' }}
        </template>
      </el-table-column>

      <el-table-column prop="ip" label="IP 地址" align="center" width="140" show-overflow-tooltip>
        <template #default="scope">
          {{ scope.row.ip || scope.row.clientIp || '--' }}
        </template>
      </el-table-column>

      <el-table-column prop="createTime" label="请求时间" align="center" width="160">
        <template #default="scope">
          {{ scope.row.createTime || scope.row.requestTime || '--' }}
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination v-model:current-page="queryParams.page" v-model:page-size="queryParams.limit"
        :page-sizes="[10, 20, 50, 100]" background layout="total, sizes, prev, pager, next, jumper" :total="total"
        @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>
  </div>
</template>

<style scoped>
.api-log-container {
  padding: 24px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  min-height: calc(100vh - 120px);
}

.filter-header {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px dashed #ebeef5;
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

:deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 20px;
}
</style>