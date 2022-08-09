<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 头部的警告区域 -->
      <el-alert :closable="false" title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon>
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat-opt">
        <el-row>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader v-model="selectedCateKeys" :options="cateList"
            :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children' }"
            @change="handleChange">
          </el-cascader>
        </el-row>
      </el-row>

      <!-- tab 页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数的按钮 -->
          <el-button type="primary" @click="addDialogVisible = true" size="mini" :disabled="isBtnDisabled">添加参数
          </el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 玄幻渲染tag标签 -->
                <el-tag @close="handleClosed(index, scope.row)" closable v-for="(item, index) in scope.row.attr_vals"
                  :key="index">
                  {{
                      item
                  }}</el-tag>
                <!-- 动态添加标签 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model.trim="scope.row.inputValue"
                  ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button @click="showeditDialog(scope.row)" size="mini" type="primary" icon="el-icon-edit">编辑
                </el-button>
                <el-button @click="deleteDialog(scope.row)" size="mini" type="danger" icon="el-icon-delete">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性的按钮 -->
          <el-button type="primary" @click="addDialogVisible = true" size="mini" :disabled="isBtnDisabled">添加属性
          </el-button>
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 玄幻渲染tag标签 -->
                <el-tag @close="handleClosed(index, scope.row)" closable v-for="(item, index) in scope.row.attr_vals"
                  :key="index">
                  {{
                      item
                  }}</el-tag>
                <!-- 动态添加标签 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model.trim="scope.row.inputValue"
                  ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button @click="showeditDialog(scope.row)" size="mini" type="primary" icon="el-icon-edit">编辑
                </el-button>
                <el-button @click="deleteDialog(scope.row)" size="mini" type="danger" icon="el-icon-delete">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数的对话框 -->
    <el-dialog @close="addDialogClosed" :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%">
      <!-- 对话框form -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRuleFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数的对话框 -->
    <el-dialog @close="editDialogClosed" :title="'修改' + titleText" :visible.sync="editDialogVisible" width="50%">
      <!-- 对话框form -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRuleFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有商品的分类列表
      cateList: [],
      // 级联选择框双向绑定到的数组
      selectedCateKeys: [],
      // 被激活的页签的名称
      activeName: 'many',
      // 动态参数的数据
      manyTableData: [],
      // 静态属性的数据
      onlyTableData: [],
      // 控制添加数据的弹窗
      addDialogVisible: false,
      // 添加参数的表单的数据对象
      addForm: {
        attr_name: ''
      },
      // 表单的验证规则对象
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 修改弹窗的显示与隐藏
      editDialogVisible: false,
      // 修改参数的表单的数据对象
      editForm: {
        attr_id: '',
        attr_name: ''
      },
      // 修改表单的验证规则对象
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取所有商品的分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      // console.log(res);
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // this.$message.success('采访')
      this.cateList = res.data
      // console.log(this.cateList);
    },
    // 级联选择框选中项变化，会触发这个函数
    handleChange() {
      this.getParamsData()
    },
    // 获取参数的列表数据
    async getParamsData() {
      // console.log(this.selectedCateKeys);
      // 证明选中的不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // 证明选中的是三级分类
      // console.log(this.selectedCateKeys);
      // 选择了三级分类后，发起ajax请求
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: {
          sel: this.activeName
        }
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        // 文本框中输入的值
        item.inputValue = ''
      })
      // console.log(res.data);
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // tab页签点击事件的处理函数
    handleTabClick() {
      // console.log(this.activeName);
      this.getParamsData()
    },
    // 监听添加对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRuleFormRef.resetFields()
    },
    // 点击按钮添加函数
    addParams() {
      this.$refs.addFormRuleFormRef.validate(async (valid) => {
        if (!valid) return this.$message.warning('请填写正确的参数')
        // 发起ajax请求
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        // console.log(res);
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        // 提示
        this.$message.success('添加' + this.titleText + '成功')
        // 关闭
        this.addDialogVisible = false
        // 刷新
        this.getParamsData()
      })
    },
    // 修改按钮的点击事件
    showeditDialog(item) {
      console.log(item);
      this.editDialogVisible = true
      this.editForm.attr_name = item.attr_name
      this.editForm.attr_id = item.attr_id
    },
    // 监听修改对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRuleFormRef.resetFields()
    },
    // 确认修改的函数
    editParams() {
      this.$refs.editFormRuleFormRef.validate(async (valid) => {
        if (!valid) return this.$message.warning('请填写正确的参数')
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        // console.log(res);
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        // 提示
        this.$message.success('修改' + this.titleText + '成功')
        // 关闭
        this.editDialogVisible = false
        // 刷新
        this.getParamsData()
      })
    },
    // 删除函数
    deleteDialog(item) {
      // console.log(item);
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`categories/${item.cat_id}/attributes/${item.attr_id}`)
        // console.log(res);
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        // 提示
        this.$message.success('删除' + this.titleText + '成功')
        // 刷新
        this.getParamsData()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    // 文本框失去焦点，或按下了Enter都会触发
    async handleInputConfirm(row) {
      // console.log('ok');
      // 重新显示Tag
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 用户输入了真正的内容，需要做后续处理。
      row.attr_vals.push(row.inputValue)
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVals(row)
    },
    // 点击按钮，展示文本输入框
    showInput(row) {
      row.inputVisible = true
      // 让文本框自动获得焦点
      // $nextTick作用：当页面元素被重新渲染后，才会执行回调函数中的代码。
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 删除对应的参数可选项目
    handleClosed(index, row) {
      row.attr_vals.splice(index, 1)
      this.saveAttrVals(row)
    },
    // 将对attr_Vals保存到数据库
    async saveAttrVals(row) {
      // 发起请求，保存在数据库里
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(',')
      })
      // console.log(res);
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success('操作成功')
    }
  },
  computed: {
    // 如果按钮需要被禁用，则返回true，否则返回false
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的三级id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // Dialog对话框动态label
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.cat-opt {
  margin: 15px 0;
}

.input-new-tag {
  width: 120px !important;
}
</style>