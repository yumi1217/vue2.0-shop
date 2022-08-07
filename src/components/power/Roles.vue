<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button @click="insertRight" type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe="">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom', 'vcenter', index === 0 ? 'bdtop' : '']"
              v-for="(item, index) in scope.row.children" :key="item.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item.id)">
                  {{ item.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 二级权限 -->
                <el-row :class="[index2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, index2) in item.children"
                  :key="item2.id">
                  <el-col :span="6">
                    <el-tag closable @close="removeRightById(scope.row, item2.id)" type="success">{{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag closable @close="removeRightById(scope.row, item3.id)" type="danger"
                      v-for="item3 in item2.children" :key="item3.id">
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-tooltip :enterable="false" effect="dark" content="分配权限" placement="top">
              <el-button @click="showSetRightDialog(scope.row)" size="mini" type="info" icon="el-icon-share">分配权限
              </el-button>
            </el-tooltip>
            <el-button @click="showEditDialog(scope.row)" size="mini" type="warning" icon="el-icon-edit">编辑</el-button>
            <el-button @click="deleteRight(scope.row.id)" size="mini" type="danger" icon="el-icon-delete">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 这是分配权限的弹窗 -->
    <el-dialog @close="setRightDialogClosed" title="分配权限" :visible.sync="setRightDialogVisible" width="50%">
      <el-tree ref="treeRef" :default-checked-keys="defKeys" default-expand-all node-key="id" show-checkbox
        :data="rightsList" :props="treeProps"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 这是添加角色的弹窗 -->
    <el-dialog title="添加角色" :visible.sync="insertRightDialogVisible" width="50%">
      <el-form :model="insertRightForm" :rules="insertRightRules" ref="insertRightFromRef">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="insertRightForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="insertRightForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="insertRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRight">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 这是修改角色的弹窗 -->
    <el-dialog title="修改角色" :visible.sync="editRightDialogVisible" width="50%">
      <el-form :model="editRightForm" :rules="editRightRules" ref="editRightFromRef">
        <el-form-item label="角色Id" prop="id">
          <el-input disabled v-model="editRightForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRightForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRightForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRightInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色的列表数据
      roleList: [],
      // 分配权限弹窗默认状态
      setRightDialogVisible: false,
      // 所有权限列表
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点Id值数组
      defKeys: [],
      // 当前即将分配权限的Id
      roleId: '',
      // 控制添加角色的状态
      insertRightDialogVisible: false,
      // 添加角色的表单
      insertRightForm: {
        // 角色名称
        roleName: '',
        // 角色描述
        roleDesc: ''
      },
      // 添加角色的验证规则
      insertRightRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 5, max: 10, message: '长度在 5 到 10 个字符', trigger: 'blur' }
        ]
      },
      // 控制修改角色的状态
      editRightDialogVisible: false,
      // 修改角色的表单信息
      editRightForm: {
        // 角色Id
        id: '',
        // 角色名称
        roleName: '',
        // 角色描述
        roleDesc: ''
      },
      // 修改表单的验证规则
      editRightRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 5, max: 10, message: '长度在 5 到 10 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    // 调用获取权限列表的函数
    this.getRolesList();
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      // console.log(res);
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.roleList = res.data
    },
    // 根据Id删除对应的权限
    removeRightById(role, rightId) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        // console.log(rightId);
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        // console.log(res);
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success('取消权限成功')
        role.children = res.data
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      // 将当前第一级权限的Id存储起来
      this.roleId = role.id
      // console.log(role);
      // 获取所有权限数据
      const { data: res } = await this.$http.get('rights/tree')
      // console.log(res);
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.rightsList = res.data
      // 递归获取三级节点的Id
      this.getLeafKeys(role, this.defKeys)
      // 展示弹窗
      this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的Id，并保存到数据中defKeys
    getLeafKeys(node, arr) {
      // 如果当前node节点不包含children属性，则为三级权限，将id保存到数组里面
      if (!node.children) {
        return arr.push(node.id)
      }

      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 关闭对话框时，触发的监听函数
    setRightDialogClosed() {
      // console.log('关闭了Dialog弹窗');
      this.defKeys = []
    },
    // 用户点击确定时，分配权限的函数
    async allotRights() {
      // console.log(roleId);
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // console.log(keys);
      // 用逗号拼接数组形成字符串
      const idStr = keys.join(',')
      // console.log(idStr);
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      // console.log(res);
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightDialogVisible = false
    },
    // 添加角色的点击事件
    insertRight() {
      this.insertRightDialogVisible = true
    },
    // 用户点击确认添加后
    addRight() {
      // 验证表单是否通过
      this.$refs.insertRightFromRef.validate(async (valid) => {
        if (!valid) return this.$message.warning('请填写正确的信息')
        // 通过以后发起ajax请求
        const { data: res } = await this.$http.post('roles', this.insertRightForm)
        console.log(res);
        if (res.meta.status !== 201) return this.$message.error('创建失败')
        this.getRolesList()
        this.$message.success('添加角色成功')
        // this.insertRightForm.remove()
        this.$refs.insertRightFromRef.resetFields();
        this.insertRightDialogVisible = false
      })
    },
    // 根据id删除角色的函数
    deleteRight(id) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        // console.log(id);
        const { data: res } = await this.$http.delete(`roles/${id}`)
        // console.log(res);
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.getRolesList()
        this.$message.success('删除角色成功')
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });

    },
    // 点击修改表单的函数
    showEditDialog(item) {
      // console.log(item);
      this.editRightForm.id = item.id
      this.editRightForm.roleName = item.roleName
      this.editRightForm.roleDesc = item.roleDesc
      this.editRightDialogVisible = true
    },
    // 用户修改完信息以后点击确认的函数
    editRightInfo() {
      this.$refs.editRightFromRef.validate(async (valid) => {
        // console.log(valid);
        if (!valid) return this.$message.warning('请填写正确的信息')
        // 验证通过后，发起ajax请求
        const { data: res } = await this.$http.put(`roles/${this.editRightForm.id}`, {
          roleName: this.editRightForm.roleName,
          roleDesc: this.editRightForm.roleDesc
        })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success('修改数据成功')
        this.editRightDialogVisible = false
        this.getRolesList()
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

// 横向居中对齐
.vcenter {
  display: flex;
  align-items: center;
}
</style>