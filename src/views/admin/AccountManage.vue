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
const dialogTitle = ref('新增用户')
const formRef = ref(null)

// 表单数据绑定
const formData = reactive({
  username: '',
  studentNum: '',
  password: '',
  role: 1, // 0: 管理员, 1: 干事 (按通用规范预设)
  status: 1  // 1: 正常, 0: 禁用
})

// 表单验证规则
const rules = reactive({
  username: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  studentNum: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
})

// 获取用户列表
const getList = async () => {
  loading.value = true
  try {
    const res = await request.get('/GET/users', { params: queryParams })

    // 兼容后端不同命名习惯的分页返回结构
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
    console.error('获取用户列表失败', error)
  } finally {
    loading.value = false
  }
}

// 刷新/查询
const handleQuery = () => {
  queryParams.page = 1
  getList()
}

// 点击新增按钮
const handleAdd = () => {
  dialogTitle.value = '新增用户'
  Object.assign(formData, {
    username: '',
    studentNum: '',
    password: '',
    role: 1,
    status: 1
  })
  dialogVisible.value = true
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 点击编辑按钮
const handleEdit = async (row) => {
  dialogTitle.value = '编辑用户'
  try {
    // 获取最新用户信息填充表单
    const res = await request.get('/GET/user/info', { params: { studentNum: row.studentNum } })
    Object.assign(formData, res)
    // 密码通常不直接返回明文，此处清空。输入框加上非必填校验即可
    formData.password = ''
    dialogVisible.value = true
  } catch (error) {
    console.error('获取用户信息失败', error)
  }
}

// 提交表单（新增/修改合并处理）
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (dialogTitle.value === '新增用户') {
          await request.post('/POST/user/new', formData)
          ElMessage.success('新增用户成功')
        } else {
          // 编辑时如果密码留空，可以视后端逻辑而定，这里直接提交
          await request.post('/POST/user/info', formData)
          ElMessage.success('更新用户信息成功')
        }
        dialogVisible.value = false
        getList()
      } catch (error) {
        console.error('提交失败', error)
      }
    }
  })
}

// 点击删除按钮
const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除用户 ${row.username} 吗？此操作不可逆！`, '危险操作', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // DELETE 请求，且 Body 类型为 integer
      await request.delete('/DELETE/user', { data: row.studentNum })
      ElMessage.success('删除成功')
      // 如果当前页只有一条数据且不是第一页，删除后跳回上一页
      if (tableData.value.length === 1 && queryParams.page > 1) {
        queryParams.page--
      }
      getList()
    } catch (error) {
      console.error('删除失败', error)
    }
  }).catch(() => { })
}

// 每页条数改变
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
  <div class="account-container">
    <div class="header-actions">
      <el-button type="primary" icon="Plus" @click="handleAdd">新增用户</el-button>
      <el-button icon="Refresh" @click="handleQuery">刷新列表</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe class="custom-table">
      <el-table-column prop="studentNum" label="学号" align="center" width="160" />
      <el-table-column prop="username" label="姓名" align="center" width="160" />

      <el-table-column prop="role" label="角色" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.role === 0 ? 'danger' : 'primary'" effect="light">
            {{ scope.row.role === 1 ? '管理员' : '干事' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="status" label="状态" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" effect="light">
            {{ scope.row.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" min-width="180">
        <template #default="scope">
          <el-button size="small" type="primary" link icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" link icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination v-model:current-page="queryParams.page" v-model:page-size="queryParams.limit"
        :page-sizes="[10, 20, 50]" background layout="total, sizes, prev, pager, next, jumper" :total="total"
        @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px" class="dialog-form">
        <el-form-item label="学号" prop="studentNum">
          <el-input v-model.number="formData.studentNum" placeholder="请输入学号" :disabled="dialogTitle === '编辑用户'" />
        </el-form-item>
        <el-form-item label="姓名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入姓名" />
        </el-form-item>

        <el-form-item label="密码" prop="password" :rules="dialogTitle === '新增用户' ? rules.password : []">
          <el-input v-model="formData.password" placeholder="请输入密码(编辑时不填则不修改)" show-password />
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-select v-model="formData.role" placeholder="请选择角色" style="width: 100%;">
            <el-option label="管理员" :value="1" />
            <el-option label="干事" :value="0" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%;">
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
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
.account-container {
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