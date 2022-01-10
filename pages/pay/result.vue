<template>
  <view class="container">
	  <view class="success">
		<view class="result">
		   <img class="icon" src="/static/pay/success.png"/>
		   <text class="text">支付成功</text>
		</view>
		<view class="amount">￥{{ amount }}</view>
		<view class="point">使用{{ point }}积分</view>
	  </view>
	  <view v-if="false" class="attention">
		<view class="result"><img class="icon" src="/static/pay/success.png"/>使用失败</view>
	  </view>
	  <view class="confirm" @click="doConfirm()">确定</view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        amount: 0,
		point: 0,
      }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      // 当前页面参数
	  this.amount = options.amount ? options.amount : 0
	  this.point = options.point ? options.point : 0
    },

    methods: {
	  /**
	   * 确定
	   * */
      doConfirm() {
        this.$navTo('pages/index/index')
      }
    }
  }
</script>

<style lang="scss" scoped>
      .success {
        width: 100%;
        text-align: center;
        margin-top: 200rpx;
		.result {
			font-size: 35rpx;
			text-align: center;
			padding: 10rpx;
			height: 70rpx;
			.icon {
				width: 55rpx;
				height: 55rpx;
				display: inline-block;
				box-sizing: border-box;
				vertical-align: middle; 
			}
			.text {
				text-align: center;
				height: 100%;
				display: inline-block;
				box-sizing: border-box;
				vertical-align: middle;
				color: #00B83F;
				font-weight: bold;
			}
		}
		.amount {
			font-weight: bold;
			font-size: 65rpx;
			margin-top: 50rpx;
			margin-bottom: 50rpx;
			color: #000000;
		}
		.point {
			font-size: 30rpx;
		}
      }
      .attention {
        width: 100%;
        text-align: center;
        margin-top: 14rpx;
      }
	  .confirm {
		  flex: 1;
		  font-size: 28rpx;
		  height: 72rpx;
		  line-height: 72rpx;
		  text-align: center;
		  color: #fff;
		  border-radius: 50rpx;
		  width: 300rpx;
		  margin: 200rpx auto;
		  background: #00acac;
	  }
</style>
