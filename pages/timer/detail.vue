<template>
  <view v-if="!isLoading" class="container b-f p-b">
    <view class="base">
		 <view class="coupon-image">
			<image class="image" :src="detail.image"></image>
		 </view>
		<view class="coupon-title">
		  <text class="name f-32">{{ detail.name }}</text>
		  <view class="time">有效期：{{ detail.effectiveDate }}</view>
		</view>
	</view>
	<view class="coupon-timer">
	  <view class="tips">完成情况({{detail.confirmCount}}/{{detail.useRule}})</view>
	  <uni-row class="time-row" v-for="row in dataList">
	  	<uni-col :span="rowCount" v-for="item in row.data" class="time-item">
	  		<view v-if="item.isActive == true" class="time active"></view>
	  		<view v-else class="time"></view>
	  	</uni-col>
	  </uni-row>
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
    <shortcut />
  </view>
</template>

<script>
  import jyfParser from '@/components/jyf-parser/jyf-parser'
  import Shortcut from '@/components/shortcut'
  import Row from '@/components/oveui-layout/row/row.vue';
  import oCol from '@/components/oveui-layout/o-col/o-col.vue';
  import * as myCouponApi from '@/api/myCoupon'

  export default {
    components: {
      Shortcut,
	  Row,
	  oCol
    },
    data() {
      return {
        // 当前会员卡券ID
        userCouponId: null,
        // 加载中
        isLoading: true,
        // 当前卡券详情
        detail: null,
		rowCount: 0,
		dataList: []
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
        app.isLoading = false
        myCouponApi.detail(app.userCouponId)
          .then(result => {
            app.detail = result.data
			app.getRowCount(app.detail.useRule)
			app.getDataList(app.detail.useRule, app.detail.confirmCount)
          })
          .finally(() => app.isLoading = false)
      },
	  // 组织数据
	  getDataList(num, use) {
		  const app = this
		  if (num <= 4 && num > 0) {
			  app.dataList = [{"data": []}]
			  for (let i = 1; i <= num; i++) {
				  app.dataList[0].data.push({"isActive": (i <= use ? true : false)})
			  }
		  } else {
			  let rowCount = Math.ceil(num / 4)
			  let c = 1;
			  for (let i = 0; i < rowCount; i++) {
				  app.dataList[i] = {"data": []}
				  for (let j = 1; j <= 4; j++) {
					  if (c <= num) {
			  		     app.dataList[i].data.push({"isActive": (c <= use ? true : false)})
					     c++
					}
				  }
			  }
		  }
	  },
	  // 计算行数
      getRowCount(num) {
		 if (num < 4 && num > 0) {
			 this.rowCount = 24 / num
		 } else if (num >= 4) {
			 this.rowCount = 6
		 }
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
  		  .tips {
  			 margin-top:20rpx;
  			 font-size: 25rpx;
  		  }
  		  .time {
  			 margin-top: 20rpx;
  			 font-size: 25rpx;
  			 color: #666666;
  		  }
  	  }
  }
  .coupon-timer {
	  border: dashed 5rpx #cccccc;
	  margin-top:20rpx;
	  padding: 15px 30rpx 5rpx 30rpx;
	  border-radius: 10rpx;
	  margin: 20rpx;
	  overflow: hidden;
	  .tips{
		  margin-bottom: 20rpx;
	  }
	  .time-row {
	  	  margin-bottom: 10rpx;
	  	  height: 100rpx;
	  	  display: flex;
	  }
	 .time-item {
		  padding-top: 10rpx;
		  text-align: center;
		  align-items: center;
		  justify-content: center;
	 }
	 .time {
		  height: 80rpx;
		  margin-bottom: 30rpx;
		  text-align: center;
		  padding-top: 20rpx;
		  border-radius: 40rpx;
		  color: #ffffff;
		  font-weight: bold;
		  background: url('/static/confirm/undo.png') no-repeat center center;
		  background-size: contain;
	 }
	 .active {
		background: url('/static/confirm/do.png') no-repeat center center;
		background-size: contain;
		border: solid 1px #ffffff;
	 }
	  min-height: 160rpx;
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
    font-size: 28rpx;
	padding: 15rpx;
	border: dashed 5rpx #cccccc;
	border-radius: 5rpx;
	margin: 20rpx;
	min-height: 400rpx;
  }
</style>
