<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, markRaw } from 'vue'
import * as echarts from 'echarts'

// ==================== 原有逻辑：网站库基础数据与 CRUD ====================
// 模拟网站库数据
const websiteList = ref([
  { id: 1, name: '学校官网', url: 'https://www.example.edu.cn', status: 1 },
  { id: 2, name: '教务处', url: 'https://jwc.example.edu.cn', status: 1 },
  { id: 3, name: '图书馆', url: 'https://lib.example.edu.cn', status: 0 },
  { id: 4, name: '计算机学院', url: 'https://cs.example.edu.cn', status: 1 },
])

// 弹窗相关状态
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)
const form = reactive({ id: null, name: '', url: '', status: 1 })
const rules = reactive({
  name: [{ required: true, message: '请输入网站名称', trigger: 'blur' }],
  url: [{ required: true, message: '请输入网站链接', trigger: 'blur' }]
})

// 新增网站
const handleAdd = () => {
  dialogTitle.value = '新增网站'
  form.id = null
  form.name = ''
  form.url = ''
  form.status = 1
  dialogVisible.value = true
}

// 编辑网站
const handleEdit = (row) => {
  dialogTitle.value = '编辑网站'
  form.id = row.id
  form.name = row.name
  form.url = row.url
  form.status = row.status
  dialogVisible.value = true
}

// 提交表单
const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (form.id) {
        const index = websiteList.value.findIndex(item => item.id === form.id)
        if (index !== -1) { websiteList.value[index] = { ...websiteList.value[index], name: form.name, url: form.url, status: form.status } }
        window.ElMessage.success('修改成功')
      } else {
        websiteList.value.push({ id: Date.now(), name: form.name, url: form.url, status: form.status })
        window.ElMessage.success('新增成功')
      }
      dialogVisible.value = false
    }
  })
}

// 删除网站
const handleDelete = (row) => {
  window.ElMessageBox.confirm(
    `确定要从网站库中删除【${row.name}】吗？`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 模拟删除：从列表中移除
    websiteList.value = websiteList.value.filter(item => item.id !== row.id)
    window.ElMessage.success('删除成功')
  }).catch(() => {
    window.ElMessage.info('已取消删除')
  })
}

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const pagedWebsiteList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return websiteList.value.slice(start, start + pageSize.value)
})

// ==================== 新增逻辑 1：顶部可视化大屏 ====================
// KPI 数据计算
const totalSitesCount = computed(() => websiteList.value.length)
const newSitesThisMonth = ref(18) // 模拟当月新增收录数

const pieChartRef = ref(null)
let pieChartInstance = null

