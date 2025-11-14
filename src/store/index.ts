import { createStore } from "vuex";

export default createStore({
    // 定义vuex保存的值
    state:{
        userPic: "img/avatorImages/user.jpg",
        isPlay: false,
        url: "",
        id: "",
        breadcrumbList: []
    },
    getters:{
        userPic: (state) => state.userPic,
        isPlay: (state) => state.isPlay,
        url: (state) => state.url,
        id: (state) => state.id,
        breadcrumbList: (state) => state.breadcrumbList,
    },
    // 修改vuex存的值，同步
    mutations:{
        setUserPic: (state, userPic) => state.userPic = userPic,
        setIsPlay: (state, isPlay) => state.isPlay = isPlay,
        setUrl: (state, url) => state.url = url,
        setId: (state, id) => state.id = id,
        setBreadcrumbList: (state, breadcrumbList) => state.breadcrumbList = breadcrumbList,
    },
    // 修改vuex存的值，异步
    actions:{},
    modules:{}
})