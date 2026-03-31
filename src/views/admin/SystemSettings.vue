<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// ==================== 模块一：消息与提醒设置 ====================

// 1. 管理员异常接收状态
const adminPushEnabled = ref(false)

const handleAdminPushChange = (val) => {
    if (val) {
        ElMessage.success('已启用管理员异常接收提醒')
    } else {
        ElMessage.warning('已停用管理员异常接收提醒')
    }
}

// 2. 干事未检催办提醒状态
const workerReminderEnabled = ref(false)
// 设定默认催办时间为晚上 21:00
const reminderTime = ref(new Date(2024, 1, 1, 21, 0, 0))

const handleWorkerReminderChange = (val) => {
    if (val) {
        ElMessage.success('已启用干事未检催办提醒')
    } else {
        ElMessage.warning('已停用干事未检催办提醒')
    }
}

// ==================== 模块二：系统维护与配置 ====================

// Nacos 跳转预留接口
const goToNacos = () => {
    // 目前留出位置，弹出提示
    ElMessage.info('Nacos 配置面板尚未部署，敬请期待')

    // 日后部署完成后，解开下方注释替换为真实的 Nacos 地址即可
    // window.open('http://localhost:8848/nacos', '_blank')
}
</script>

<template>
    <div class="settings-container">

        <el-card shadow="never" class="settings-card">
            <template #header>
                <div class="card-header">
                    <el-icon class="header-icon">
                        <Bell />
                    </el-icon>
                    <span>消息与提醒设置</span>
                </div>
            </template>

            <el-form label-width="150px" label-position="left">
                <el-form-item label="管理员异常接收">
                    <div class="setting-item-content">
                        <el-switch v-model="adminPushEnabled" active-text="启用" inactive-text="停用"
                            @change="handleAdminPushChange" />
                        <div class="setting-desc">
                            开启后，系统将在干事提交异常反馈时，向管理员发送实时消息提醒。
                        </div>
                    </div>
                </el-form-item>

                <el-divider border-style="dashed" />

                <el-form-item label="干事未检催办提醒">
                    <div class="setting-item-content">
                        <el-switch v-model="workerReminderEnabled" active-text="启用" inactive-text="停用"
                            @change="handleWorkerReminderChange" />
                        <div class="setting-desc">
                            开启后，系统将在规定的检查日内，向未完成检查任务的干事自动推送催办消息。
                        </div>
                    </div>
                </el-form-item>

                <el-form-item label="每日催办推送时间" v-if="workerReminderEnabled">
                    <div class="setting-item-content">
                        <el-time-picker v-model="reminderTime" format="HH:mm" placeholder="请选择催办推送时间" :clearable="false"
                            style="width: 200px;" />
                        <div class="setting-desc">
                            设定发送催办消息的具体时间（通常建议设置在晚间检查截止前）。
                        </div>
                    </div>
                </el-form-item>
            </el-form>
        </el-card>

        <el-card shadow="never" class="settings-card" style="margin-top: 20px;">
            <template #header>
                <div class="card-header">
                    <el-icon class="header-icon">
                        <Setting />
                    </el-icon>
                    <span>系统维护与底层配置</span>
                </div>
            </template>

            <div class="maintenance-item">
                <div class="item-info">
                    <div class="item-title">Nacos 配置中心 (微服务管理)</div>
                    <div class="setting-desc" style="margin-top: 5px;">
                        统一管理系统后端的微服务配置、路由发现与系统环境变量。仅限超级管理员操作。
                    </div>
                </div>
                <div class="item-action">
                    <el-button type="primary" plain @click="goToNacos" :icon="'Link'">
                        前往 Nacos 面板
                    </el-button>
                </div>
            </div>
        </el-card>

    </div>
</template>

<style scoped>
.settings-container {
    padding-bottom: 20px;
}

.settings-card {
    border-radius: 8px;
}

.card-header {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: bold;
    color: #303133;
}

.header-icon {
    margin-right: 8px;
    font-size: 18px;
    color: #409EFF;
}

/* 表单内部布局优化 */
.setting-item-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
}

.setting-desc {
    font-size: 13px;
    color: #909399;
    margin-top: 8px;
    line-height: 1.5;
}

/* 系统维护列表项样式 */
.maintenance-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
}

.item-title {
    font-size: 15px;
    font-weight: bold;
    color: #303133;
}
</style>