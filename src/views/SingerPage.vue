<template>
  <div class="container">
    <div class="handle-box">
      <el-button type="primary" @click="deleteAll">批量删除</el-button>
      <el-input placeholder="筛选歌手" v-model="searchWord"></el-input>
      <el-button type="primary" @click="centerDialogVisible = true">添加歌手</el-button>
    </div>
    <el-table height="100%" border size="small" :data="tableData" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="40" align="center"></el-table-column>
      <el-table-column label="ID" prop="id" width="50" align="center"></el-table-column>
      <el-table-column label="歌手图片" prop="pic" width="110" align="center">
        <template v-slot="scope">
          <div class="singer-img">
           <img :src="attachImageUrl(scope.row.pic)" style="width: 100%" />
           <!-- <img :src="scope.row.pic" style="width: 100%" /> -->
          </div>
          <el-upload :action="uploadUrl(scope.row.id)" :show-file-list="false" :on-success="handleImgSuccess" :before-upload="beforeImgUpload">
            <el-button>更新图片</el-button>
          </el-upload>
        </template>
      </el-table-column>
      <el-table-column label="歌手" prop="name" width="120" align="center"></el-table-column>
      <el-table-column label="性别" prop="sex" width="60" align="center">
        <template v-slot="scope">
          <div>{{ changeSex(scope.row.gender) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="出生" prop="birth" width="120" align="center">
        <template v-slot="scope">
          <div>{{ getBirth(scope.row.birth) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="地区" prop="location" width="100" align="center"></el-table-column>
      <el-table-column label="简介" prop="introduction">
        <template v-slot="scope">
          <p style="height: 100px; overflow: scroll">
            {{ scope.row.introduction }}
          </p>
        </template>
      </el-table-column>
      <el-table-column label="歌曲管理" width="120" align="center">
        <template v-slot="scope">
          <el-button @click="goSongPage(scope.row)">歌曲管理</el-button>
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
      :total="total"
      @current-change="handleCurrentChange"
    >
    </el-pagination>
  </div>

  <!-- 添加 -->
  <el-dialog title="添加歌手" v-model="centerDialogVisible">
    <el-form label-width="80px" :model="registerForm" :rules="singerRule">
      <el-form-item label="歌手名" prop="name">
        <el-input v-model="registerForm.name"></el-input>
      </el-form-item>
      <el-form-item label="性别" prop="sex">
        <el-radio-group v-model="registerForm.sex">
          <el-radio :label="0">女</el-radio>
          <el-radio :label="1">男</el-radio>
          <el-radio :label="2">组合</el-radio>
          <el-radio :label="3">不明</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="故乡" prop="location">
        <el-input v-model="registerForm.location"></el-input>
      </el-form-item>
      <el-form-item label="出生日期" prop="birth">
        <el-date-picker type="date" v-model="registerForm.birth"></el-date-picker>
      </el-form-item>
      <el-form-item label="歌手介绍" prop="introduction">
        <el-input type="textarea" v-model="registerForm.introduction"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="centerDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addsinger">确 定</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 编辑弹出框 -->
  <el-dialog title="编辑" v-model="editVisible">
    <el-form label-width="60px" :model="editForm" :rules="singerRule">
      <el-form-item label="歌手" prop="name">
        <el-input v-model="editForm.name"></el-input>
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-radio-group v-model="editForm.sex">
          <el-radio :label="0">女</el-radio>
          <el-radio :label="1">男</el-radio>
          <el-radio :label="2">组合</el-radio>
          <el-radio :label="3">不明</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="出生" prop="birth">
        <el-date-picker type="date" v-model="editForm.birth"></el-date-picker>
      </el-form-item>
      <el-form-item label="地区" prop="location">
        <el-input v-model="editForm.location"></el-input>
      </el-form-item>
      <el-form-item label="简介" prop="introduction">
        <el-input type="textarea" v-model="editForm.introduction"></el-input>
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
import { watch, ref, reactive } from "vue";
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus';
import mixin from "@/mixins/mixin";
import YinDelDialog from "@/components/dialog/YinDelDialog.vue";
import { HttpManager } from "@/api/index";
import { RouterName } from "@/enums";
import { getBirth } from "@/utils";

const store = useStore();
const { changeSex, routerManager, beforeImgUpload } = mixin();

const tableData = ref([]); // 记录歌曲，用于显示
const tempDate = ref([]); // 记录歌曲，用于搜索时能临时记录一份歌曲列表
const pageSize = ref(5); // 页数
const currentPage = ref(1); // 当前页
const total = ref(0); // 总页数

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
// 获取歌手列表数据
getData();

async function getData() {
  tableData.value = [];
  tempDate.value = [];
  const result = (await HttpManager.getAllSinger(currentPage.value, pageSize.value)) as ResponseBody;
  tableData.value = result.data.records ;
  tempDate.value = result.data.records;
  total.value = result.data.total;
}
// 获取当前页
function handleCurrentChange(val) {
  currentPage.value = val;
  getData();
}
function uploadUrl(id) {
  return HttpManager.attachImageUrl(`singer/avatar/update?id=${id}`);
}

/**
 * 路由到歌手的歌曲页面
 */
function goSongPage(row) {
  const breadcrumbList = reactive([
    {
      path: RouterName.Singer,
      name: "歌手管理",
    },
    {
      path: "",
      name: "歌曲信息",
    },
  ]);
  store.commit("setBreadcrumbList", breadcrumbList);
  routerManager(RouterName.Song, {
    path: RouterName.Song,
    query: {
      id: row.id,
      name: row.name,
      type:"0"//0表示是歌手的歌曲
    },
  });
}

/**
 * 添加歌手相关数据
 */
const centerDialogVisible = ref(false);
// 添加歌手对话框绑定的数据
const registerForm = reactive({
  name: "",
  sex: "",
  birth: new Date(),
  location: "",
  introduction: "",
});
const singerRule = reactive({
  name: [{ required: true, trigger: "change" }],
  sex: [{ required: true, trigger: "change" }],
});

// 添加歌手
async function addsinger() {
  let datetime = getBirth(registerForm.birth);

  let name = registerForm.name;
  let sex = registerForm.sex;
  let birth = datetime;
  let location = registerForm.location;
  let introduction = registerForm.introduction;

  const result = (await HttpManager.setSinger({name,sex,birth,location,introduction})) as ResponseBody;
  ElMessage({
    message: result.message,
    type: result.type as any,
  });

  if (result.success) {
    getData();
    registerForm.birth = new Date();
    registerForm.name = "";
    registerForm.sex = "";
    registerForm.location = "";
    registerForm.introduction = "";
  }
  centerDialogVisible.value = false;
}
/**
 * 编辑对话框相关数据
 */
const editVisible = ref(false);
const editForm = reactive({
  id: "",
  name: "",
  sex: "",
  pic: "",
  birth: new Date(),
  location: "",
  introduction: "",
});

function editRow(row) {
  editVisible.value = true;
  editForm.id = row.id;
  editForm.name = row.name;
  editForm.sex = row.sex;
  editForm.pic = row.pic;
  editForm.birth = row.birth;
  editForm.location = row.location;
  editForm.introduction = row.introduction;
}
async function saveEdit() {
  // ElMessage.info("保存按钮被点击...");
  try {
    let datetime = getBirth(new Date(editForm.birth));

    let id = editForm.id;
    let name = editForm.name;
    let sex = editForm.sex;
    let birth = datetime;
    let location = editForm.location;
    let introduction = editForm.introduction;

    const result = (await HttpManager.updateSingerMsg({id,name,sex,birth,location,introduction})) as ResponseBody;
    ElMessage({
      message: result.message,
      type: result.type as any,
    });

    if (result.success) getData();
    editVisible.value = false;
  } catch (error) {
    console.error(error);
  }
}
function handleImgSuccess(response: any, file: any) {
  ElMessage({
    message: response.message,
    type: response.type as any,
  });
  if (response.success) getData();
}

/**
 * 删除
 */
const idx = ref(-1); // 记录当前要删除的行
const multipleSelection = ref([]); // 记录当前要删除的列表
const delVisible = ref(false); // 显示删除框

// 删除对话框确认按钮的点击事件绑定的函数
async function confirm() {
  const result = (await HttpManager.deleteSinger(idx.value)) as ResponseBody;
  ElMessage({
    message: result.message,
    type: result.type as any,
  });

  if (result.success) getData();
  delVisible.value = false;
}

/**
 * 批量删除选中歌手的函数
 * 该函数会将选中的歌手ID拼接成特定格式的字符串，然后调用 deleteMultiRow 函数进行批量删除
 */
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
}
/**
 * 执行批量删除歌手的函数
 * @param ids - 待删除歌手的ID拼接字符串，格式如 "id=1&id=2"
 */
async function deleteMultiRow(ids) {
  // 调用HttpManager的deleteSingers方法批量删除歌手，并等待响应
  const result = (await HttpManager.deleteSingers(ids)) as ResponseBody;
  // 显示删除操作的结果消息
  ElMessage.success(result.message);
  // 若有响应结果，重新获取用户数据以更新表格
  if (result) getData();
  // 关闭删除提示框
  delVisible.value = false;
}

function deleteRow(id) {
  idx.value = id;
  delVisible.value = true;
}
function handleSelectionChange(val) {
  multipleSelection.value = val;
}

// 导出给模板使用的变量和方法
const attachImageUrl = HttpManager.attachImageUrl;
</script>

<style scoped>
.singer-img {
  width: 100%;
  height: 80px;
  border-radius: 5px;
  margin-bottom: 5px;
  overflow: hidden;
}
</style>
