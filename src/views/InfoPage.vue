<template>
  <!-- 信息总览 -->
  <el-row :gutter="20">
    <el-col :span="6">
      <el-card shadow="hover" :body-style="{ padding: '0px' }">
        <div class="card-content">
          <div class="card-left">
            <el-icon><user /></el-icon>
          </div>
          <div class="card-right">
            <div class="card-num">{{ userCount }}</div>
            <div>用户总数</div>
          </div>
        </div>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card shadow="hover" :body-style="{ padding: '0px' }">
        <div class="card-content">
          <div class="card-left">
            <el-icon><headset /></el-icon>
          </div>
          <div class="card-right">
            <div class="card-num">{{ songCount }}</div>
            <div>歌曲总数</div>
          </div>
        </div>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card shadow="hover" :body-style="{ padding: '0px' }">
        <div class="card-content">
          <div class="card-left">
            <el-icon><mic /></el-icon>
          </div>
          <div class="card-right">
            <div class="card-num">{{ singerCount }}</div>
            <div>歌手数量</div>
          </div>
        </div>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card shadow="hover" :body-style="{ padding: '0px' }">
        <div class="card-content">
          <div class="card-left">
            <el-icon><document /></el-icon>
          </div>
          <div class="card-right">
            <div class="card-num">{{ songListCount }}</div>
            <div>歌单数量</div>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
  <!-- 统计图表 -->
  <el-row :gutter="20">
    <el-col :span="12">
      <h3>用户性别比例</h3>
      <el-card class="cav-info" shadow="hover" :body-style="{ padding: '0px' }" id="userSex"></el-card>
    </el-col>
    <el-col :span="12">
      <h3>歌曲类型</h3>
      <el-card class="cav-info" shadow="hover" :body-style="{ padding: '0px' }" id="songStyle"></el-card>
    </el-col>
  </el-row>
  <el-row :gutter="20">
    <el-col :span="12">
      <h3>歌手性别比例</h3>
      <el-card class="cav-info" shadow="hover" :body-style="{ padding: '0px' }" id="singerSex"></el-card>
    </el-col>
    <el-col :span="12">
      <h3>歌手国籍</h3>
      <el-card class="cav-info" shadow="hover" :body-style="{ padding: '0px' }" id="country"></el-card>
    </el-col>
  </el-row>
