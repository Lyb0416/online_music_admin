import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import "./assets/css/main.css";
import "./assets/icons/iconfont.js";
import store from './store'
import { Store } from 'vuex'
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

declare module "@vue/runtime-core" {
    interface State {
        count: number;
    }

    interface ComponentCustomProperties {
        $store: Store<State>;
    }
}
const app = createApp(App)

app.use(store)

app.use(router)

app.use(ElementPlus)

app.mount('#app')
