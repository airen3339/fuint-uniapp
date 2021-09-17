<template>
  <view class="container b-f p-b">
	<view class="base">
		<view class="merchant-name">
		  <view class="name">小隅安电子商务</view>
		</view>
	</view>
    <view class="pay-form">
    	<u-form :model="form" label-width="100rpx">
    	  <u-form-item class="input" prop="payAmount" :border-bottom="false" label="金额" rules="[{ required: true, message: '请输入支付金额', trigger: 'blur' }]">
    	      <view class="amount-icon">￥</view><u-input class="amount" disabled="true" v-model="form.payAmount" type="digit" placeholder=" "/>
    	  </u-form-item>
		  <u-form-item class="input" v-if="form.remark" :border-bottom="false" label="备注">
		      <u-input v-model="form.remark" type="text" placeholder=""/>
		  </u-form-item>
		  <u-form-item :border-bottom="false">
		      <view class="remark" @click="showRemarkPop()"><text class="iconfont icon-edit"></text>添加备注</view>
		  </u-form-item>
    	</u-form>
    </view>
	
	<neoceansoft-keyboard keyboardType="payment" behaviorBgColor="#00acac" @result="changeAmount" @paymentClick="doPay"></neoceansoft-keyboard>

	<view class="remark-popup">
	   <uni-popup ref="remarkPopup" type="dialog">
		  <uni-popup-dialog mode="input" focus="false" v-model="form.remark" title="备注信息" type="info" placeholder="请输入备注信息" :before-close="true" @close="cancelRemark" @confirm="doRemark"></uni-popup-dialog>
	   </uni-popup>
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
        form: {'payAmount': '', 'remark' : ''}
      }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
	  //empty
    },

    methods: {
	  showRemarkPop() {
		this.$refs.remarkPopup.open('top')
	  },
	  doRemark(remark) {
		this.form.remark = remark
		this.$refs.remarkPopup.close()
	  },
	  cancelRemark() {
		this.$refs.remarkPopup.close()
	  },
      // 支付金额改变
      changeAmount(e) {
		this.form.payAmount = e
      },
	  // 提交支付
	  doPay() {
	    const app = this
		
		if (app.form.payAmount.length < 1) {
			app.$error('支付金额不能为空')
			return false
		}
		
	    // 请求api
	    SettlementApi.submit(0, "", "payment", app.form.remark, app.form.payAmount)
	      .then(result => app.onSubmitCallback(result))
	      .catch(err => {
	        if (err.result) {
	          const errData = err.result.data
	          if (errData) {
	            return false
	          }
	        }
	      })
	  },
	  
	  // 订单提交成功后回调
	  onSubmitCallback(result) {
	    const app = this
	    // 微信支付
	    if (result.data.payType == PayTypeEnum.WECHAT.value) {
	      wxPayment(result.data.payment)
	        .then(() => {
				uni.showModal({
				  title: '支付结果',
				  content: '支付成功！',
				  showCancel: false,
				  success(o) {
				    if (o.confirm) {
				       app.form.payAmount = ""
				       app.form.remark = ""
				    }
				  }
				})
			})
	        .catch(err => app.$error('支付失败'))
	        .finally(() => {
	          //empty
	        })
	    }
	  	
		// 余额支付
	    if (result.data.payType == PayTypeEnum.BALANCE.value) {
	      app.$error('支付成功')
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
	.remark-popup {
		border: #cccccc solid 1px;
		background: red;
	}
  	.input {
  		padding-left: 20rpx;
		padding-right: 20rpx;
		margin-top: 30rpx;
  		margin-bottom: 20rpx;
  		border-radius: 10rpx;
  		width: 94%;
		border: dashed 1rpx #cccccc;
  		display: inline-flex;
  	}
	.amount {
		font-weight: bold;
	}
	.amount-icon {
		font-size: 45rpx;
		font-weight: bold;
		float: left;
	}
	.remark {
		width: 100%;
		text-align: right;
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
