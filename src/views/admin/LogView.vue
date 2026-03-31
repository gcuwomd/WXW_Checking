<script setup>
import { ref, computed, onMounted, onUnmounted, markRaw } from 'vue'
import * as echarts from 'echarts'

// ==================== 原有逻辑：详细检查日志表格 ====================
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
    window.ElMessage.success('已启用后端自动检查功能')
  } else {
    window.ElMessage.warning('已停用后端自动检查功能')
  }
}

// 查看详细描述
const handleDetail = (row) => {
  window.ElMessageBox.alert(row.description || '该干事没有填写详细描述', `【${row.websiteName}】检查详情`, {
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


// ==================== 新增逻辑：顶部可视化大屏 ====================
// --- 核心 KPI 数据 (Mock) ---
const missedCount = ref(5)
const totalCheckCount = ref(342)

// --- 右侧未检查干事名单 (Mock) ---
const missingWorkers = ref([
  { id: 1, name: '郑必颖', group: '第一小组', missedDays: ['周一', '周五'] },
  { id: 2, name: '李四', group: '第三小组', missedDays: ['周三'] },
  { id: 3, name: '王五', group: '第二小组', missedDays: ['周一', '周三', '周五'] },
  { id: 4, name: '赵六', group: '第一小组', missedDays: ['周五'] },
  { id: 5, name: '陈七', group: '第四小组', missedDays: ['周一'] }
])

// --- ECharts 实例与 DOM 引用 ---
const pieChartRef = ref(null)
const barChartRef = ref(null)
const rankChartRef = ref(null)

let pieChartInstance = null
let barChartInstance = null
let rankChartInstance = null

const initPieChart = () => {
  pieChartInstance = markRaw(echarts.init(pieChartRef.value))
  pieChartInstance.setOption({
    title: { text: '异常网站占比', left: 'center', textStyle: { fontSize: 15 } },
    tooltip: { trigger: 'item' },
    legend: { bottom: '0', left: 'center' },
    color: ['#67C23A', '#F56C6C'],
    series: [{
      name: '检查结果', type: 'pie', radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 5, borderColor: '#fff', borderWidth: 2 },
      label: { show: false, position: 'center' },
      emphasis: { label: { show: true, fontSize: 18, fontWeight: 'bold' } },
      labelLine: { show: false },
      data: [{ value: 310, name: '正常网站' }, { value: 32, name: '发现异常' }]
    }]
  })
}

const initBarChart = () => {
  barChartInstance = markRaw(echarts.init(barChartRef.value))
  barChartInstance.setOption({
    title: { text: '异常情况统计', left: 'center', textStyle: { fontSize: 15 } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value', boundaryGap: [0, 0.01] },
    yAxis: { type: 'category', data: ['暗链/死链', '排版错乱', '图片挂图', '无法访问'] },
    color: ['#E6A23C'],
    series: [{
      name: '数量', type: 'bar', barWidth: '50%', data: [4, 7, 12, 9],
      itemStyle: { borderRadius: [0, 4, 4, 0] }
    }]
  })
}

const initRankChart = () => {
  rankChartInstance = markRaw(echarts.init(rankChartRef.value))
  rankChartInstance.setOption({
    title: { text: '干事检查量排行 (Top 5)', left: 'center', textStyle: { fontSize: 15 } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: ['张三', '周八', '吴九', '郑十', '孙二'], axisTick: { alignWithLabel: true } },
    yAxis: { type: 'value' },
    color: ['#409EFF'],
    series: [{
      name: '检查量', type: 'bar', barWidth: '40%', data: [45, 42, 38, 35, 30],
      itemStyle: { borderRadius: [4, 4, 0, 0] }
    }]
  })
}

const handleResize = () => {
  pieChartInstance?.resize()
  barChartInstance?.resize()
  rankChartInstance?.resize()
}

onMounted(() => {
  setTimeout(() => {
    initPieChart()
    initBarChart()
    initRankChart()
  }, 0)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  pieChartInstance?.dispose()
  barChartInstance?.dispose()
  rankChartInstance?.dispose()
})

const getTagType = (day) => {
  const map = { '周一': 'warning', '周三': 'info', '周五': 'danger' }
  return map[day] || 'primary'
}
</script>

<template>
  <div class="log-view-container">

    <el-row :gutter="20" class="dashboard-section">
      <el-col :span="16">
        <el-row :gutter="20" class="kpi-row">
          <el-col :span="12">
            <el-card shadow="hover" class="kpi-card danger-bg">
              <div class="kpi-title">上一周期未检查人次</div>
              <div class="kpi-value text-danger">{{ missedCount }} <span class="unit">人次</span></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="hover" class="kpi-card primary-bg">
              <div class="kpi-title">上一周期总检查网站数</div>
              <div class="kpi-value text-primary">{{ totalCheckCount }} <span class="unit">个</span></div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" class="chart-row">
          <el-col :span="8">
            <el-card shadow="hover" class="chart-card">
              <div ref="pieChartRef" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover" class="chart-card">
              <div ref="barChartRef" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover" class="chart-card">
              <div ref="rankChartRef" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover" class="right-card">
          <template #header>
            <div class="card-header">
              <span>上一周期未检查名单</span>
              <el-tag type="danger" size="small" effect="plain" style="margin-left: 15px;">考核预警</el-tag>
            </div>
          </template>
          <el-table :data="missingWorkers" style="width: 100%" height="340" stripe>
            <el-table-column prop="name" label="姓名" width="80" />
            <el-table-column prop="group" label="小组" width="90" />
            <el-table-column label="缺查日期">
              <template #default="scope">
                <el-space wrap>
                  <el-tag v-for="day in scope.row.missedDays" :key="day" :type="getTagType(day)" size="small">
                    {{ day }}
                  </el-tag>
                </el-space>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never">
      <template #header>
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
          <span>详细检查日志</span>
          <div>
            <span style="margin-right: 15px; font-size: 14px; color: #606266;">后端自动检查状态：</span>
            <el-switch v-model="autoCheckEnabled" active-text="启用" inactive-text="停用" @change="handleAutoCheckChange" />
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

      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50]"
          background layout="total, sizes, prev, pager, next" :total="logList.length" />
      </div>
    </el-card>

  </div>
</template>

<style scoped>
/* ==================== 整体与大屏样式 ==================== */
.log-view-container {
  padding-bottom: 20px;
}

.dashboard-section {
  margin-bottom: 20px;
}

.kpi-row {
  margin-bottom: 20px;
}

/* 彻底解决卡片出现内部滚动条的 Bug */
.kpi-card {
  height: 120px;
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
  margin-bottom: 10px;
  font-weight: bold;
}

.kpi-value {
  font-size: 36px;
  font-weight: 900;
  line-height: 1;
}

.unit {
  font-size: 16px;
  font-weight: normal;
}

.text-danger {
  color: #F56C6C;
}

.text-primary {
  color: #409EFF;
}

.danger-bg {
  background: linear-gradient(135deg, #fff 0%, #fef0f0 100%);
}

.primary-bg {
  background: linear-gradient(135deg, #fff 0%, #ecf5ff 100%);
}

/* 图表卡片样式 */
.chart-card {
  border-radius: 12px;
  overflow: hidden;
}

.chart-container {
  width: 100%;
  height: 250px;
}

/* 修复高度对齐：改为 430px 精准对齐左侧整体高度 */
.right-card {
  height: 430px;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.right-card :deep(.el-card__body) {
  flex: 1;
  overflow: hidden;
  padding: 15px;
}

/* 右侧卡片头部标题与标签布局 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

/* 自定义表格滚动条隐藏（美化） */
:deep(.el-table__body-wrapper::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-thumb) {
  background-color: #dcdfe6;
  border-radius: 3px;
}

/* ==================== 原有：分页容器样式 ==================== */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  overflow-x: auto;
}
</style>