<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input @clear="getUserList" v-model="queryInfo.query" placeholder="请输入内容" clearable>
            <el-button @click="getUserList" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button @click="dialogVisible = true" type="primary">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 新增用户弹窗 -->
      <el-dialog @close="addDialogClosed" title="添加用户" :visible.sync="dialogVisible" width="50%">
        <!-- 内容主体区域 -->
        <el-form status-icon :model="addForm" :rules="rules" ref="addFormRef" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </el-dialog>
      <!-- 修改用户弹窗 -->
      <el-dialog @close="editDialogClosed" title="修改用户" :visible.sync="editDialogVisible" width="50%">
        <el-form :model="editForm" ref="editFormRef" :rules="editFormRules" label-width="70px">
          <el-form-item label="用户名">
            <el-input disabled v-model="editForm.username"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <!-- 作用域插槽，动态渲染boolean值 -->
          <template slot-scope="scope">
            <el-switch @change="userStateChanged(scope.row)" v-model="scope.row.mg_state">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template slot-scope="scope">
            <el-tooltip :enterable="false" effect="dark" content="分配角色" placement="top">
              <el-button @click="setRole(scope.row)" size="mini" type="info" icon="el-icon-share"></el-button>
            </el-tooltip>
            <el-button @click="showEditDialog(scope.row)" size="mini" type="warning" icon="el-icon-edit"></el-button>
            <el-button @click="removueUserById(scope.row.id)" size="mini" type="danger" icon="el-icon-delete">
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[10, 20, 50]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
    <!-- 这是分配角色的弹窗 -->
    <el-dialog @close="setRoleDialogClosed" title="分配角色" :visible.sync="setRoleDialogVisivle" width="50%">
      <div>
        <p>当前的用户：{{ userInfo.username }}</p>
        <p>当前的角色：{{ userInfo.role_name }}</p>
        <p>分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisivle = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'users',
  data() {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    // 验证手机号的规则
    var checkMobile = (rules, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^1([38]\d|5[0-35-9]|7[3678])\d{8}$/
      if (regMobile.test(value)) {
        // 合法的邮箱
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }
    return {
      // 获取用户列表参数的对象
      queryInfo: {
        // 查询参数，可以为空
        query: '',
        // 当前页码，不能为空
        pagenum: 1,
        // 每页显示条数，不能为空
        pagesize: 10
      },
      // 获取到的列表数据
      userList: [],
      // 总数据条数
      total: 0,
      // 控制添加用户弹窗状态
      dialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        // 用户名
        username: '',
        // 密码：
        password: '',
        // 邮箱
        email: '',
        // 手机
        mobile: ''
      },
      // 表单验证规则
      rules: {
        username: [
          { required: true, message: '请输入用户名', trgger: 'blur' },
          { min: 3, max: 10, message: '用户名的长度在3到10个字符之间', trgger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trgger: 'blur' },
          { min: 6, max: 15, message: '密码的长度在6到15个字符之间', trgger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trgger: 'blur' },
          { validator: checkEmail, trgger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trgger: 'blur' },
          { validator: checkMobile, trgger: 'blur' }
        ]
      },
      // 控制修改弹窗
      editDialogVisible: false,
      // 保存用户信息
      editForm: {
        // 用户名
        username: '',
        // 邮箱
        email: '',
        // 手机号
        mobile: ''
      },
      // 修改用户表单的id
      editFormId: '',
      // 修改用户表单验证规则
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trgger: 'blur' },
          { validator: checkEmail, trgger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trgger: 'blur' },
          { validator: checkMobile, trgger: 'blur' }
        ]
      },
      // 控制分配角色弹窗的显示与隐藏
      setRoleDialogVisivle: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有角色的数据列表
      roleList: [],
      // 实际选中的角色Id
      selectedRoleId: ''
    }
  },
  methods: {
    // 获取用户数据列表函数
    async getUserList() {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      // console.log(res);
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 监听pagesize 改变的事件
    handleSizeChange(newSize) {
      // console.log(newSize);
      this.queryInfo.pagesize = newSize
      this.getUserList();
    },
    // 监听页码值改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList();
    },
    // 监听switch开关状态的改变
    async userStateChanged(userInfo) {
      // console.log(userInfo);
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      // console.log(res);
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
    },
    // 用户关闭新增对话框后触发的监听函数
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加用户的监听函数
    addUser() {
      // 判断表单验证是否通过
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写正确信息')
        // 通过以后发起ajax请求
        const { data: res } = await this.$http.post('users', this.addForm)
        // console.log(res);
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success('添加用户成功')
        // 隐藏弹窗
        this.dialogVisible = false
        // 刷新列表
        this.getUserList()
      })
    },
    // 修改用户函数
    showEditDialog(userData) {
      // 改变修改用户弹窗的状态
      this.editDialogVisible = true
      console.log(userData);
      this.editForm.username = userData.username
      this.editForm.email = userData.email
      this.editForm.mobile = userData.mobile
      this.editFormId = userData.id
    },
    // 关闭修改弹窗后，重置表单
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    // 用户修改完信息后，点击确认的函数
    editUserInfo() {
      const id = this.editFormId
      // console.log(id);
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写正确信息')
        // 发起修改的ajax请求
        const { data: res } = await this.$http.put('users/' + id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        console.log(res);
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success('修改数据成功')
        this.editDialogVisible = false
        this.getUserList()
      })
    },
    // 用户点击删除触发的函数
    removueUserById(id) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        // 根据id删除数据库里的数据
        const { data: res } = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.getUserList();
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    // 展示分配角色的弹窗
    async setRole(userInfo) {
      this.userInfo = userInfo

      // 在展示对话框之前，获取所有列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.roleList = res.data
      this.setRoleDialogVisivle = true
    },
    // 点击按钮分配角色
    async saveRoleInfo() {
      if (!this.selectedRoleId) return this.$message.warning('请选择要分配的角色')
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectedRoleId
      })
      // console.log(res);
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 先关闭
      this.setRoleDialogVisivle = false
      // 再刷新数据
      this.getUserList()
      // 再提示
      this.$message.success('分配新角色成功')
    },
    // 监听分配角色对话框的关闭事件
    setRoleDialogClosed() {
      // 清空被选中的Id
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  },
  created() {
    this.getUserList()
  }
}
</script>

<style lang="less" scoped>
</style>