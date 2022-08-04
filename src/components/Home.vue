<template>
  <div>
    <el-button @click="outLogin">退出登录</el-button>
  </div>
</template>

<script>
export default {
  name:'home',
  methods:{
    // 退出登录
    outLogin(){
      window.sessionStorage.clear()
      this.$router.push({
        name:'login'
      })
    }
  }
}
</script>

<style lang="less" scoped>

</style>