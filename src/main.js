
// import '../node_modules/foundation-sites/dist/js/foundation.min.js';
import '../node_modules/foundation-sites/dist/css/foundation.min.css';


import Vue from 'vue'
import App from './App.vue'
import router from './router'

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
