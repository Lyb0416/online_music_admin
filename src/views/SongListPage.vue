<template>
  <div class="container">
    <div class="handle-box">
      <el-button @click="deleteAll">批量删除</el-button>
      <el-input v-model="searchWord" placeholder="筛选关键词"></el-input>
      <el-button type="primary" @click="centerDialogVisible = true">添加歌单</el-button>
    </div>
    <el-table height="100%" border size="small" :data="data" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="40" align="center"></el-table-column>
      <el-table-column label="ID" prop="id" width="50" align="center"></el-table-column>
      <el-table-column label="歌单图片" width="110" align="center">
        <template v-slot="scope">
          <img :src="attachImageUrl(scope.row.pic)" style="width: 80px"/>
         <!-- <img :src="scope.row.pic" style="width: 80px"/>-->
          <el-upload :action="uploadUrl(scope.row.id)" :show-file-list="false" :on-success="handleImgSuccess"
                     :before-upload="beforeImgUpload">
            <el-button>更新图片</el-button>
          </el-upload>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" width="200"></el-table-column>
      <el-table-column label="简介">
        <template v-slot="scope">
          <p style="height: 100px; overflow: scroll">
            {{ scope.row.introduction }}
          </p>
        </template>
      </el-table-column>
      <el-table-column label="风格" prop="style" width="100"></el-table-column>
      <el-table-column label="内容" width="90" align="center">
        <template v-slot="scope">
          <el-button @click="goContentPage(scope.row.id)">内容</el-button>
        </template>
      </el-table-column>
      <el-table-column label="评论" width="90" align="center">
        <template v-slot="scope">
          <el-button @click="goCommentPage(scope.row.id)">评论</el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" align="center">
        <template v-slot="scope">
          <el-button @click="editRow(scope.row)">编辑</el-button>
          <el-button type="danger" @click="deleteRow(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
        class="pagination"
        background
        layout="total, prev, pager, next"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="tableData.length"
        @current-change="handleCurrentChange"
    >
    </el-pagination>
  </div>

  <!--添加歌单-->
  <el-dialog title="添加歌单" v-model="centerDialogVisible">
    <el-form label-width="70px" :model="registerForm">
      <el-form-item label="歌单名" prop="title">
        <el-input v-model="registerForm.title"></el-input>
      </el-form-item>
      <el-form-item label="歌单介绍" prop="introduction">
        <el-input v-model="registerForm.introduction"></el-input>
      </el-form-item>
      <el-form-item label="风格" prop="style">
        <el-input v-model="registerForm.style"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="centerDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addsongList">确 定</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 编辑弹出框 -->
  <el-dialog title="编辑" v-model="editVisible">
    <el-form :model="editForm">
      <el-form-item label="标题">
        <el-input v-model="editForm.title"></el-input>
      </el-form-item>
      <el-form-item label="简介">
        <el-input type="textarea" v-model="editForm.introduction"></el-input>
      </el-form-item>
      <el-form-item label="风格">
        <el-input v-model="editForm.style"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveEdit">确 定</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 删除提示框 -->
  <yin-del-dialog :delVisible="delVisible" @confirm="confirm" @cancelRow="delVisible = $event"></yin-del-dialog>
</template>

<script setup lang="ts">
import {computed, reactive, ref, watch} from "vue";
import {useStore} from "vuex";
import {ElMessage} from "element-plus";
import mixin from "@/mixins/mixin";
import {HttpManager} from "@/api/index";
import {RouterName} from "@/enums";
import YinDelDialog from "@/components/dialog/YinDelDialog.vue";


const store = useStore();
const {routerManager, beforeImgUpload} = mixin();

const tableData = ref([]); // 记录歌曲，用于显示
const tempDate = ref([]); // 记录歌曲，用于搜索时能临时记录一份歌曲列表
const pageSize = ref(5); // 页数
const currentPage = ref(1); // 当前页

const attachImageUrl = (url: string) => {
  return HttpManager.attachImageUrl(url);
}

// 计算当前表格中的数据
const data = computed(() => {
  return tableData.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value);
});

const searchWord = ref(""); // 记录输入框输入的内容
watch(searchWord, () => {
  if (searchWord.value === "") {
    tableData.value = tempDate.value;
  } else {
    tableData.value = [];
    for (let item of tempDate.value) {
      if (item.title.includes(searchWord.value)) {
        tableData.value.push(item);
      }
    }
  }
});

getData();

