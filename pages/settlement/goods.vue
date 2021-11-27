<template>
  <view class="container p-bottom">
	<view class="flow-mode">
		<selectSwitch :switchList="orderModeList" checked_bj_color="#00acac" @change="switchMode"/> 
	</view>
	<!-- 快递配送：配送地址 -->
	<view @click="onSelectAddress" class="flow-delivery">
	  <view class="flow-delivery__detail dis-flex flex-y-center">
		<view class="detail-location dis-flex">
		  <text class="iconfont icon-dingwei"></text>
		</view>
		<view class="detail-content flex-box">
		  <block v-if="address.name">
			<view class="detail-content__title dis-flex">
			  <text class="f-30">{{ address.name }}</text>
			  <text class="detail-content__title-phone f-28">{{ address.mobile }}</text>
			</view>
			<view class="address detail-content__describe">
			  <text class="region">{{ address.provinceName }}{{ address.cityName }}{{ address.regionName }}</text>
			  <text class="detail">{{ address.detail }}</text>
			</view>
		  </block>
		  <block v-else>
			<view class="detail-content__describe dis-flex">
			  <text class="col-6">请选择配送地址</text>
			</view>
		  </block>
		</view>
		<view class="detail-arrow dis-flex">
		  <text class="iconfont icon-arrow-right"></text>
		</view>
	  </view>
	</view>
	
    <!-- 商品列表 -->
    <view class="m-top20">
      <view v-for="(item, index) in goodsCart" :key="index" class="checkout_list">
        <view class="flow-shopList dis-flex">
		  <!-- 商品图片 -->
		  <view class="flow-list-left">
			<image mode="scaleToFill" :src="item.goodsInfo.logo"></image>
		  </view>
          <view class="flow-list-right flex-box">
            <text class="goods-name twolist-hidden">{{ item.goodsInfo.name }}</text>
            <view class="flow-list-cont dis-flex flex-x-between flex-y-center">
              <text class="small"> x {{ item.num }} </text>
              <text class="flow-cont">￥{{ item.goodsInfo.price }} </text>
            </view>
          </view>
        </view>
      </view>
      <view class="flow-num-box b-f">
        <text>共{{ totalNum }}件，合计：</text>
        <text class="flow-money col-m">￥{{ totalPrice }}</text>
      </view>
    </view>

    <!-- 支付方式 -->
    <view class="pay-method flow-all-money b-f m-top20">
      <view class="flow-all-list dis-flex">
        <text class="flex-five">支付方式</text>
      </view>
      <!-- 微信支付 -->
      <view class="pay-item dis-flex flex-x-between" @click="handleSelectPayType(PayTypeEnum.WECHAT.value)">
        <view class="item-left dis-flex flex-y-center">
          <view class="item-left_icon wechat">
            <text class="iconfont icon-weixinzhifu"></text>
          </view>
          <view class="item-left_text">
            <text>{{ PayTypeEnum.WECHAT.name }}</text>
          </view>
        </view>
        <view class="item-right col-m" v-if="curPayType == PayTypeEnum.WECHAT.value">
          <text class="iconfont icon-duihao"></text>
        </view>
      </view>
    </view>

    <!-- 买家留言 -->
    <view class="flow-all-money b-f m-top20">
      <view class="ipt-wrapper dis-flex flow-all-list">
        <input v-model="remark" placeholder="选填：顾客留言（50字以内）"></input>
      </view>
    </view>

    <!-- 提交订单 -->
    <view class="flow-fixed-footer b-f m-top10">
      <view class="dis-flex chackout-box">
		<view class="chackout-left pl-12">
		  <view class="col-amount-do">应付金额：￥{{ totalPrice }}</view>
		  <view class="col-amount-view">总金额：￥{{ totalPrice }}</view>
		</view>
        <view class="chackout-right" @click="onSubmitOrder()">
          <view class="flow-btn f-32" :class="{ disabled }">提交订单</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import * as Verify from '@/utils/verify'
  import * as CartApi from '@/api/cart'
  import * as SettlementApi from '@/api/settlement'
  import DeliveryTypeEnum from '@/common/enum/order/DeliveryType'
  import PayTypeEnum from '@/common/enum/order/PayType'
  import { wxPayment } from '@/utils/app'
  import selectSwitch from "@/components/xuan-switch/xuan-switch.vue";
  import * as AddressApi from '@/api/address'

  export default {
	components: {
	  selectSwitch
	},
    data() {
      return {
        // 枚举类
        PayTypeEnum,
        // 当前页面参数
        options: {},
        // 当前选中的支付方式
        curPayType: PayTypeEnum.WECHAT.value,
        // 买家留言
        remark: '',
        // 禁用submit按钮
        disabled: false,
        // 按钮禁用
        disabled: false,
        goodsCart: [],
		totalPrice: 0,
		totalNum: 0,
		orderModeList: ['配送', '自取'],
		orderMode: true,
		address: null
      }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      this.options = options
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
		const app = this
		// 获取购物车信息
        app.getCartDetail(app.options.goodsId, app.options.skuId, app.options.buyNum)
		// 获取默认收货地址
		app.getDefaultAddress()
    },

    methods: {
      // 获取购物车信息
      getCartDetail(goodsId, skuId, buyNum) {
        const app = this
        return new Promise((resolve, reject) => {
          CartApi.list(goodsId, skuId, buyNum)
            .then(result => {
			  app.goodsCart = result.data.list
			  app.totalNum = result.data.totalNum
			  app.totalPrice = result.data.totalPrice
              resolve(result)
            })
            .catch(err => reject(err))
        })
      },
	  
	  // 获取默认收货地址
	  getDefaultAddress() {
	    const app = this
	    AddressApi.detail(0)
	      .then(result => {
	        app.address = result.data.address
	      })
	  },
	  
      // 选择支付方式
      handleSelectPayType(value) {
        this.curPayType = value
      },
	  
	  // 快递配送：选择收货地址
	  onSelectAddress() {
	     this.$navTo('pages/address/index', { from: 'checkout' })
	  },
	  
	  switchMode(mode) {
	     this.orderMode = mode
	  },

      // 订单提交
      onSubmitOrder() {
        const app = this
        if (app.disabled) {
          return false
        }
		
        // 表单验证
        if (app.orderMode && app.address == undefined) {
		  app.$toast('请先选择配送地址哦')
          return false
        }
		
		// 配送或自取
		let orderMode = "express";
		if (!app.orderMode) {
			orderMode = "oneself";
		}
		
        // 按钮禁用
        app.disabled = true
		
        // 请求api
        SettlementApi.submit(0, "", "goods", app.remark, 0, 0, app.options.goodsId, app.options.skuId, app.options.buyNum, orderMode)
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
        // 发起微信支付
        if (result.data.payType == PayTypeEnum.WECHAT.value) {
          wxPayment(result.data.payment)
            .then(() => app.$success('支付成功'))
            .catch(err => app.$error('支付失败'))
            .finally(() => {
              app.disabled = false
              app.navToMyOrder(result.data.orderInfo.id)
            })
        }
		
		// 余额支付
        if (result.data.payType == PayTypeEnum.BALANCE.value) {
          app.disabled = false
          app.navToMyOrder(result.data.orderInfo.id)
        }
      },

      // 跳转到我的订单(等待1秒)
      navToMyOrder(orderId) {
        setTimeout(() => {
          this.$navTo('pages/order/detail?orderId='+orderId)
        }, 1000)
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "./style.scss";
</style>
