<script setup>
import { Finished, Pointer, Edit, Select } from '@element-plus/icons-vue'
</script>

<template>
  <div class="instructions-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>系统使用流程说明</span>
        </div>
      </template>

      <el-steps :active="4" direction="vertical" style="margin-top: 20px; height: 350px; padding-left: 30px;">
        <el-step title="获取任务" description="在【网站检查】页面获取由系统随机下发的待检查网站。" :icon="Pointer" />
        <el-step title="访问网站" description="点击“前往检查”按钮，在新标签页中打开目标网站进行浏览。" :icon="Select" />
        <el-step title="发现问题" description="仔细核对网站内容与功能，检查是否存在链接错误、内容不当、功能异常等问题。" :icon="Finished" />
        <el-step title="提交反馈" description="返回本系统，在对应的网站条目下填写检查反馈表单并提交。" :icon="Edit" />
      </el-steps>
    </el-card>
  </div>
</template>

<style scoped>
.instructions-container {
  padding: 20px;
  background-color: #fff;
}
</style>