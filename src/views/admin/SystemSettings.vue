<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 信息提醒推送状态
const pushEnabled = ref(false)

const handlePushChange = (val) => {
    if (val) {
        ElMessage.success('已启用信息提醒推送')
    } else {
        ElMessage.warning('已停用信息提醒推送')
    }
}
</script>

<template>
    <div class="settings-container">
        <el-card shadow="never">
            <template #header>
                <div class="card-header">
                    <span>系统设置</span>
                </div>
            </template>

            <el-form label-width="120px">
                <el-form-item label="信息提醒推送">
                    <el-switch v-model="pushEnabled" active-text="启用" inactive-text="停用" @change="handlePushChange" />
                    <span style="margin-left: 15px; font-size: 13px; color: #909399;">
                        开启后，系统将在干事提交异常反馈时，向管理员发送实时消息提醒。
                    </span>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>