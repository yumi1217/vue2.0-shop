<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button @click="addCateDialogVisible = true" type="primary">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table class="treeTable" :show-row-hover="false" border index-text="#" show-index :expand-type="false"
        :selection-type="false" :data="cateList" :columns="columns">
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i style="color:lightgreen" class="el-icon-success" v-if="scope.row.cat_deleted === false"></i>
          <i style="color:red" class="el-icon-error" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button @click="editCate(scope.row)" type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button @click="deleteCate(scope.row.cat_id)" type="danger" icon="el-icon-delete" size="mini">删除
          </el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum" :page-sizes="[3, 5, 10, 15]" :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog @close="addCateDialogClosed" title="添加分类" :visible.sync="addCateDialogVisible" width="50%">
      <!-- 添加分类的表单 -->
      <el-form :model="addCateForm" :rules="addCateRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="分类分类：">
          <!-- options 用来指定数据源 -->
          <!-- props 用来指定配置对象 -->
          <el-cascader clearable change-on-select
            :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children' }"
            v-model="selectedKeys" :options="parentCateList" @change="parentCateChanged">
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类的对话框 -->
    <el-dialog @close="editCateDialogClosed" title="编辑分类" :visible.sync="editCateDialogVisible" width="50%">
      <el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="isokeditCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表，默认为空
      cateList: [],
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用的模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用的模板名称
          template: 'opt'
        }
      ],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 父级分类的名称
        cat_pid: 0,
        // 添加分类的名称
        cat_name: '',
        // 当前分类的等级，默认要添加的是一级分类
        cat_level: 0
      },
      // 添加分类表单的验证规则对象
      addCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 选中的父级分类的Id数组
      selectedKeys: [],
      // 控制编辑弹窗
      editCateDialogVisible: false,
      // 编辑表单的数据
      editCateForm: {
        id: '',
        cat_name: ''
      },
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
    this.getParentCateList()
  },
  methods: {
    // 获取商品分类的数据列表函数
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.querInfo
      }
      )
      // console.log(res);
      if (res.meta.status != 200) return this.$message.error(res.meta.msg)
      // 把数据列表，赋值给catelist
      this.cateList = res.data.result
      // 为总数据条数赋值
      this.total = res.data.total
      // console.log(this.cateList);
    },
    // 监听pagesize改变
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize
      this.getCateList();
    },
    // 监听pagenum的改变
    handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage
      this.getCateList()
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })
      // console.log(res);
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.parentCateList = res.data
      // console.log(this.parentCateList);
    },
    // 选择项发生变化触发函数
    parentCateChanged() {
      // console.log(this.selectedKeys);
      // 如果selectedKeys 数组中的length大于0，证明选择的父级分类
      // 反之，就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]

        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      } else {
        this.addCateForm.cat_pid = 0

        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮，添加新的分类
    addCate() {
      this.$refs.addCateFormRef.validate(async (vaild) => {
        if (!vaild) return this.$message.warning('请正确填写表单')
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        // console.log(res);
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success('添加分类成功')
        this.addCateDialogVisible = false
        this.getCateList()
      })
    },
    // 监听对话框的关闭事件
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 编辑分类
    editCate(item) {
      this.editCateForm.id = item.cat_id
      this.editCateForm.cat_name = item.cat_name
      this.editCateDialogVisible = true
      // console.log(this.editCateForm.id, this.editCateForm.cat_name);
    },
    // 用户点击确认修改
    isokeditCate() {
      // 首先验证表单通过否
      this.$refs.editCateFormRef.validate(async (valid) => {
        if (!valid) return $message.error('请正确填写表单')
        const { data: res } = await this.$http.put(`categories/${this.editCateForm.id}`, {
          cat_name: this.editCateForm.cat_name
        })
        // console.log(res);
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success('修改分类成功')
        this.editCateDialogVisible = false
        this.getCateList()
      })
    },
    // 关闭编辑分类的函数
    editCateDialogClosed() {
      this.$refs.editCateFormRef.resetFields();
    },
    // 删除分类
    deleteCate(id) {
      // console.log(id);
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`categories/${id}`)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.getCateList()
        this.$message.success('删除分类成功')
        // console.log(res);
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}

.el-cascader-menu {
  max-height: 200px;
}
</style>