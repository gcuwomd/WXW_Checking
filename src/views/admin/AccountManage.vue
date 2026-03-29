<script setup>
import { ref, reactive } from 'vue'

// 模拟干事账号数据
const accountList = ref([
  { id: 1, username: 'worker_01', name: '张三', role: '干事', status: 1 },
  { id: 2, username: 'worker_02', name: '李四', role: '干事', status: 1 },
  { id: 3, username: 'worker_03', name: '王五', role: '干事', status: 0 },
])

// 弹窗相关状态
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)
const form = reactive({ id: null, username: '', name: '', password: '', role: '干事', status: 1 })
const rules = reactive({
  username: [{ required: true, message: '请输入登录账号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
})

// 新增账号
const handleAdd = () => {
  dialogTitle.value = '新增账号'
  form.id = null
  form.username = ''
  form.name = ''
  form.password = ''
  form.role = '干事'
  form.status = 1
  dialogVisible.value = true
}

// 编辑账号
const handleEdit = (row) => {
  dialogTitle.value = '修改账号'
  form.id = row.id
  form.username = row.username
  form.name = row.name
  form.password = '' // 编辑时不回显原密码
  form.role = row.role
  form.status = row.status
  dialogVisible.value = true
}

// 提交表单
const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (form.id) {
        const index = accountList.value.findIndex(item => item.id === form.id)
        if (index !== -1) {
          accountList.value[index] = { ...accountList.value[index], username: form.username, name: form.name, role: form.role, status: form.status }
        }
        ElMessage.success('修改成功')
      } else {
        accountList.value.push({ id: Date.now(), username: form.username, name: form.name, role: form.role, status: form.status })
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
    }
  })
}

// 删除账号
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除账号【${row.username}】吗？`, '警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    accountList.value = accountList.value.filter(item => item.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>

<template>
  <div>
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>账号管理</span>
        </div>
      </template>
      <el-button type="primary" @click="handleAdd" style="margin-bottom: 20px;">新增账号</el-button>

      <el-table :data="accountList" border style="width: 100%" stripe>
        <template #empty>
          <el-empty description="暂无干事账号数据" />
        </template>
        <el-table-column type="index" label="序号" width="80" align="center" />
        <el-table-column prop="username" label="登录账号" width="180" />
        <el-table-column prop="name" label="姓名" width="150" />
        <el-table-column prop="role" label="角色" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.role === '管理员' ? 'warning' : ''">
              {{ row.role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="账号状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '已禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">修改密码/编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除账号</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
        <el-form-item label="登录账号" prop="username">
          <el-input v-model="form.username" placeholder="请输入登录账号" :disabled="form.id !== null" />
        </el-form-item>
        <el-form-item label="用户姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="账号角色" prop="role">
          <el-radio-group v-model="form.role">
            <el-radio label="干事">干事</el-radio>
            <el-radio label="管理员">管理员</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="账号密码">
          <el-input v-model="form.password" type="password" placeholder="不填则保留原密码" show-password />
        </el-form-item>
        <el-form-item label="账号状态">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
            active-text="正常"
            inactive-text="禁用"
          />
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