<template>
  <view class="container b-f p-b">
	<view class="base">
		<view class="merchant-name">
		  <view class="name">小隅安电子商务</view>
		</view>
	</view>
    <view class="pay-form">
    	<u-form :model="form" label-width="180rpx">
    	  <u-form-item class="input" left-icon="rmb-circle" prop="payAmount" label="支付金额" rules="[{ required: true, message: '请输入支付金额', trigger: 'blur' }]">
    	    <u-input v-model="form.payAmount" type="digit" placeholder="请输入支付金额" />
    	  </u-form-item>
    	  <u-form-item class="input" left-icon="edit-pen" label="支付备注" :border-bottom="false">
    	    <u-input v-model="form.remark" placeholder="不输入默认为空" />
    	  </u-form-item>
    	</u-form>
    </view>
    <!-- 快捷导航 -->
    <shortcut/>
	<!-- 底部选项卡 -->
	<view class="footer-fixed">
	  <view class="footer-container">
	    <!-- 操作按钮 -->
	    <view class="foo-item-btn">
	      <view class="btn-wrapper">
	        <view class="btn-item btn-item-main" @click="doPay()">
	          <view :class="{ disabled }">立即支付</view>
	        </view>
	      </view>
	    </view>
	  </view>
	</view>
  </view>
</template>

<script>
  import jyfParser from '@/components/jyf-parser/jyf-parser'
  import Shortcut from '@/components/shortcut'
  import * as SettlementApi from '@/api/settlement'
  import PayTypeEnum from '@/common/enum/order/PayType'
  import { wxPayment } from '@/utils/app'

  export default {
    components: {
      Shortcut
    },
    data() {
      return {
        // 加载中
        isLoading: true,
		disabled : false,
        form: {}
      }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
	  // empty
    },

    methods: {
	  // 提交支付
	  doPay() {
	    const app = this
		
		if (!app.form.payAmount) {
			app.$error('支付金额不能为空')
			return false
		}
		
		if (app.disabled) {
		  return false
		}

	    // 按钮禁用
	    app.disabled = true
		
	    // 请求api
	    SettlementApi.submit(0, "", "payment", app.form.remark, app.form.payAmount)
	      .then(result => app.onSubmitCallback(result))
	      .catch(err => {
	        if (err.result) {
	          const errData = err.result.data
	          if (errData.isCreated) {
	            app.navToMyOrder(errData.orderInfo.id)
	            return false
	          }
	        }
	        app.disabled = false
	      })
	  },
	  
	  // 订单提交成功后回调
	  onSubmitCallback(result) {
	    const app = this
	    // 微信支付
	    if (result.data.payType == PayTypeEnum.WECHAT.value) {
	      wxPayment(result.data.payment)
	        .then(() => {
				app.$success('支付成功')
				app.form.payAmount = ""
				app.form.remark = ""
			})
	        .catch(err => app.$error('支付失败'))
	        .finally(() => {
	          app.disabled = false
	          app.navToMyOrder(result.data.orderInfo.id)
	        })
	    }
	  	
		// 余额支付
	    if (result.data.payType == PayTypeEnum.BALANCE.value) {
	      app.$success('支付成功')
	      app.disabled = false
	      app.navToMyOrder(result.data.orderInfo.id)
	    }
	  },
    }
  }
</script>

<style lang="scss" scoped>
  .container {
    min-height: 100vh;
    padding: 20rpx;
    background: #fff;
	color:#666666;
  }
  .base {
	  background: #00acac;
  	  padding: 30rpx;
  	  border-radius: 10rpx;
	  color: #ffffff;
  	  margin: 20rpx;
  	  height: 100rpx;
  	  .merchant-name {
  		  margin-left: 30rpx;
  		  overflow: hidden;
		  text-align: center;
		  font-weight: bold;
		  font-size: 30rpx;
  	  }
  }
  .pay-form {
  	border: solid 3rpx #00acac;
  	padding: 30rpx;
  	border-radius: 10rpx;
  	margin: 60rpx 20rpx 20rpx 20rpx;
  	.input {
  		padding-left: 20rpx;
		margin-top: 30rpx;
  		margin-bottom: 20rpx;
  		border-radius: 10rpx;
  		width: 98%;
  		display: inline-flex;
  	}
  }
  
  /* 底部操作栏 */
  .footer-fixed {
    position: fixed;
    bottom: var(--window-bottom);
    left: 0;
    right: 0;
    display: flex;
    height: 96rpx;
    z-index: 11;
    box-shadow: 0 -4rpx 40rpx 0 rgba(144, 52, 52, 0.1);
    background: #fff;
  }
  
  .footer-container {
    width: 100%;
    display: flex;
  }
  
  // 操作按钮
  .foo-item-btn {
    flex: 1;
    .btn-wrapper {
      height: 100%;
      display: flex;
      align-items: center;
    }
  
    .btn-item {
      flex: 1;
      font-size: 28rpx;
      height: 72rpx;
      line-height: 72rpx;
      margin-right: 16rpx;
  	  margin-left: 16rpx;
      text-align: center;
      color: #fff;
      border-radius: 50rpx;
    }
    // 立即领取按钮
    .btn-item-main {
      background: linear-gradient(to right, #f9211c, #ff6335);
    }
  }
</style>
