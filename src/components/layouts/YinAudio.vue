<template>
  <audio controls preload="true" v-if="url" ref="divRef" :src="attachImageUrl(url)" @canplay="startPlay" @ended="ended"></audio>
</template>

<script setup lang="ts">
import { computed, watch, ref } from "vue";
import { useStore } from "vuex";
import { HttpManager } from "@/api";

const store = useStore();
const divRef = ref<HTMLAudioElement | null>(null);

const url = computed(() => store.getters.url); // 音乐链接
const isPlay = computed(() => store.getters.isPlay); // 播放状态
const attachImageUrl = (url: string) => {
  return HttpManager.attachImageUrl(url);
}

// 监听播放还是暂停
watch(isPlay, () => {
  togglePlay();
});

// 开始/暂停
function togglePlay() {
  if (divRef.value) {
    isPlay.value ? divRef.value.play() : divRef.value.pause();
  }
}

// 获取歌曲链接后准备播放
function startPlay() {
  if (divRef.value) {
    divRef.value.play();
  }
}

// 音乐播放结束时触发
function ended() {
  store.commit("setIsPlay", false);
}
</script>

<style>
audio {
  display: none;
}
</style>
