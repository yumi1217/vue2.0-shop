import Vue from 'vue'
import App from './App.vue'
import '@/assets/css/global.css'
import '@/assets/fonts/iconfont.css'
import router from './router'
import store from './store'
import './plugins/element.js'

import axios from 'axios'
Vue.prototype.$http = axios
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// axios拦截器
axios.interceptors.request.use(config => {
  // 在最后必须return config
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // console.log(config);
  return config
})
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