// 获取歌单信息
async function getData() {
  tableData.value = [];
  tempDate.value = [];
  const result = (await HttpManager.getSongList(searchWord.value)) as ResponseBody;
  tableData.value = result.data;
  tempDate.value = result.data;
  currentPage.value = 1;
  //console.log(result.data)
  // 存储图片链接
  for (const singer of result.data) {
    const id = singer.id;
    const pic = singer.pic;
    picUrls.set(id, pic)
  }
}

// 获取当前页
function handleCurrentChange(val) {
  currentPage.value = val;
}

function uploadUrl(id) {
  return HttpManager.attachImageUrl(`/songList/img/update?id=${id}`);
}

// 更新图片
function handleImgSuccess(response, file) {
  ElMessage({
    message: response.message,
    type: response.type,
  });
  if (response.success) getData();
}

/**
 * 路由
 */
function goContentPage(id) {
  const breadcrumbList = reactive([
    {
      path: RouterName.SongList,
      name: "歌单管理",
    },
    {
      path: "",
      name: "歌单内容",
    },
  ]);
  store.commit("setBreadcrumbList", breadcrumbList);
  routerManager(RouterName.Song, {
    path: RouterName.Song,
    query: {id,type:"1"}
  });
}

function goCommentPage(id) {
  const breadcrumbList = reactive([
    {
      path: RouterName.SongList,
      name: "歌单管理",
    },
    {
      path: "",
      name: "评论详情",
    },
  ]);
  store.commit("setBreadcrumbList", breadcrumbList);
  routerManager(RouterName.Comment, {path: RouterName.Comment, query: {id, type: 1}});
}

/**
 * 添加歌单
 */
const centerDialogVisible = ref(false);
const registerForm = reactive({
  title: "",
  introduction: "",
  style: "",
});

async function addsongList() {
  let title = registerForm.title;
  let introduction = registerForm.introduction;
  let style = registerForm.style;
  const result = (await HttpManager.setSongList({title, introduction, style})) as ResponseBody;
  ElMessage({
    message: result.message,
    type: result.type as any,
  });

  if (result.success) {
    getData();
    registerForm.title = "";
    registerForm.introduction = "";
    registerForm.style = "";
  }
  centerDialogVisible.value = false;
}

/**
 * 编辑
 */
const editVisible = ref(false);
const editForm = reactive({
  id: "",
  title: "",
  pic: "",
  introduction: "",
  style: "",
});

function editRow(row) {
  idx.value = row.id;
  editForm.id = row.id;
  editForm.title = row.title;
  editForm.pic = row.pic;
  editForm.introduction = row.introduction;
  editForm.style = row.style;
  editVisible.value = true;
}

async function saveEdit() {

  let id = editForm.id;
  let title = editForm.title;
  let introduction = editForm.introduction;
  let style = editForm.style;

  const result =  (await HttpManager.updateSongListMsg({id, title, introduction, style})) as ResponseBody;
  ElMessage({
    message: result.message,
    type: result.type as any,
  });

  if (result.success) getData();
  editVisible.value = false;
}

/**
 * 删除
 */
const idx = ref(-1); // 记录当前要删除的行
const multipleSelection = ref([]); // 记录当前要删除的列表
const delVisible = ref(false); // 显示删除框

async function confirm() {
  const result = await HttpManager.deleteSongList(idx.value) as ResponseBody;
  ElMessage({
    message: result.message,
    type: result.type as any,
  });
  if (result.success) getData();
  delVisible.value = false;
}

function deleteRow(id) {
  idx.value = id;
  delVisible.value = true;
}

function handleSelectionChange(val) {
  multipleSelection.value = val;
}

function deleteAll() {
  // 初始化用于存储拼接ID的字符串
  var ids = '';
  // 遍历选中的用户列表，将每个歌手的ID拼接成 "id=歌手ID&" 的格式
  for (let item of multipleSelection.value) {
    ids += 'id=' + item.id + "&";
  }
  // 去除拼接字符串末尾多余的 "&" 符号
  ids = ids.substring(0, ids.length - 1);
  // 调用批量删除函数执行删除操作
  deleteMultiRow(ids);
  multipleSelection.value = [];
  console.log(ids)
}

async function deleteMultiRow(ids) {
  // 调用HttpManager的deleteSingers方法批量删除歌手，并等待响应
  const result = (await HttpManager.deleteSongLists(ids)) as ResponseBody;
  // 显示删除操作的结果消息
  ElMessage.success(result.message);
  // 若有响应结果，重新获取用户数据以更新表格
  if (result) getData();
  // 关闭删除提示框
  delVisible.value = false;
}

</script>

<style scoped></style>
