<script setup>
import { ref } from 'vue'
import request from '@/utils/request.js'
import { ElMessage } from 'element-plus'

// 初始化开关状态 (0: 关闭, 1: 开启)
// 注意：后端文档中未提供获取当前系统设置状态的 GET 接口，此处默认初始值为 0。
const userReminderStatus = ref(0)
const adminReminderStatus = ref(0)
const autoCheckEnable = ref(0)

// 切换状态时的加载动画控制
const loading1 = ref(false)
const loading2 = ref(false)
const loading3 = ref(false)

// 1. 切换用户提醒检查推送
const handleUserReminderChange = async (val) => {
    loading1.value = true
    try {
        // 接口要求通过 query 传参: status
        await request.post('/POST/user/reminder/status', null, { params: { status: val } })
        ElMessage.success(`用户提醒检查推送已${val === 1 ? '开启' : '关闭'}`)
    } catch (error) {
        // 失败则回退状态
        userReminderStatus.value = val === 1 ? 0 : 1
        console.error('设置用户提醒失败:', error)
    } finally {
        loading1.value = false
    }
}

// 2. 切换管理员网站异常推送
const handleAdminReminderChange = async (val) => {
    loading2.value = true
    try {
        // 接口要求通过 query 传参: status
        await request.post('/POST/admin/reminder/status', null, { params: { status: val } })
        ElMessage.success(`管理员网站异常推送已${val === 1 ? '开启' : '关闭'}`)
    } catch (error) {
        adminReminderStatus.value = val === 1 ? 0 : 1
        console.error('设置管理员提醒失败:', error)
    } finally {
        loading2.value = false
    }
}

// 3. 切换自动检查
const handleAutoCheckChange = async (val) => {
    loading3.value = true
    try {
        // 接口要求通过 query 传参: enable
        await request.post('/POST/auto/check/enable', null, { params: { enable: val } })
        ElMessage.success(`系统自动检查已${val === 1 ? '开启' : '关闭'}`)
    } catch (error) {
        autoCheckEnable.value = val === 1 ? 0 : 1
        console.error('设置自动检查失败:', error)
    } finally {
        loading3.value = false
    }
}
</script>

<template>
    <div class="settings-container">
        <div class="page-header">
            <h2>系统全局设置</h2>
            <p class="subtitle">管理网站检查系统的自动化任务与消息推送开关</p>
        </div>

        <el-row :gutter="24">
            <el-col :xs="24" :sm="12" :md="8">
                <el-card shadow="hover" class="setting-card">
                    <template #header>
                        <div class="card-header">
                            <div class="header-title">
                                <el-icon class="icon-blue">
                                    <Message />
                                </el-icon>
                                <span>用户提醒检查推送</span>
                            </div>
                            <el-switch v-model="userReminderStatus" :active-value="1" :inactive-value="0"
                                :loading="loading1" @change="handleUserReminderChange" />
                        </div>
                    </template>
                    <div class="card-body">
                        <p><strong>功能说明：</strong></p>
                        <p>每周一、周三、周五定时为忘记检查网站的干事用户推送提醒工单或消息，督促其完成检查任务。</p>
                    </div>
                </el-card>
            </el-col>

            <el-col :xs="24" :sm="12" :md="8">
                <el-card shadow="hover" class="setting-card">
                    <template #header>
                        <div class="card-header">
                            <div class="header-title">
                                <el-icon class="icon-danger">
                                    <Warning />
                                </el-icon>
                                <span>管理员网站异常推送</span>
                            </div>
                            <el-switch v-model="adminReminderStatus" :active-value="1" :inactive-value="0"
                                :loading="loading2" @change="handleAdminReminderChange" />
                        </div>
                    </template>
                    <div class="card-body">
                        <p><strong>功能说明：</strong></p>
                        <p>每日将当天网站检查出现的异常状况（如404、500等错误）汇总推送给管理员，方便及时跟进处理。</p>
                    </div>
                </el-card>
            </el-col>

            <el-col :xs="24" :sm="12" :md="8">
                <el-card shadow="hover" class="setting-card">
                    <template #header>
                        <div class="card-header">
                            <div class="header-title">
                                <el-icon class="icon-success">
                                    <Monitor />
                                </el-icon>
                                <span>系统自动检查</span>
                            </div>
                            <el-switch v-model="autoCheckEnable" :active-value="1" :inactive-value="0"
                                :loading="loading3" @change="handleAutoCheckChange" />
                        </div>
                    </template>
                    <div class="card-body">
                        <p><strong>功能说明：</strong></p>
                        <p>开启后，系统后台将按照设定周期自动爬取或请求收录的学院官网，并自动更新网站状态库。</p>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<style scoped>
.settings-container {
    padding: 24px;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
    min-height: calc(100vh - 120px);
}

.page-header {
    margin-bottom: 30px;
    border-bottom: 1px solid #ebeef5;
    padding-bottom: 15px;
}

.page-header h2 {
    margin: 0 0 10px 0;
    font-size: 22px;
    color: #303133;
}

.subtitle {
    margin: 0;
    color: #909399;
    font-size: 14px;
}

.setting-card {
    border-radius: 10px;
    margin-bottom: 20px;
    transition: all 0.3s;
}

.setting-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-title {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
}

.header-title .el-icon {
    margin-right: 8px;
    font-size: 20px;
}

.icon-blue {
    color: #409eff;
}

.icon-danger {
    color: #f56c6c;
}

.icon-success {
    color: #67c23a;
}

.card-body {
    font-size: 14px;
    color: #606266;
    line-height: 1.6;
}

.card-body p {
    margin: 5px 0;
}
</style>