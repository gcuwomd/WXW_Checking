<script setup>
import { ref, reactive } from 'vue'

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
        ElMessage.success('修改成功')
      } else {
        websiteList.value.push({ id: Date.now(), name: form.name, url: form.url, status: form.status })
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
    }
  })
}

// 删除网站
const handleDelete = (row) => {
  ElMessageBox.confirm(
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
    ElMessage.success('删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}
</script>

<template>
  <div>
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>网站库管理</span>
        </div>
      </template>
      <el-button type="primary" @click="handleAdd" style="margin-bottom: 20px;">新增网站</el-button>

      <el-table :data="websiteList" border style="width: 100%" stripe>
        <template #empty>
          <el-empty description="暂无网站库数据" />
        </template>
        <el-table-column type="index" label="序号" width="80" align="center" />
        <el-table-column prop="name" label="网站名称" width="250" />
        <el-table-column prop="url" label="网站链接" />
        <el-table-column label="检查状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用中' : '已停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="网站名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入网站名称" />
        </el-form-item>
        <el-form-item label="网站链接" prop="url">
          <el-input v-model="form.url" placeholder="请输入完整链接，如 https://..." />
        </el-form-item>
        <el-form-item label="启用检查">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="停用"
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