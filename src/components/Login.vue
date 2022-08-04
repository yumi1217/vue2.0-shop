<template>
  <div class="login_container">
    <!-- login.vue子组件 -->
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="">
      </div>
      <!-- 登录表单区域 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="80px">
        <!-- 用户名 -->
        <el-form-item label="用户名" prop="username">
          <el-input v-model.trim="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" prefix-icon="iconfont icon-3702mima"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="resetLoginForm" type="info">重置</el-button>
          <el-button @click="login" type="primary">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      // 登录表单的数据对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 这是表单的验证规则对象
      loginFormRules: {
        // 验证用户名是否合法
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        // 验证密码是否合法
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 1, max: 6, message: '长度在 1 到 6 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 重置按钮函数，resetFields为组件内置方法
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields();
    },
    // 点击登录函数
    login() {

      // 对表单整个进行验证，通过了才能发起ajax请求
      this.$refs.loginFormRef.validate(async flag => {
        if (!flag) return
        const { data: res } = await this.$http.post('login', this.loginForm)
        // console.log(res);
        if (res.meta.status !== 200) return this.$message.error(`${res.meta.msg}`)
        this.$message.success('登录成功')
        // 1.将登录成功以后的token，保存到客户端的sessionStorage中
        //  1.1 项目中除了登录之外的其他API接口，必须在登录之后才能访问
        //  1.2 token只应在当前网站打开期间生效，所以token保存在sessionStorage中
        // 2.通过编程式导航跳转到后台页面，路由地址为/home
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push({
          name: 'home'
        })
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}

.login_box {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 450px;
  height: 300px;
  border-radius: 10px;
  background-color: #fff;

  // margin: 0 auto;
  .avatar_box {
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10% #ddd;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }

  .el-form {
    position: absolute;
    left: 15%;
    bottom: 20px;

    .el-button {
      margin: 5px;
    }
  }
}
</style>