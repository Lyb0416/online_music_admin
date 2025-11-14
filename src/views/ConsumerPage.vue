<template>
  <div class="container">
    <!-- 批量删除操作按钮 -->
    <div class="handle-box">
      <el-button @click="deleteAll">批量删除</el-button>
      <el-input v-model="searchWord" placeholder="筛选用户"></el-input>
    </div>
    <!-- 表格 用户数据列表显示区域 -->
    <el-table height="100%" border size="small" :data="tableData" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="40" align="center"></el-table-column>
      <el-table-column label="ID" prop="id" width="50" align="center"></el-table-column>
      <el-table-column label="用户头像" width="102" align="center">
        <template v-slot="scope">
         <img :src="attachImageUrl(scope.row.avator)" style="width: 80px" />
          <!-- 直接加载OSS中的图片路径即可        
          <img :src="scope.row.avator" style="width: 80px" /> -->
        </template>
      </el-table-column>
      <el-table-column label="用户名" prop="username" width="80" align="center"></el-table-column>
      <el-table-column label="性别" width="50" align="center">
        <template v-slot="scope">
          <div>{{ changeSex(scope.row.gender) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="手机号码" prop="phoneNum" width="120" align="center"></el-table-column>
      <el-table-column label="邮箱" prop="email" width="120" align="center"></el-table-column>
      <el-table-column label="生日" width="120" align="center">
        <template v-slot="scope">
          <div>{{ getBirth(scope.row.birth) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="签名" prop="introduction"></el-table-column>
      <el-table-column label="地区" prop="location" width="70" align="center"></el-table-column>
      <el-table-column label="收藏" width="90" align="center">
        <template v-slot="scope">
          <el-button @click="goCollectPage(scope.row.id)">收藏</el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="90" align="center">
        <template v-slot="scope">
          <el-button type="danger" @click="deleteRow(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <el-pagination
      class="pagination"
      background
      layout="total, prev, pager, next"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="totalPage"
      @current-change="handleCurrentChange"
    >
    </el-pagination>
  </div>

  <!-- 删除提示框 -->
  <yin-del-dialog :delVisible="delVisible" @confirm="confirm" @cancelRow="delVisible = $event"></yin-del-dialog>
</template>

<script setup lang="ts">
import { watch, ref, reactive } from "vue";
import { useStore } from "vuex";
import mixin from "@/mixins/mixin";
import { HttpManager } from "@/api";
import { RouterName } from "@/enums";
import YinDelDialog from "@/components/dialog/YinDelDialog.vue";
import { getBirth } from "@/utils";
import { ElMessage } from 'element-plus';

const store = useStore();
// 引入工具函数
const { changeSex, routerManager } = mixin();

// 添加attachImageUrl函数
const attachImageUrl = (url: string) => {
  return HttpManager.attachImageUrl(url);
}

const tableData = ref([]); // 记录歌曲，用于显示
const tempDate = ref([]); // 记录歌曲，用于搜索时能临时记录一份歌曲列表
const pageSize = ref(5); // 页数
const currentPage = ref(1); // 当前页
const totalPage = ref(1); // 总页数 新增参数


const searchWord = ref(""); // 记录输入框输入的内容
watch(searchWord, () => {
  if (searchWord.value === "") {
    tableData.value = tempDate.value;
  } else {
    tableData.value = [];
    for (let item of tempDate.value) {
      if (item.username.includes(searchWord.value)) {
        tableData.value.push(item);
      }
    }
  }
});

getData();

// 获取用户信息
async function getData() {
  tableData.value = [];
  tempDate.value = [];
  // 访问后端获取用户信息
  const result = (await HttpManager.getAllUser(currentPage.value,pageSize.value)) as ResponseBody;
  console.log(result);
  tableData.value = result.data.records;
  tempDate.value = result.data.records;
  totalPage.value = result.data.total;
}

// 获取当前页
function handleCurrentChange(val: number) {
  currentPage.value = val;
  getData();
}

/**
 * 跳转收藏信息路由
 */
function goCollectPage(id: number) {
  const breadcrumbList = reactive([
    {
      path: RouterName.Consumer,
      name: "用户管理",
    },
    {
      path: "",
      name: "收藏信息",
    },
  ]);
  store.commit("setBreadcrumbList", breadcrumbList);
  routerManager(RouterName.Collect, { path: RouterName.Collect, query: { id } });
}

/**
 * 删除
 */
const idx = ref(-1); // 记录当前要删除的行
const multipleSelection = ref([]); // 记录当前要删除的列表
const delVisible = ref(false); // 显示删除框
// 删除结果确认
async function confirm() {
  const result = (await HttpManager.deleteUser(idx.value)) as ResponseBody;
  ElMessage.success(result.message);
  if (result && result.success) getData();
  delVisible.value = false;
}
// 删除指定行
function deleteRow(id: number) {
  idx.value = id;
  delVisible.value = true;
}

function handleSelectionChange(val: any[]) {
  multipleSelection.value = val;
}
/**
 * 批量删除选中用户的函数
 * 该函数会将选中的用户ID拼接成特定格式的字符串，然后调用 deleteMultiRow 函数进行批量删除
 */
function deleteAll() {
  var ids = '';
  for (let item of multipleSelection.value) {
    ids+='id='+item.id+"&";
  }
  ids = ids.substring(0,ids.length-1);
  deleteMultiRow(ids);
}

/**
 * 批量删除用户的函数
 * @param ids - 待删除用户的ID拼接字符串，格式如 "id=1&id=2"
 */
async function deleteMultiRow(ids: string) {
  const result = (await HttpManager.deleteUsers(ids)) as ResponseBody;
  ElMessage({
    message: result.message,
    type: result.type,
  });
  if (result) getData();
  delVisible.value = false;
}
</script>
<style scoped>
</style>
