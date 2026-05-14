<script setup>
import { ref, reactive, onMounted } from 'vue'
import request from '@/utils/request.js'
import { ElMessage, ElMessageBox } from 'element-plus'

// 表格与加载状态
const tableData = ref([])
const total = ref(0)
const loading = ref(false)

// 分页与查询参数
const queryParams = reactive({
  page: 1,
  limit: 10
})

// 弹窗状态
const dialogVisible = ref(false)
const formRef = ref(null)

// 新增网站表单数据 (后端要求通过 Query 传递)
const formData = reactive({
  websiteName: '',
  websiteUrl: '',
  websiteEnable: 1 // 1为启用，0为禁用
})

// 表单验证规则
const rules = reactive({
  websiteName: [{ required: true, message: '请输入网站名称', trigger: 'blur' }],
  websiteUrl: [
    { required: true, message: '请输入网站地址', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL地址 (例如: http://www.example.com)', trigger: 'blur' }
  ],
  websiteEnable: [{ required: true, message: '请选择启用状态', trigger: 'change' }]
})

// 获取列表数据与总数
const getList = async () => {
  loading.value = true
  try {
    // 1. 获取列表
    const listRes = await request.get('/GET/website/list', { params: queryParams })

    let currentTotal = 0

    // 兼容不同的列表返回结构，并尝试从中直接提取 total（部分后端框架自带分页参数）
    if (listRes && listRes.records) {
      tableData.value = listRes.records
      currentTotal = listRes.total || 0
    } else if (listRes && listRes.list) {
      tableData.value = listRes.list
      currentTotal = listRes.total || 0
    } else if (Array.isArray(listRes)) {
      tableData.value = listRes
    } else if (listRes && listRes.data && Array.isArray(listRes.data)) {
      tableData.value = listRes.data
      currentTotal = listRes.total || listRes.data.total || 0
    } else {
      tableData.value = []
    }

    // 2. 如果列表接口没带总数，调用独立的获取总数接口
    if (!currentTotal) {
      try {
        const countRes = await request.get('/GET/website/count')
        console.log('--- 诊断日志: 获取总数接口返回 ---', countRes)

        // 极致兼容：数字、字符串、或者对象里的各种常见命名
        if (typeof countRes === 'number' || typeof countRes === 'string') {
          currentTotal = Number(countRes)
        } else if (countRes) {
          currentTotal = Number(countRes.count || countRes.total || countRes.data || 0)
        }
      } catch (countError) {
        console.error('获取独立总数接口失败:', countError)
      }
    }

    // 3. 最终赋值，如果所有途径都失败，才使用当前页数据长度作为兜底
    total.value = currentTotal || tableData.value.length
    console.log('--- 诊断日志: 最终应用的分页 Total ---', total.value)

  } catch (error) {
    console.error('获取网站列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 刷新
const handleQuery = () => {
  queryParams.page = 1
  getList()
}

// 修改网站是否启用 (Switch 开关触发)
const handleEnableChange = async (row) => {
  try {
    // 后端文档要求通过 Query 传参: websiteEnable, id
    await request.put('/PUT/website/enable', null, {
      params: {
        id: row.id,
        websiteEnable: row.websiteEnable
      }
    })
    ElMessage.success(`网站 [${row.websiteName}] 状态更新成功`)
  } catch (error) {
    // 如果请求失败，把状态复原
    row.websiteEnable = row.websiteEnable === 1 ? 0 : 1
    console.error('修改状态失败:', error)
  }
}

// 点击新增按钮
const handleAdd = () => {
  Object.assign(formData, {
    websiteName: '',
    websiteUrl: '',
    websiteEnable: 1
  })
  dialogVisible.value = true
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 提交新增表单
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 后端文档明确说明，这些参数位置在 query
        await request.post('/POST/website/manual', null, { params: formData })
        ElMessage.success('手动上传网站成功')
        dialogVisible.value = false
        getList()
      } catch (error) {
        console.error('新增网站失败:', error)
      }
    }
  })
}

// 点击删除按钮
const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除网站 "${row.websiteName}" 吗？此操作不可逆！`, '警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // DELETE 请求，参数位置在 query: id
      await request.delete('/DELETE/website', { params: { id: row.id } })
      ElMessage.success('删除成功')

      // 处理临界页码
      if (tableData.value.length === 1 && queryParams.page > 1) {
        queryParams.page--
      }
      getList()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => { })
}

// 分页条数改变
const handleSizeChange = (val) => {
  queryParams.limit = val
  queryParams.page = 1 // 改变每页条数时，主动重置回第一页，防止页码越界
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
  <div class="website-container">
    <div class="header-actions">
      <el-button type="primary" icon="Plus" @click="handleAdd">手动收录网站</el-button>
      <el-button icon="Refresh" @click="handleQuery">刷新列表</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe class="custom-table">
      <el-table-column prop="id" label="ID" align="center" width="80" />
      <el-table-column prop="websiteName" label="网站名称" align="center" min-width="150" />

      <el-table-column prop="websiteUrl" label="网站地址" align="center" min-width="250" show-overflow-tooltip>
        <template #default="scope">
          <el-link type="primary" :href="scope.row.websiteUrl" target="_blank" :underline="false">
            {{ scope.row.websiteUrl }}
          </el-link>
        </template>
      </el-table-column>

      <el-table-column prop="websiteEnable" label="启用状态" align="center" width="120">
        <template #default="scope">
          <el-switch v-model="scope.row.websiteEnable" :active-value="1" :inactive-value="0" active-text="启用"
            inactive-text="停用" inline-prompt @change="handleEnableChange(scope.row)" />
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="150">
        <template #default="scope">
          <el-button size="small" type="danger" link icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination v-model:current-page="queryParams.page" v-model:page-size="queryParams.limit"
        :page-sizes="[10, 20, 50]" background layout="total, sizes, prev, pager, next, jumper" :total="total"
        @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>

    <el-dialog title="手动上传网站" v-model="dialogVisible" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="90px" class="dialog-form">
        <el-form-item label="网站名称" prop="websiteName">
          <el-input v-model="formData.websiteName" placeholder="例如：计算机学院官网" />
        </el-form-item>

        <el-form-item label="网站地址" prop="websiteUrl">
          <el-input v-model="formData.websiteUrl" placeholder="需包含 http:// 或 https://" />
        </el-form-item>

        <el-form-item label="启用状态" prop="websiteEnable">
          <el-radio-group v-model="formData.websiteEnable">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.website-container {
  padding: 24px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  min-height: calc(100vh - 120px);
}

.header-actions {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  margin-bottom: 20px;
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

.dialog-form {
  padding-right: 20px;
}

:deep(.el-dialog) {
  border-radius: 12px;
}
</style>