<template>
  <view class="container">
    <mescroll-body ref="mescrollRef" :sticky="true" @init="mescrollInit" :down="{ native: true }" @down="downCallback"
      :up="upOption" @up="upCallback">

      <!-- tab栏 -->
      <u-tabs :list="tabs" :is-scroll="false" :current="curTab" active-color="#FA2209" :duration="0.2" @change="onChangeTab" />

      <!-- 订单列表 -->
      <view class="order-list">
        <view class="order-item" v-for="(item, index) in list.content" :key="index">
          <view class="item-top" @click="handleTargetDetail(item.id)">
            <view class="item-top-left">
			  <text class="order-type">{{ item.typeName }}</text>
            </view>
            <view class="item-top-right">
              <text :class="item.status">{{ item.statusText }}</text>
            </view>
          </view>
          <!-- 商品列表 -->
          <view class="goods-list" v-if="item.goods" @click="handleTargetDetail(item.id)">
            <view class="goods-item" v-for="(goods, idx) in item.goods" :key="idx">
              <!-- 商品图片 -->
              <view class="goods-image">
                <image class="image" :src="goods.image"></image>
              </view>
              <!-- 商品信息 -->
              <view class="goods-content">
                <view class="goods-title twolist-hidden"><text>{{ goods.name }}</text></view>
				<view class="goods-props clearfix">
				  <view class="goods-props-item" v-for="(props, idx) in goods.specList" :key="idx">
					<text>{{ props.specValue }}</text>
				  </view>
				</view>
              </view>
              <!-- 交易信息 -->
              <view class="goods-trade">
                <view class="goods-price">
                  <text class="unit">￥</text>
                  <text class="value">{{ goods.price }}</text>
                </view>
                <view class="goods-num">
                  <text>×{{ goods.num }}</text>
                </view>
              </view>
            </view>
          </view>
		  <!-- 备注信息 -->
		  <view v-if="item.remark" class="remark" @click="handleTargetDetail(item.id)">
			  <text>备注：</text>
			  <text>{{ item.remark ? item.remark : '--'}}</text>
		  </view>
          <!-- 订单合计 -->
          <view class="order-total" @click="handleTargetDetail(item.id)">
            <text>总金额</text>
            <text class="unit">￥</text>
            <text class="money">{{ item.amount }}</text>
          </view>
          <!-- 订单操作 -->
          <view class="order-handle">
			<view class="order-time">
				<text class="time">{{ item.createTime }}</text>
			</view>
            <view class="btn-group">
              <!-- 取消订单 -->
              <view v-if="item.status == 'A'">
                <view class="btn-item" @click="onCancel(item.id)">取消</view>
              </view>
              <!-- 订单支付 -->
              <view v-if="item.status == 'A'">
                <view class="btn-item active" @click="onPay(item.id)">去支付</view>
              </view>
            </view>
          </view>
        </view>
		<empty v-if="!list.content.length" :isLoading="isLoading" :custom-style="{ padding: '180rpx 50rpx' }" tips="当前没有订单, 快去逛逛吧">
		  <view slot="slot" class="empty-ipt" @click="onTargetIndex">
		    <text>去逛逛</text>
		  </view>
		</empty>

      </view>

    </mescroll-body>

    <!-- 支付方式弹窗 -->
    <u-popup v-model="showPayPopup" mode="bottom" border-radius="26" :closeable="true">
      <view class="pay-popup">
        <view class="title">请选择支付方式</view>
        <view class="pop-content">
          <!-- 微信支付 -->
          <view class="pay-item dis-flex flex-x-between" @click="onSelectPayType(PayTypeEnum.WECHAT.value)">
            <view class="item-left dis-flex flex-y-center">
              <view class="item-left_icon wechat">
                <text class="iconfont icon-weixinzhifu"></text>
              </view>
              <view class="item-left_text">
                <text>{{ PayTypeEnum.WECHAT.name }}</text>
              </view>
            </view>
          </view>
          <!-- 余额支付 -->
          <view class="pay-item dis-flex flex-x-between" @click="onSelectPayType(PayTypeEnum.BALANCE.value)">
            <view class="item-left dis-flex flex-y-center">
              <view class="item-left_icon balance">
                <text class="iconfont icon-qiandai"></text>
              </view>
              <view class="item-left_text">
                <text>{{ PayTypeEnum.BALANCE.name }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </u-popup>
  </view>

</template>

<script>
  import {
    DeliveryStatusEnum,
    DeliveryTypeEnum,
    OrderStatusEnum,
    PayStatusEnum,
    PayTypeEnum,
    ReceiptStatusEnum
  } from '@/common/enum/order'
  import MescrollBody from '@/components/mescroll-uni/mescroll-body.vue'
  import MescrollMixin from '@/components/mescroll-uni/mescroll-mixins'
  import { getEmptyPaginateObj, getMoreListData } from '@/utils/app'
  import * as OrderApi from '@/api/order'
  import { wxPayment } from '@/utils/app'
  import Empty from '@/components/empty'

  // 每页记录数量
  const pageSize = 15

  // tab栏数据
  const tabs = [{
    name: `全部`,
    value: 'all'
  }, {
    name: `待支付`,
    value: 'pay'
  }, {
    name: `已支付`,
    value: 'paid'
  }, {
    name: `已取消`,
    value: 'cancel'
  }]

  export default {
    components: {
      MescrollBody,
	  Empty
    },
    mixins: [MescrollMixin],
    data() {
      return {
        // 枚举类
        DeliveryStatusEnum,
        DeliveryTypeEnum,
        OrderStatusEnum,
        PayStatusEnum,
        PayTypeEnum,
        ReceiptStatusEnum,

        // 当前页面参数
        options: { dataType: 'all' },
        // tab栏数据
        tabs,
        // 当前标签索引
        curTab: 0,
        // 订单列表数据
        list: getEmptyPaginateObj(),
		// 正在加载
		isLoading: false,
        // 上拉加载配置
        upOption: {
          // 首次自动执行
          auto: true,
          // 每页数据的数量; 默认10
          page: { size: pageSize },
          // 数量要大于4条才显示无更多数据
          noMoreSize: 4,
          // 空布局
          empty: {
            tip: '亲，暂无订单记录'
          }
        },
        // 控制首次触发onShow事件时不刷新列表
        canReset: false,
        // 支付方式弹窗
        showPayPopup: false,
		statusText: "payStatus"
      }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      // 初始化当前选中的标签
      this.initCurTab(options)
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
      this.canReset && this.onRefreshList()
      this.canReset = true
    },

    methods: {

      // 初始化当前选中的标签
      initCurTab(options) {
        const app = this
        if (options.dataType) {
          const index = app.tabs.findIndex(item => item.value == options.dataType)
          app.curTab = index > -1 ? index : 0
        }
      },

      /**
       * 上拉加载的回调 (页面初始化时也会执行一次)
       * 其中page.num:当前页 从1开始, page.size:每页数据条数,默认10
       * @param {Object} page
       */
      upCallback(page) {
        const app = this
        // 设置列表数据
        app.getOrderList(page.num)
          .then(list => {
            const curPageLen = list.data.length
            const totalSize = list.data.total
            app.mescroll.endBySize(curPageLen, totalSize)
          })
          .catch(() => app.mescroll.endErr())
      },

      // 获取订单列表
      getOrderList(pageNo = 1) {
        const app = this
        return new Promise((resolve, reject) => {
          OrderApi.list({ dataType: app.getTabValue(), page: pageNo }, { load: false })
            .then(result => {
              // 合并新数据
              const newList = result.data
              app.list.content = getMoreListData(newList, app.list, pageNo)
              resolve(newList)
            })
        })
      },
	  
	  // 点击跳转到首页
	  onTargetIndex() {
	    this.$navTo('pages/index/index')
	  },

      // 获取当前标签项的值
      getTabValue() {
        return this.tabs[this.curTab].value
      },

      // 切换标签项
      onChangeTab(index) {
        const app = this
        // 设置当前选中的标签
        app.curTab = index
        // 刷新订单列表
        app.onRefreshList()
      },

      // 刷新订单列表
      onRefreshList() {
        this.list = getEmptyPaginateObj()
        setTimeout(() => {
          this.mescroll.resetUpScroll()
        }, 120)
      },

      // 取消订单
      onCancel(orderId) {
        const app = this
        uni.showModal({
          title: '友情提示',
          content: '确认要取消该订单吗？',
          success(o) {
            if (o.confirm) {
              OrderApi.cancel(orderId)
                .then(result => {
                  // 显示成功信息
                  app.$success(result.message)
                  // 刷新订单列表
                  app.onRefreshList()
                })
            }
          }
        });
      },

      // 点击去支付
      onPay(orderId) {
        // 记录订单id
        this.payOrderId = orderId
        // 显示支付方式弹窗
        this.showPayPopup = true
      },

      // 选择支付方式
      onSelectPayType(payType) {
        const app = this
        // 隐藏支付方式弹窗
        this.showPayPopup = false
        // 发起支付请求
        OrderApi.pay(app.payOrderId, payType)
          .then(result => app.onSubmitCallback(result))
      },

      // 订单提交成功后回调
      onSubmitCallback(result) {
        const app = this
        // 发起微信支付
        if (result.data.payType == PayTypeEnum.WECHAT.value) {
          wxPayment(result.data.payment)
            .then(() => {
              app.$success('支付成功')
              setTimeout(() => {
                app.onRefreshList()
              }, 1500)
            })
            .catch(err => {
              app.$error('订单未支付')
            })
            .finally(() => {
              app.disabled = false
            })
        }
        // 余额支付
        if (result.data.pay_type == PayTypeEnum.BALANCE.value) {
          app.$success('支付成功')
          app.disabled = false
          setTimeout(() => {
            app.onRefreshList()
          }, 1500)
        }
      },

      // 跳转到订单详情页
      handleTargetDetail(orderId) {
        this.$navTo('pages/order/detail', { orderId })
      }
    }

  }
</script>

<style lang="scss" scoped>
  // 项目内容
  .order-item {
    margin: 10rpx auto 10rpx auto;
    padding: 20rpx 20rpx;
    width: 94%;
	border: 3rpx solid #e8e8e8;
    box-shadow: 5rpx 5rpx 5rpx 5rpx rgba(0.05, 0.05, 0.05, 0.05);
    border-radius: 16rpx;
    background: #fff;
	.A{
		color:$uni-text-color-active;
	}
	.B{
		color:$uni-text-color;
	}
  }
  // 空数据按钮
  .empty-ipt {
    width: 220rpx;
    margin: 10rpx auto;
    font-size: 28rpx;
    height: 64rpx;
    line-height: 64rpx;
    text-align: center;
    color: #fff;
    border-radius: 50rpx;
    background: linear-gradient(to right, #00acac, #00acac);
  }

  // 项目顶部
  .item-top {
    display: flex;
    justify-content: space-between;
    font-size: 26rpx;
    margin-bottom: 40rpx;

    .order-type {
	  font-weight: bold;
	  margin-left: 20rpx;
    }

    .state-text {
      color: $uni-text-color-active;
    }
  }

  // 商品列表
  .goods-list {
    // 商品项
    .goods-item {
      display: flex;
      margin-bottom: 10rpx;
	  border-bottom: 3rpx solid #e8e8e8;
	  padding: 20rpx;

      // 商品图片
      .goods-image {
        width: 180rpx;
        height: 143rpx;

        .image {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: 8rpx;
        }
      }

      // 商品内容
      .goods-content {
        flex: 1;
        padding-left: 16rpx;
        padding-top: 16rpx;

        .goods-title {
          font-size: 26rpx;
          max-height: 76rpx;
        }

        .goods-props {
          margin-top: 14rpx;
          height: 40rpx;
          color: #ababab;
          font-size: 24rpx;
          overflow: hidden;

          .goods-props-item {
            display: inline-block;
            margin-right: 14rpx;
            padding: 4rpx 16rpx;
            border-radius: 12rpx;
            background-color: #F5F5F5;
            width: auto;
          }
        }
      }

      // 交易信息
      .goods-trade {
        padding-top: 16rpx;
        width: 150rpx;
        text-align: right;
        color: $uni-text-color-grey;
        font-size: 26rpx;

        .goods-price {
          vertical-align: bottom;
          margin-bottom: 16rpx;
          .unit {
            margin-right: -2rpx;
            font-size: 24rpx;
          }
        }
      }
    }
  }
  // 备注信息
  .remark {
	  padding: 12rpx 0 12rpx 20rpx;
	  border-radius: 5rpx;
	  height: 60rpx;
  }

  // 订单合计
  .order-total {
    font-size: 26rpx;
    vertical-align: bottom;
    text-align: right;
    height: 40rpx;
	margin-top: 30rpx;
    margin-bottom: 30rpx;

    .unit {
      margin-left: 8rpx;
      margin-right: -2rpx;
      font-size: 26rpx;
    }

    .money {
      font-size: 28rpx;
    }
  }

  // 订单操作
  .order-handle {
	height: 50rpx;
	.order-time {
	    color: #777;
		float: left;
		margin-left: 20rpx;
	}
    .btn-group {

      .btn-item {
        border-radius: 6rpx;
        padding: 6rpx 20rpx;
        font-size: 28rpx;
        float: right;
        color: #383838;
        border: 1rpx solid #a8a8a8;
		margin-left: 25rpx;
     
        &.active {
          color: #ffffff;
		  background: #ff3800;
          border: 1rpx solid $uni-text-color-active;
        }
      }

    }

  }

  // 弹出层-支付方式
  .pay-popup {
    padding: 24rpx;

    .title {
      font-size: 30rpx;
      margin-bottom: 40rpx;
      font-weight: bold;
      text-align: center;
    }

    .pop-content {
      min-height: 260rpx;
      padding: 0 10rpx;

      .pay-item {
        padding: 24rpx 35rpx;
        font-size: 28rpx;
        border-bottom: 1rpx solid #f1f1f1;

        &:last-child {
          border-bottom: none;
        }

        .item-left_icon {
          margin-right: 20rpx;
          font-size: 32rpx;

          &.wechat {
            color: #00c800;
          }

          &.balance {
            color: #ff9700;
          }
        }
      }
    }
  }
</style>