const initPieChart = () => {
  pieChartInstance = markRaw(echarts.init(pieChartRef.value))
  pieChartInstance.setOption({
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', right: '5%', top: 'center' },
    color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C'],
    series: [
      {
        name: '网站归属类别',
        type: 'pie',
        radius: ['50%', '80%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
        labelLine: { show: false },
        data: [
          { value: 15, name: '职能部门' },
          { value: 20, name: '各级学院' },
          { value: 5, name: '教辅机构' },
          { value: 2, name: '附属单位' }
        ]
      }
    ]
  })
}

const handleResize = () => {
  pieChartInstance?.resize()
}

onMounted(() => {
  setTimeout(() => {
    initPieChart()
  }, 0)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  pieChartInstance?.dispose()
})

// ==================== 新增逻辑 2：网站库更新与 Diff 对比人工审核 ====================
const diffDialogVisible = ref(false)

// 模拟的更新差异数据
const diffList = ref([])

// 点击更新网站库，触发生成差异对比数据
const handleUpdateLibrary = () => {
  diffList.value = [
    { id: 991, name: '外国语学院', type: 'add', oldUrl: '无', newUrl: 'https://fl.example.edu.cn' },
    { id: 2, name: '教务处', type: 'update', oldUrl: 'https://jwc.example.edu.cn', newUrl: 'https://jwc.new-domain.edu.cn' },
    { id: 3, name: '图书馆', type: 'delete', oldUrl: 'https://lib.example.edu.cn', newUrl: '已下线' }
  ]
  diffDialogVisible.value = true
}

// 根据变更类型返回 Tag 类型
const getDiffTagType = (type) => {
  const map = { 'add': 'success', 'update': 'warning', 'delete': 'danger' }
  return map[type] || 'info'
}

// 根据变更类型返回中文描述
const getDiffTagText = (type) => {
  const map = { 'add': '新增网站', 'update': '信息变更', 'delete': '网站下线' }
  return map[type] || '未知状态'
}

// 管理员确认无误，执行数据库同步更新
const confirmDiffUpdate = () => {
  // 模拟将 Diff 变更应用到真实的 websiteList 中
  diffList.value.forEach(item => {
    if (item.type === 'add') {
      websiteList.value.unshift({ id: item.id, name: item.name, url: item.newUrl, status: 1 })
    } else if (item.type === 'update') {
      const idx = websiteList.value.findIndex(w => w.name === item.name)
      if (idx !== -1) websiteList.value[idx].url = item.newUrl
    } else if (item.type === 'delete') {
      const idx = websiteList.value.findIndex(w => w.name === item.name)
      if (idx !== -1) websiteList.value.splice(idx, 1)
    }
  })

  window.ElMessage.success('人工审核完成，网站库数据库已成功同步更新！')
  diffDialogVisible.value = false
}
</script>

<template>
  <div class="website-manage-container">

    <el-row :gutter="20" class="dashboard-section">
      <el-col :span="8">
        <el-card shadow="hover" class="kpi-card primary-bg">
          <div class="kpi-title">系统总收录网站数</div>
          <div class="kpi-value text-primary">{{ totalSitesCount }} <span class="unit">个</span></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="kpi-card success-bg">
          <div class="kpi-title">本月新增收录</div>
          <div class="kpi-value text-success">+{{ newSitesThisMonth }} <span class="unit">个</span></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="chart-card">
          <div class="chart-header">收录类别分布</div>
          <div ref="pieChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never">
      <template #header>
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
          <span>网站库数据详情</span>
        </div>
      </template>

      <div class="toolbar" style="margin-bottom: 20px; display: flex; gap: 12px;">
        <el-button type="primary" @click="handleAdd" :icon="'Plus'">手动新增网站</el-button>
        <el-button type="success" plain @click="handleUpdateLibrary" :icon="'RefreshRight'">
          一键检测更新网站库
        </el-button>
      </div>

      <el-table :data="pagedWebsiteList" border style="width: 100%" stripe>
        <template #empty>
          <el-empty description="暂无网站库数据" />
        </template>
        <el-table-column type="index" label="序号" width="70" align="center" />
        <el-table-column prop="name" label="网站名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="url" label="网站链接" min-width="200" show-overflow-tooltip />
        <el-table-column label="检查状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用中' : '已停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50]"
          background layout="total, sizes, prev, pager, next" :total="websiteList.length" />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="min(500px, 90vw)">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="网站名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入网站名称" />
        </el-form-item>
        <el-form-item label="网站链接" prop="url">
          <el-input v-model="form.url" placeholder="请输入完整链接，如 https://..." />
        </el-form-item>
        <el-form-item label="启用检查">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="停用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="diffDialogVisible" title="新版网站库数据比对确认 (人工审核环节)" width="75%" top="5vh">
      <el-alert title="系统已检测到最新的来源数据，正在与当前数据库进行比对。请管理员仔细核对下列高亮的变更项，确认无误后点击下方按钮执行同步。" type="warning" show-icon
        style="margin-bottom: 20px;" :closable="false" />

      <el-table :data="diffList" border style="width: 100%" height="400">
        <el-table-column prop="name" label="受影响网站名称" width="160" />

        <el-table-column label="变更类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getDiffTagType(row.type)" effect="dark">
              {{ getDiffTagText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="数据详情对比 (URL与状态变更)">
          <template #default="{ row }">
            <div v-if="row.type === 'add'" class="diff-content diff-add">
              <strong>[新增收录]</strong> 地址：<span class="text-success">{{ row.newUrl }}</span>
            </div>

            <div v-else-if="row.type === 'update'" class="diff-content diff-update">
              <div style="margin-bottom: 5px;">
                <span style="color: #909399;">原记录：</span>
                <del>{{ row.oldUrl }}</del>
              </div>
              <div>
                <span class="text-warning" style="font-weight: bold;">新记录：</span>
                <span class="text-warning">{{ row.newUrl }}</span>
              </div>
            </div>

            <div v-else-if="row.type === 'delete'" class="diff-content diff-delete">
              <span style="color: #909399;">原记录将下线：</span>
              <del class="text-danger">{{ row.oldUrl }}</del>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="diffDialogVisible = false">取消更新</el-button>
          <el-button type="primary" @click="confirmDiffUpdate" :icon="'Check'">确认无误，同步至数据库</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<style scoped>
/* ==================== 顶部大屏样式 ==================== */
.website-manage-container {
  padding-bottom: 20px;
}

.dashboard-section {
  margin-bottom: 20px;
}

/* 统一 KPI 和图表的高度为 140px，修复滚动条 bug */
.kpi-card,
.chart-card {
  height: 140px;
  border-radius: 12px;
  border: none;
  overflow: hidden;
}

.kpi-card :deep(.el-card__body) {
  height: 100%;
  box-sizing: border-box;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.kpi-title {
  font-size: 16px;
  color: #606266;
  margin-bottom: 15px;
  font-weight: bold;
}

.kpi-value {
  font-size: 38px;
  font-weight: 900;
  line-height: 1;
}

.unit {
  font-size: 16px;
  font-weight: normal;
}

.text-primary {
  color: #409EFF;
}

.text-success {
  color: #67C23A;
}

.primary-bg {
  background: linear-gradient(135deg, #fff 0%, #ecf5ff 100%);
}

.success-bg {
  background: linear-gradient(135deg, #fff 0%, #f0f9eb 100%);
}

/* 图表内部样式 */
.chart-card :deep(.el-card__body) {
  height: 100%;
  box-sizing: border-box;
  padding: 10px 20px;
  display: flex;
  flex-direction: column;
}

.chart-header {
  font-size: 14px;
  font-weight: bold;
  color: #606266;
  margin-bottom: 5px;
}

.chart-container {
  flex: 1;
  width: 100%;
}

/* ==================== Diff 对比弹窗内文字样式 ==================== */
.diff-content {
  font-size: 14px;
  line-height: 1.5;
}

.text-danger {
  color: #F56C6C;
}

.text-warning {
  color: #E6A23C;
}

/* ==================== 表格通用样式 ==================== */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  overflow-x: auto;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-thumb) {
  background-color: #dcdfe6;
  border-radius: 3px;
}
</style>