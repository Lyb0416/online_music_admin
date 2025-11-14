import { deletes, get, getBaseURL, post } from './request'
const HttpManager = {
    // 获取图片信息
    attachImageUrl: (url) => {
        if (!url) return '';

        // 如果是完整的 OSS URL，直接返回
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }

        // 否则是相对路径，拼接后端基础路径
        return `${getBaseURL()}/${url}`;
    },

    // =======================> 管理员 API 完成
    // 是否登录成功
    getLoginStatus: ({ username, password }) => post(`admin/login/status`, { username, password }),

    // =======================> 用户 API 完成
    // 返回所有用户
    // getAllUser: () => get(`user`),
    getAllUser: (currentPage,pageSize) => get(`users?currentPage=${currentPage}&pageSize=${pageSize}`),
    // 返回指定ID的用户
    getUserOfId: (id) => get(`user/detail?id=${id}`),
    // 删除用户
    deleteUser: (id) => get(`user/delete?id=${id}`),
    //删除多个用户
    deleteUsers:(ids)=> deletes(`user/deleteIds?${ids}`),

    // =======================> 收藏列表 API 完成
    // 返回的指定用户ID收藏列表
    getCollectionOfUser: (userId) => get(`collection/detail?userId=${userId}`),
    // 删除收藏的歌曲
    deleteCollection: (userId, songId) => deletes(`collection/delete?userId=${userId}&&songId=${songId}`),

    // =======================> 评论列表 API 完成
    // 获得指定歌曲ID的评论列表
    getCommentOfSongId: (songId) => get(`comment/song/${songId}`),
    // 获得指定歌单ID的评论列表
    getCommentOfSongListId: (songListId) => get(`comment/songList/${songListId}`),
    // 删除评论
    deleteComment: (id) => get(`comment/delete?id=${id}`),
    getAllSinger: (curPage, pageSize) => get(`singer?curPage=`+curPage+'&pageSize='+pageSize),
    // 添加歌手
    setSinger: ({ name, sex, birth, location, introduction }) => post(`singer/add`, {
        name,
        sex,
        birth,
        location,
        introduction
    }),
    // 删除歌手
    deleteSinger: (id) => deletes(`singer/delete?id=${id}`),
    //删除多个歌手
    deleteSingers: (ids) => deletes(`singer/deleteIds?${ids}`),

    getSongOfSingerId: (singerId) => get(`song/singer/detail?singerId=${singerId}`),//获取歌手的歌曲

    getSongOfSongListId: (songListId) => get(`song/songList/${songListId}`),//获取歌单的歌曲

    addSong: (formData) => post("song/add", formData),

    // 更新歌手信息
    updateSingerMsg: ({ id, name, sex, birth, location, introduction }) =>
        post(`singer/update`, {
        id,
        name,
        sex,
        birth,
        location,
        introduction
    }),

    // =======================> 歌单API ====================
    // 获取全部歌单
    getSongList: (style) => get(`songList?style=${style}`),
    // 添加歌单
    setSongList: ({title, introduction, style}) =>
        post(`songList/add`, {title, introduction, style}),
    // 更新歌单信息
    updateSongListMsg: ({id, title, introduction, style}) =>
        post(`songList/update`, {id, title, introduction, style}),
    // 删除歌单
    deleteSongList: (id) => deletes(`songList/delete?id=${id}`),
    // 批量删除歌单
    deleteSongLists: (ids) => deletes(`songList/deleteIds?id=${ids}`),
    // =======================> Info-API ====================
    getAllUsers:() => get('/users'),

    getAllSongs:() => get('/song'),

    getAllSingers:() => get('/singer'),

    getAllSongList:() => get('/songList'),
}

export { HttpManager }