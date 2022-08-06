<template>
  <el-container class="home-container">
    <!-- 头部取余 -->
    <el-header>
      <div>
        <img src="@/assets/heima.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button @click="outLogin">退出登录</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 左侧导航栏 -->
      <el-aside :width="flag ? '55px' : '200px'">
        <div @click="flag = !flag" class="toggle-button">|||</div>
        <!-- 侧边栏菜单效果 -->
        <el-menu :default-active="activePath" router :collapse="flag" :collapse-transition="false" unique-opened
          background-color="#333744" text-color="#fff" active-text-color="#409fbb">
          <!-- 一级菜单 -->
          <el-submenu v-for="item in menuList" :key="item.id" :index="item.id + ''">
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item @click="saveNavState('/' + item.path)" v-for="item in item.children" :key="item.id"
              :index="'/' + item.path">
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{ item.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容区域 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>

export default {
  name: 'home',
  data() {
    return {
      menuList: [],
      // 图标对象
      iconObj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      // 左侧边栏是否折叠
      flag: false,
      activePath: ''
    }
  },
  methods: {
    // 退出登录
    outLogin() {
      window.sessionStorage.clear()
      this.$router.push({
        name: 'login'
      })
    },
    // 获取左侧栏的函数
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      // console.log(res);
      if (res.meta.status !== 200) return this.$message.error('获取左侧列表数据失败')
      this.menuList = res.data
    },
    // 保存链接的激活状态
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  },
  created() {
    this.getMenuList(),
      this.activePath = window.sessionStorage.getItem('activePath')
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}

.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #373d41;
  padding-left: 0;
  color: #fff;
  font-size: 20px;

  >div {
    display: flex;
    align-items: center;

    span {
      margin-left: 15px;
    }
  }
}

.el-aside {
  background-color: #333744;

  .el-menu {
    border-right: none;
  }
}

.el-main {
  background-color: #eaedf1;
}

.iconfont {
  margin-right: 10px;
}

.toggle-button {
  background-color: #4a5064;
  color: #fff;
  font-size: 10px;
  line-height: 24px;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>