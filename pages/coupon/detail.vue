<template>
  <view v-if="!isLoading" class="container b-f p-b">
	<view class="base">
		<view class="coupon-image">
			<image class="image" :src="detail.image"></image>
		</view>
		<view class="coupon-title">
		  <view class="name">{{ detail.name }}</view>
		  <view v-if="detail.amount > 0" class="price"><span class="label">面额：</span>￥{{ detail.amount }}</view>
		  <view class="time">有效期：{{ detail.effectiveDate }}</view>
		</view>
	</view>
    <view class="coupon-qr">
      <view>
         <image class="image" :src="detail.qrCode"></image>
      </view>
      <view class="qr-code">
          <p class="code">兑换码：{{ detail.code }}</p>
		  <p class="tips">请出示以上券码给核销人员</p>
      </view>
    </view>
    <view class="coupon-content m-top20">
		<view class="title">使用须知</view>
        <view class="content"><jyf-parser :html="detail.description"></jyf-parser></view>
    </view>
    <!-- 快捷导航 -->
    <shortcut/>
  </view>
</template>

<script>
  import jyfParser from '@/components/jyf-parser/jyf-parser'
  import Shortcut from '@/components/shortcut'
  import * as myCouponApi from '@/api/myCoupon'

  export default {
    components: {
      Shortcut
    },
    data() {
      return {
        // 当前会员卡券ID
        userCouponId: null,
        // 加载中
        isLoading: true,
        // 当前卡券详情
        detail: null,
		qrCode: ""
      }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      // 记录ID
      this.userCouponId = options.id
      // 获取卡券详情
      this.getCouponDetail()
    },

    methods: {
      // 获取卡券详情
      getCouponDetail() {
        const app = this
        myCouponApi.detail(app.userCouponId)
          .then(result => {
            app.detail = result.data
          })
          .finally(() => app.isLoading = false)
      }
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
  	  border: dashed 5rpx #cccccc;
  	  padding: 30rpx;
  	  border-radius: 10rpx;
  	  margin: 20rpx;
  	  height: 270rpx;
  	  .coupon-image {
  		  float: left;
  		  margin-top: 10rpx;
  		  .image {
  			  width: 200rpx;
  			  height: 158rpx;
  			  border-radius: 8rpx;
  		  }
  		  width: 30%;
  	  }
  	  .coupon-title {
  		  float: left;
  		  margin-left: 30rpx;
  		  overflow: hidden;
  		  width: 65%;
  		  .name {
  			 font-weight: bold;
  		  }
  		  .price {
  			 margin-top: 20rpx;
  			 color: #f9211c;
  			 font-size: 25rpx;
  		  }
  		  .time {
  			 margin-top: 10rpx;
  			 font-size: 25rpx;
  			 color: #666666;
  		  }
  	  }
  }
  .coupon-qr{
	  border: dashed 5rpx #cccccc;
	  border-radius: 10rpx;
	  margin: 20rpx;
	  text-align: center;
	  padding-top: 80rpx;
	  padding-bottom: 30rpx;
	  .image{
		  width: 360rpx;
		  height: 360rpx;
		  margin: 0 auto;
	  }
	  .qr-code{
		  .code{
			  font-weight: bold;
			  font-size: 30rpx;
			  line-height: 50rpx;
		  }
		  .tips{
			  font-size: 25rpx;
			  color:#C0C4CC;
		  }
	  }
  }

  .coupon-content {
    padding: 15rpx;
    border: dashed 5rpx #cccccc;
    border-radius: 5rpx;
    margin: 20rpx;
    min-height: 400rpx;
	.title {
		margin-bottom: 15rpx;
	}
  }
</style>
