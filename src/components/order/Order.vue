<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input v-model.trim="queryInfo.query" placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search" @click="sousuo"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单数据表格 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send">
        </el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button @click="showBox" size="mini" type="primary" icon="el-icon-edit"></el-button>
            <el-button @click="showProgressBox" size="mini" type="success" icon="el-icon-location"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
    <!-- 修改地址Dialog -->
    <el-dialog @close="addressDialogClosed" title="修改地址" :visible.sync="addressVisible" width="50%">
      <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader :props="{ expandTrigger: 'hover' }" :options="cityDate" v-model="addressForm.address1">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 显示物流信息对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
      <!-- timeline时间线 -->
      <el-timeline>
        <el-timeline-item :timestamp="item.time" v-for="(item, index) in progressInfo" :key="index">
          {{ item.context }}
        </el-timeline-item>
      </el-timeline>
      <span slot="footer" class="dialog-footer">
        <el-button @click="progressVisible = false">取 消</el-button>
        <el-button type="primary" @click="progressVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cityDate from './citydata.js'
export default {
  data() {
    return {
      // 订单列表数据
      orderList: [],
      // 查询对象
      queryInfo: {
        // 查询关键字
        query: '',
        // 当前第几页
        pagenum: 1,
        // 每一页多少条数据
        pagesize: 10
      },
      // 总数据条数
      total: 0,
      // 控制修改弹窗的状态
      addressVisible: false,
      // 地址弹窗的数据
      addressForm: {
        address1: [],
        address2: ''
      },
      // 地址数据的验证规则
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      cityDate,
      // 物流信息对话框状态
      progressVisible: false,
      // 物流信息的接口假返回值
      progressData: {
        "data": [
          {
            "time": "2018-05-10 09:39:00",
            "ftime": "2018-05-10 09:39:00",
            "context": "已签收,感谢使用顺丰,期待再次为您服务",
            "location": ""
          },
          {
            "time": "2018-05-10 08:23:00",
            "ftime": "2018-05-10 08:23:00",
            "context": "[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件",
            "location": ""
          },
          {
            "time": "2018-05-10 07:32:00",
            "ftime": "2018-05-10 07:32:00",
            "context": "快件到达 [北京海淀育新小区营业点]",
            "location": ""
          },
          {
            "time": "2018-05-10 02:03:00",
            "ftime": "2018-05-10 02:03:00",
            "context": "快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]",
            "location": ""
          },
          {
            "time": "2018-05-09 23:05:00",
            "ftime": "2018-05-09 23:05:00",
            "context": "快件到达 [北京顺义集散中心]",
            "location": ""
          },
          {
            "time": "2018-05-09 21:21:00",
            "ftime": "2018-05-09 21:21:00",
            "context": "快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]",
            "location": ""
          },
          {
            "time": "2018-05-09 13:07:00",
            "ftime": "2018-05-09 13:07:00",
            "context": "顺丰速运 已收取快件",
            "location": ""
          },
          {
            "time": "2018-05-09 12:25:03",
            "ftime": "2018-05-09 12:25:03",
            "context": "卖家发货",
            "location": ""
          },
          {
            "time": "2018-05-09 12:22:24",
            "ftime": "2018-05-09 12:22:24",
            "context": "您的订单将由HLA（北京海淀区清河中街店）门店安排发货。",
            "location": ""
          },
          {
            "time": "2018-05-08 21:36:04",
            "ftime": "2018-05-08 21:36:04",
            "context": "商品已经下单",
            "location": ""
          }
        ],
        "meta": { "status": 200, "message": "获取物流信息成功！" }
      },
      // 数据
      progressInfo: []
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    // 获取列表数据
    async getOrderList() {
      // console.log(this.queryInfo.query);
      const { data: res } = await this.$http.get('orders', {
        params: {
          query: this.queryInfo.query,
          pagenum: this.queryInfo.pagenum,
          pagesize: this.queryInfo.pagesize
        }
      })
      // console.log(res);
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.orderList = res.data.goods
      // console.log(this.orderList);
      this.total = res.data.total
      // console.log(this.total);
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    // 显示修改地址对话框
    showBox() {
      this.addressVisible = true
    },
    // 关闭了修改地址弹窗
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields()
    },
    // 显示物流信息按钮
    showProgressBox() {
      const res = this.progressData
      if (res.meta.status !== 200) return this.$message.error('获取物流信息失败')
      this.progressInfo = res.data
      // console.log(this.progressInfo);
      // console.log(res);
      this.progressVisible = true
    },
    sousuo() {
      // console.log('点击了');
      // console.log(this.queryInfo);
      this.getOrderList()
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>