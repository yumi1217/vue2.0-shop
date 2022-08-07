import Vue from 'vue'
import VueRouter from 'vue-router'
// 导入需要展示的组件
import Login from '@/components/Login.vue'
import Home from '@/components/Home.vue'
import Welcome from '@/components/Welcome.vue'
import Users from '@/components/user/User.vue'
import Rights from '@/components/power/Rights.vue'
import Roles from '@/components/power/Roles.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/', redirect: '/login'
  },
  {
    path: '/login', name: 'login', component: Login
  },
  {
    path: '/home', name: 'home', component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome', name: 'welcome', component: Welcome
      },
      {
        path: '/users', name: 'users', component: Users
      },
      {
        path: '/rights', name: 'rights', component: Rights
      },
      {
        path: '/roles', name: 'roles', component: Roles
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 路由导航守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const token = window.sessionStorage.getItem('token')
  if (!token) return next({
    name: 'login'
  })
  next()
})

export default router