</template>
<script lang="ts" setup>
import * as echarts from "echarts";
import {reactive, ref} from "vue";
import {HttpManager} from "@/api";
import { User, Headset, Mic, Document } from "@element-plus/icons-vue";
// ==绑定信息总览组件==
// =================================================================================统计用户总数
const userCount = ref(0);
// 发送 Http 请求获取所有用户数据填充图表
HttpManager.getAllUsers().then((res) => {
  // 将响应数据转换为 ResponseBody 类型
  const result = res as ResponseBody;
  // 更新用户数量
  userCount.value = result.data.length;
  //填充图表数据
  userSex.series[0].data.push(setSex(0, result.data));
  userSex.series[0].data.push(setSex(1, result.data));
  //获取渲染节点
  const userSexChart = echarts.init(document.getElementById("userSex"));
  //设置配置项数据,进行渲染
  userSexChart.setOption(userSex);
});
// 定义用户性别数据对象
const userSex = reactive({
  // 设置用户性别图表标题位置
  title: {
    left: 'center'
  },
  // 配置用户性别图表提示框
  tooltip: {
    trigger: 'item'
  },
  // 配置用户性别图例
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  // 配置用户性别饼图数据
  series: [
    {
      type: 'pie',
      radius: '50%',
      data: [],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    },
  ],
});
//统计用户性别数据
function setSex(sex, arr) {
  // 初始化用户性别值和名称
  let value = 0;
  const name = sex === 0 ? "男" : "女";
  // 遍历用户数组，统计用户性别数量
  for (let item of arr) {
    if (sex === item.gender) {
      value++;
    }
  }
  // 返回用户性别数据对象
  return { value, name };
}
// =================================================================================统计歌曲总数
const songCount = ref(0);
// 发送 Http 请求获取所有歌曲总数
HttpManager.getAllSongs().then((res) => {
  // 将响应数据转换为 ResponseBody 类型
  const result = res as ResponseBody;
  // 更新歌曲数量
  songCount.value = result.data.length;
});
// =================================================================================统计歌手总数
const singerCount = ref(0);
// 发送 Http 请求获取所有歌手总数
HttpManager.getAllSingers().then((res) => {
  const result = res as ResponseBody;

  // 更新歌手数量
  singerCount.value = result.data.length;

  // 填充歌手性别图表数据
  singerSex.series[0].data.push(setSingerSex(0, result.data));
  singerSex.series[0].data.push(setSingerSex(1, result.data));
  const singerSexChart = echarts.init(document.getElementById("singerSex"));
  singerSexChart.setOption(singerSex);

  // 填充歌手国籍图表数据
  for (let item of result.data) {
    const nationality = item.location; // 假设字段是 location
    let matched = false;

    for (let i = 0; i < singerNationality.xAxis.data.length; i++) {
      const nation = singerNationality.xAxis.data[i];
      if (nation !== "其他" && nationality.includes(nation)) {
        singerNationality.series[0].data[i]++;
        matched = true;
        break;
      }
    }

    if (!matched) {
      const otherIndex = singerNationality.xAxis.data.indexOf("其他");
      singerNationality.series[0].data[otherIndex]++;
    }
  }

  const nationalityChart = echarts.init(document.getElementById("country"));
  nationalityChart.setOption(singerNationality);
});
// 定义歌手性别数据对象
const singerSex = reactive({
  // 设置歌手性别比例图表标题位置
  title: {
    left: 'center'
  },
  // 配置歌手性别比例表提示框
  tooltip: {
    trigger: 'item'
  },
  // 配置歌手性别比例图例
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  // 配置歌手性别比例饼图数据
  series: [
    {
      type: 'pie',
      radius: '50%',
      data: [],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    },
  ],
});
//统计歌手性别数据
function setSingerSex(sex, arr) {
  // 初始化用户性别值和名称
  let value = 0;
  const name = sex === 0 ? "男" : "女";
  // 遍历用户数组，统计用户性别数量
  for (let item of arr) {
    if (sex === item.gender) {
      value++;
    }
  }
  // 返回用户性别数据对象
  return { value, name };
}
// 定义歌手国籍统计图表数据对象
const singerNationality = reactive({
  xAxis: {
    type: "category",
    data: [
      "中国",
      "韩国",
      "美国",
      "日本",
      "英国",
      "德国",
      "意大利",
      "西班牙",
      "加拿大",
      "马来西亚",
      "新加坡",
      "挪威",
      "瑞典",
      "其他",
    ],
  },
  yAxis: {
    type: "value",
  },
  series: [
    {
      data: new Array(14).fill(0), // 初始化 14 个分类数量为 0
      type: "bar",
      barWidth: "20%",
    },
  ],
});
// =================================================================================统计歌单总数
const songListCount = ref(0);
// 发送 Http 请求获取所有歌单总数
HttpManager.getAllSongList().then((res) => {
  // 将响应数据转换为 ResponseBody 类型
  const result = res as ResponseBody;
  // 更新歌单数量，此数据用于总数显示
  songListCount.value = result.data.length;
  // 遍历歌单数据
  for (let item of result.data) {
    // 遍历歌曲类型数据
    for (let i = 0; i < songStyle.xAxis.data.length; i++) {
      // 若歌单的风格包含当前歌曲类型
      if (item.style.includes(songStyle.xAxis.data[i])) {
        // 对应歌曲类型的数量加 1
        songStyle.series[0].data[i]++;
      }
    }
  }
  // 获取歌曲类型图表的渲染节点并初始化 ECharts 实例
  const songStyleChart = echarts.init(document.getElementById("songStyle"));
  // 设置配置项数据并进行渲染
  songStyleChart.setOption(songStyle);
});
// 定义歌曲类型数据对象，用于配置歌曲类型统计图表
const songStyle = reactive({
  // 配置 x 轴，类型为分类轴
  xAxis: {
    type: "category",
    // 定义 x 轴的分类数据，即不同的歌曲类型
    data: ["华语", "粤语", "欧美", "日韩", "BGM", "轻音乐", "乐器"],
  },
  // 配置 y 轴，类型为数值轴
  yAxis: {
    type: "value",
  },
  // 配置图表系列
  series: [
    {
      // 初始化各歌曲类型对应的数量为 0
      data: [0, 0, 0, 0, 0, 0, 0],
      // 图表类型为柱状图
      type: "bar",
      // 设置柱状图的宽度为 20%
      barWidth: "20%",
    },
  ],
});


</script>

<style scoped>
.card-content {
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 100px;
  padding-left: 20%;
  text-align: center;
}

.card-left {
  display: flex;
  font-size: 3rem;
}

.card-right {
  flex: 1;
  font-size: 14px;
}

.card-num {
  font-size: 30px;
  font-weight: bold;
}

h3 {
  margin: 10px 0;
  text-align: center;
}
.cav-info {
  border-radius: 6px;
  overflow: hidden;
  height: 250px;
  background-color: white;
}
</style>
