<template>
  <div>
    <!-- 删除提示框 -->
    <el-dialog title="提示" v-model="centerDialogVisible" width="300px" center>
      <div class="del-dialog-cnt" align="center">删除不可恢复，是否确定删除？</div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelRow">取 消</el-button>
          <el-button type="primary" @click="confirm">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  delVisible: boolean;
}>();

const emit = defineEmits<{
  (e: 'cancelRow', value: boolean): void;
  (e: 'confirm', value: null): void;
}>();

const centerDialogVisible = ref(props.delVisible);

watch(() => props.delVisible, (value) => {
  centerDialogVisible.value = value;
});

function cancelRow() {
  emit("cancelRow", false);
}

function confirm() {
  emit("confirm", null);
}
</script>
