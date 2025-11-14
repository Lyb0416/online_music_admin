<template>
  <el-breadcrumb class="crumbs" separator="/">
    <el-breadcrumb-item v-for="item in breadcrumbList" :key="item.name" :to="{ path: item.path, query: item.query }">
      {{ item.name }}
    </el-breadcrumb-item>
  </el-breadcrumb>

  <div class="container">
    <div class="handle-box">
      <el-button @click="deleteAll">批量删除</el-button>
      <el-input placeholder="筛选歌曲" v-model="searchWord"></el-input>
    </div>
    <el-table height="550px" border size="small" :data="tableData" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="40" align="center"></el-table-column>
      <el-table-column prop="name" label="歌手-歌曲"></el-table-column>
      <el-table-column label="操作" width="90" align="center">
        <template v-slot="scope">
          <el-button type="danger" @click="deleteRow(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <!-- 删除提示框 -->
  <yin-del-dialog :delVisible="delVisible" @confirm="confirm" @cancelRow="delVisible = $event"></yin-del-dialog>
</template>

<script setup lang="ts">
import { watch, ref, computed } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { HttpManager } from "@/api";
import YinDelDialog from "@/components/dialog/YinDelDialog.vue";
import { ElMessage } from 'element-plus';

const store = useStore();
const route = useRoute();

const tableData = ref([]); // 记录歌曲，用于显示
const tempDate = ref([]); // 记录歌曲，用于搜索时能临时记录一份歌曲列表
// 从本地存储获取当前页面的导航条
const breadcrumbList = computed(() => store.getters.breadcrumbList);

const searchWord = ref(""); // 记录输入框输入的内容
watch(searchWord, () => {
  if (searchWord.value === "") {
    tableData.value = tempDate.value;
  } else {
    tableData.value = [];
    for (let item of tempDate.value) {
      if (item.name.includes(searchWord.value)) {
        tableData.value.push(item);
      }
    }
  }
});

getData();

// 通过用户 ID 获取用户收藏的歌曲 ID
async function getData() {
  tableData.value = [];
  tempDate.value = [];
//   const result = (await HttpManager.getCollectionOfUser(route.query.id)) as any;
//   for (let item of result.data) {
//     const result = await HttpManager.getSongOfId(item.songId) as any;
//     tableData.value.push(result.data[0]);
//     tempDate.value.push(result.data[0]);
//   }
}

/**
 * 删除
 */
const idx = ref(-1); // 记录当前要删除的行
const multipleSelection = ref([]); // 记录当前要删除的列表
const delVisible = ref(false); // 显示删除框

async function confirm() {
  const result = (await HttpManager.deleteCollection(route.query.id as string, idx.value)) as ResponseBody;
  ElMessage.success(result.message);

  if (result.success) getData();
  delVisible.value = false;
}

function deleteRow(id: number) {
  idx.value = id;
  delVisible.value = true;
}

function handleSelectionChange(val: any[]) {
  multipleSelection.value = val;
}

function deleteAll() {
  for (let item of multipleSelection.value) {
    deleteRow(item.id);
    confirm();
  }
  multipleSelection.value = [];
}
</script>

<style scoped></style>
