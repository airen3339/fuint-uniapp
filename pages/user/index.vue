<template>
  <view v-if="!isLoading" class="container">
    <!-- 页面头部 -->
    <view class="main-header" :style="{ paddingTop: $platform == 'H5' ? '0' : '50rpx' }">
      <image class="bg-image" src="/static/background/user-header.png" mode="scaleToFill"></image>
      <!-- 用户信息 -->
      <view v-if="isLogin" class="user-info">
		<!--头像-->
		<view class="user-avatar">
		  <image class="image" :src="userInfo.avatar ? userInfo.avatar : '/static/default-avatar.png'"></image>
		</view>
        <view class="user-content">
	      <!-- 会员昵称 -->
          <view class="nick-name">{{ userInfo.name }}</view>
          <!-- 会员等级 -->
          <view v-if="userInfo.gradeId > 0 && gradeInfo" class="user-grade">
            <view class="user-grade_icon">
              <image class="image" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAA0lBMVEUAAAD/tjL/tzH/uDP/uC7/tjH/tzH/tzL/tTH+tTL+tjP/tDD/tTD+tzD/tjL/szD/uDH/tjL/tjL+tjD/tjT/szb/tzL/tTL+uTH+tjL/tjL/tjL/tTT/tjL/tjL+tjH/uTL/vDD/tjL/tjH/tzL9uS//tTL/nBr/sS7/tjH/ujL/szD/uTv+rzf/tzL+tzH+vDP+uzL+tjP+ry7+tDL9ki/7szf/sEX/tTL/tjL+tjL/tTH/tTT/tzH/tzL/tjP/sTX/uTP/wzX+rTn/vDX9vC8m8ckhAAAAOXRSTlMAlnAMB/vjxKWGMh0S6drMiVxPRkEY9PLy0ru0sKagmo5+dGtgVCMgBP716eXWyMGxqJGRe2o5KSmFNjaYAAABP0lEQVQ4y8XS13KDMBAF0AWDDe4t7r3ETu9lVxJgJ/n/X8rKAzHG5TE+Twz3zki7I/g/KXdghIbGJewrU4yzn08Ebgl6TuZzzuOC6W5es3HX6qsSz3NFShRU0MpucytDmOSpu3yULx3CA9RD1HjVedc0jSjqm6ZzhUjDsFDQhSp/OKj5GQvg0+ZCOixsbtDLAeTTOm/yGi8GyIphIVsgH737FEDV44LJa88IRKK/SetrwT9G/GUIr6vXjoy4GXn7+RboVXnghuSjaoGecwQxL2su3CwAKlO+QFoqxI4FMctHQhQd2OhxTu184jWUlI+rMTBTn1/IQcJHQ6GQdZ7pWiDaNdhTt330efISeiqYwQEzQpTlsURJLhzkEmpCPsERfeIUVyXr6MNuIyp5uziW6xURtt7hhGwzmMNJExfO4Bd9X0ZPqAxdNwAAAABJRU5ErkJggg=="></image>
            </view>
            <view class="user-grade_name">
              <text>{{ gradeInfo.name }}</text>
            </view>
          </view>
          <!-- 会员无等级时显示手机号 -->
          <view v-else class="mobile">{{ userInfo.mobile }}</view>
		  <view class="active-time" v-if="gradeEndTime">{{ gradeEndTime }}</view>
        </view>
		<view class="amount-info">
			<view class="amount-tip">余额（元）</view>
			<view class="amount-num">{{ userInfo.balance.toFixed(2) }}</view>
		</view>
		<view class="pay-qr" @click="toPay">
			<view class="qrcode iconfont icon-qr-extract"></view>
			<view class="topay">付款</view>
		</view>
      </view>
	  <view v-if="isLogin" class="user-point" @click="onTargetPoints">
	    <text>积分 | {{ userInfo.point }}</text>
	  </view>
      <!-- 未登录 -->
      <view v-if="!isLogin" class="user-info" @click="handleLogin">
		<!--头像-->
		<view class="user-avatar">
		    <image class="image" src="/static/default-avatar.png"></image>
		</view>
        <view class="user-content">
          <view class="nick-name">未登录</view>
          <view class="login-tips">点击登录账号</view>
        </view>
      </view>
    </view>
	
	<!--会员升级 start-->
	<view class="member-update" v-if="memberGrade.length > 0">
		<view class="update-title">
			<text>会员升级</text>
		</view>
		<scroll-view scroll-x>
			<view class="recharge">
				<view class="recharge-item" :class="current == index ? 'recharge-item-active': ''" v-for="(item, index) in memberGrade" :key="index" :style="{marginLeft: !index ? '30rpx': ''}" @click="onShowPopup(index)">
					<view class="recharge-tag">
						<text class="recharge-tag-text" v-if="parseInt(item.validDay) > 0">{{ item.validDay }}天有效期</text>
						<text class="recharge-tag-text" v-else>永久有效期</text>
					</view>
					<text class="recharge-item-duration">{{ item.name }}</text>
					<view class="recharge-item-price">
						<text class="rmb">￥</text>
						<text class="recharge-item-price-text">{{ item.catchValue }}</text>
					</view>
					<text class="recharge-item-des" v-if="item.discount > 0">买单{{ item.discount }}折</text>
					<text class="recharge-item-des" v-if="item.speedPoint > 0">积分翻{{ item.speedPoint }}倍</text>
				</view>
			</view>
		</scroll-view>
	</view>
	<!-- 弹窗 -->
	<Popup v-if="!isLoading" v-model="showPopup" :memberGrade="curGrade"/>
	<!--会员升级 end-->

    <!-- 我的资产 -->
    <view class="my-asset">
      <view class="asset-left flex-box dis-flex flex-x-center">
        <view class="asset-left-item" @click="onTargetMyCoupon('C')">
          <view class="item-value dis-flex flex-x-center">
            <text>{{ isLogin ? assets.coupon : '0' }}</text>
          </view>
          <view class="item-name dis-flex flex-x-center">
            <text>优惠券</text>
          </view>
        </view>
        <view class="asset-left-item" @click="onTargetMyCoupon('P')">
          <view class="item-value dis-flex flex-x-center">
            <text>{{ isLogin ? assets.prestore : '0' }}</text>
          </view>
          <view class="item-name dis-flex flex-x-center">
            <text>预存卡</text>
          </view>
        </view>
        <view class="asset-left-item" @click="onTargetMyCoupon('T')">
          <view class="item-value dis-flex flex-x-center">
            <text>{{ isLogin ? assets.timer : '0' }}</text>
          </view>
          <view class="item-name dis-flex flex-x-center">
            <text>集次卡</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 订单操作 -->
    <view class="order-navbar">
      <view class="order-navbar-item" v-for="(item, index) in orderNavbar" :key="index" @click="onTargetOrder(item)">
        <view class="item-icon">
          <text class="iconfont" :class="[`icon-${item.icon}`]"></text>
        </view>
        <view class="item-name">{{ item.name }}</view>
        <text class="order-badge" v-if="item.count && item.count > 0">{{ item.count }}</text>
      </view>
    </view>

    <!-- 我的服务 -->
    <view class="my-service">
      <view class="service-title">我的服务</view>
      <view class="service-content clearfix">
        <block v-for="(item, index) in service" :key="index">
          <view v-if="item.type == 'link'" class="service-item" @click="handleService(item)">
            <view class="item-icon">
              <text class="iconfont" :class="[`icon-${item.icon}`]"></text>
            </view>
            <view class="item-name">{{ item.name }}</view>
          </view>
          <view v-if="item.type == 'button' && $platform == 'MP-WEIXIN'" class="service-item">
            <button class="btn-normal" :open-type="item.openType">
              <view class="item-icon">
                <text class="iconfont" :class="[`icon-${item.icon}`]"></text>
              </view>
              <view class="item-name">{{ item.name }}</view>
            </button>
          </view>
        </block>
		<block>
		  <view v-if="isMerchant == true" class="service-item" @click="handleService({'url': 'pages/merchant/index'})">
			<view class="item-icon">
			  <text class="iconfont icon-dianpu"></text>
			</view>
			<view class="item-name">商户管理</view>
		  </view>
		</block>
      </view>
    </view>
  </view>
</template>

<script>
  import SettingKeyEnum from '@/common/enum/setting/Key'
  import SettingModel from '@/common/model/Setting'
  import * as UserApi from '@/api/user'
  import * as OrderApi from '@/api/order'
  import { checkLogin, showMessage } from '@/utils/app'
  import Popup from './components/Popup'

  // 订单操作
  const orderNavbar = [
    { id: 'all', name: '全部订单', icon: 'qpdingdan' },
    { id: 'payment', name: '待支付', icon: 'daifukuan', count: 0 },
    { id: 'completed', name: '已完成', icon: 'daishouhuo', count: 0 },
  ]

  /**
   * 我的服务
   * id: 标识; name: 标题名称; icon: 图标; type 类型(link和button); url: 跳转的链接
   */
  const service = [
	{ id: 'myCoupon', name: '我的卡券', icon: 'youhuiquan', type: 'link', url: 'pages/my-coupon/index' },
    { id: 'coupon', name: '转赠记录', icon: 'lingquan', type: 'link', url: 'pages/give/index' },
	{ id: 'points', name: '我的积分', icon: 'jifen', type: 'link', url: 'pages/points/detail' },
    { id: 'help', name: '我的帮助', icon: 'bangzhu', type: 'link', url: 'pages/help/index' },
    { id: 'contact', name: '在线客服', icon: 'kefu', type: 'button', openType: 'contact' },
	{ id: 'address', name: '收货地址', icon: 'shouhuodizhi', type: 'link', url: 'pages/address/index' },
    { id: 'refund', name: '售后服务', icon: 'shouhou', type: 'link', url: 'pages/refund/index' },
	{ id: 'setting', name: '个人信息', icon: 'shezhi1', type: 'link', url: 'pages/user/setting' },
  ]

  export default {
	components: {
	  Popup
	},
    data() {
      return {
        // 枚举类
        SettingKeyEnum,
        // 当前运行的终端 (此处并不冗余,因为微信小程序端view层无法直接读取$platform)
        $platform: this.$platform,
        // 正在加载
        isLoading: true,
        // 是否已登录
        isLogin: false,
        // 系统设置
        setting: {},
        // 当前用户信息
        userInfo: {},
		gradeInfo: {},
		isMerchant: false,
		gradeEndTime: '',
        // 账户资产
        assets: { prestore: '0', timer: '0', coupon: '0' },
        // 我的服务
        service,
        // 订单操作
        orderNavbar,
        // 当前用户待处理的订单数量
        todoCounts: { payment: 0 },
		current: 0,
		// 显示、隐藏弹窗
		showPopup: false,
		memberGrade: [],
		curGrade: {}
      }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow(options) {
	  // 获取页面数据
	  this.getPageData()
      
	  // 判断是否已登录
	  this.isLogin = checkLogin()
	  
	  // 消息显示
	  showMessage();
    },

    methods: {
      // 获取页面数据
      getPageData(callback) {
        const app = this
        app.isLoading = true
        Promise.all([app.getSetting(), app.getUserInfo(), app.getUserAssets(), app.getTodoCounts()])
          .then(result => {
            app.isLoading = false
            // 初始化我的服务数据
            app.initService()
            // 初始化订单操作数据
            app.initOrderTabbar()
            // 执行回调函数
            callback && callback()
          })
          .catch(err => {
            console.log('catch', err)
          })
      },

      // 初始化我的服务数据
      initService() {
        const app = this
        const newService = []
        service.forEach(item => {
          if (item.id === 'points') {
            item.name = '我的积分'
          }
          newService.push(item)
        })
        app.service = newService
      },

      // 初始化订单操作数据
      initOrderTabbar() {
        const app = this
        const newOrderNavbar = []
        orderNavbar.forEach(item => {
          if (item.hasOwnProperty('count')) {
            item.count = app.isLogin ? app.todoCounts[item.id] : 0
          }
          newOrderNavbar.push(item)
        })
        app.orderNavbar = newOrderNavbar
      },

      // 获取设置
      getSetting() {
        const app = this
        app.setting = {}
      },

      // 获取当前用户信息
      getUserInfo() {
        const app = this
        return new Promise((resolve, reject) => {
            UserApi.info()
            .then(result => {
              app.userInfo = result.data.userInfo
			  
			  if (app.userInfo == null && app.isLogin) {
				  app.isLogin = false
			  }
			  
			  app.gradeInfo = result.data.gradeInfo
			  app.memberGrade = result.data.memberGrade
			  app.gradeEndTime = result.data.gradeEndTime
			  app.isMerchant = result.data.isMerchant
			  
              resolve(app.userInfo)
			  resolve(app.gradeInfo)
			  resolve(isMerchant)
            })
            .catch(err => {
              if (err.result && err.result.status == 401) {
                app.isLogin = false
                resolve(null)
              } else {
                reject(err)
              }
            })
        })
      },

      // 获取账户资产
      getUserAssets() {
        const app = this
        return new Promise((resolve, reject) => {
            UserApi.assets()
            .then(result => {
              app.assets = result.data.asset
              resolve(app.assets)
            })
            .catch(err => {
              if (err.result && err.result.status == 401) {
                app.isLogin = false
                resolve(null)
              } else {
                reject(err)
              }
            })
        })
      },

      // 获取当前用户待处理的事项数量
      getTodoCounts() {
        const app = this
        return new Promise((resolve, reject) => {
          !app.isLogin ? resolve(null) : OrderApi.todoCounts()
            .then(result => {
              app.todoCounts = result.data
              resolve(app.todoCounts)
            })
        })
      },
	  
	  // 会员等级
	  onShowPopup(index) {
		this.showPopup = !this.showPopup
		this.current = index
		this.curGrade = this.memberGrade[index]
	  },

      // 跳转到登录页
      handleLogin() {
        !this.isLogin && this.$navTo('pages/login/index')
      },
	  
	  // 跳转到支付页
	  toPay() {
	    this.$navTo('pages/pay/index')
	  },

      // 跳转到订单页
      onTargetOrder(item) {
        this.$navTo('pages/order/index', { dataType: item.id })
      },

      // 跳转到我的积分页面
      onTargetPoints() {
        this.$navTo('pages/points/detail')
      },

      // 跳转到我的优惠券页
      onTargetMyCoupon(type) {
        this.$navTo('pages/my-coupon/index?type='+type)
      },

      // 跳转到服务页面
      handleService({ url }) {
        this.$navTo(url)
      },
    },

    /**
     * 下拉刷新
     */
    onPullDownRefresh() {
      // 获取首页数据
      this.getPageData(() => {
        uni.stopPullDownRefresh()
      })
    }
  }
</script>

<style lang="scss" scoped>
  // 页面头部
  .main-header {
    background-color: #fff;
    position: relative;
    height: 380rpx;
    background-size: 100% 100%;
    overflow: hidden;
    display: flex;
    align-items: center;
    padding-left: 30rpx;
	margin:25rpx;
	border-radius: 10rpx;

    .bg-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
    }

    .user-info {
      display: flex;
      height: 200rpx;
      z-index: 1;
	  .user-avatar {
		  padding-top: 10rpx;
		  .image {
			  display: block;
			  width: 100rpx;
			  height: 100rpx;
			  border-radius: 50%;
	      }
	  }
	  
      .user-content {
        display: block;
        flex-direction: column;
        justify-content: center;
        margin-left: 20rpx;
        color: #ffffff;
        .nick-name {
          font-size: 32rpx;
          font-weight: bold;
        }

        .mobile {
          margin-top: 15rpx;
          font-size: 26rpx;
        }

        .user-grade {
          display: flex;
          align-items: center;
          background: #3c3c3c;
          margin-top: 12rpx;
          border-radius: 10rpx;
          padding: 4rpx 12rpx;

          .user-grade_icon .image {
            display: block;
            width: 32rpx;
            height: 32rpx;
          }

          .user-grade_name {
            margin-left: 5rpx;
            font-size: 24rpx;
            color: #EEE0C3;
          }
        }
		.active-time {
			margin-top: 3rpx;
		}

        .login-tips {
          margin-top: 12rpx;
          font-size: 28rpx;
        }
      }
	  .amount-info {
		  margin-top: 1rpx;
		  margin-left: 60rpx;
		  color: #fff;
		  display: block;
		  .amount-tip {
			  font-size: 24rpx;
		  }
		  .amount-num {
			  margin-top: 10rpx;
			  font-weight: bold;
			  font-size: 45rpx;
		  }
	  }
	  .pay-qr {
		  color:#ffffff;
		  margin-top: 25rpx;
		  margin-left: 50rpx;
		  text-align: center;
		  .qrcode {
			  display: block;
			  font-size: 40rpx;
		  }
		  .topay {
			  color:#ffffff;
			  font-weight: bold;
			  font-size: 25rpx;
			  text-align: center;
		  }
	  }
    }
    .user-point {
		z-index: 999;
		display: flex;
		font-size: 25rpx;
		position: absolute;
		bottom: 20px;
		left: 60rpx;
		color: #ffffff;
	}
  }

  // 我的资产
  .my-asset {
    display: flex;
    background: #fff;
	margin: 0 20rpx 0 20rpx;
    padding: 40rpx 0;

    .asset-right {
      width: 200rpx;
      border-left: 1rpx solid #eee;
    }
    .asset-left-item {
      text-align: center;
      color: #666;
      padding: 0 72rpx;
	  width: 33%;

      .item-value {
        font-size: 35rpx;
        color: red;
      }
	  
      .item-name {
        font-size: 25rpx;
		margin-top: 6rpx;
      }
    }

  }

  // 订单操作
  .order-navbar {
    display: flex;
    margin: 20rpx auto 20rpx auto;
    padding: 20rpx 0;
    width: 94%;
    box-shadow: 0 1rpx 5rpx 0px rgba(0, 0, 0, 0.05);
    font-size: 30rpx;
    border-radius: 5rpx;
    background: #fff;

    &-item {
      position: relative;
      width: 33%;

      .item-icon {
        text-align: center;
        margin: 0 auto;
        padding: 10rpx 0;
        color: #545454;
        font-size: 40rpx;
      }

      .item-name {
        font-size: 24rpx;
        color: #545454;
        text-align: center;
        margin-right: 10rpx;
      }

      .order-badge {
        position: absolute;
        top: 0;
        right: 55rpx;
        font-size: 22rpx;
        background: #fa2209;
        text-align: center;
        line-height: 28rpx;
        color: #fff;
        border-radius: 100%;
        min-height: 30rpx;
        min-width: 30rpx;
        padding: 1rpx;
      }
    }
  }

  // 我的服务
  .my-service {
    margin: 22rpx auto 22rpx auto;
    padding: 20rpx 0;
    width: 94%;
    box-shadow: 0 1rpx 5rpx 0px rgba(0, 0, 0, 0.05);
    border-radius: 5rpx;
    background: #fff;

    .service-title {
      padding-left: 20rpx;
      margin-bottom: 30rpx;
      font-size: 28rpx;
    }

    .service-content {

      // margin-bottom: -30rpx;
      .service-item {
        position: relative;
        width: 25%;
        float: left;
        margin-bottom: 30rpx;

        .item-icon {
          text-align: center;
          margin: 0 auto;
          padding: 10rpx 0;
          color: #ff3800;
          font-size: 40rpx;
        }

        .item-name {
          font-size: 24rpx;
          color: #545454;
          text-align: center;
          margin-right: 10rpx;
        }

      }
    }
  }
  
  // 会员升级
  .member-update {
	  margin: 22rpx auto 22rpx auto;
	  padding: 20rpx 0;
	  border-radius: 5rpx;
	  box-shadow: 0 1rpx 5rpx 0px rgba(0, 0, 0, 0.05);
	  background: #fff;
	  width: 94%;
	  text-align: center;
	  .update-title {
		padding-left: 20rpx;
		margin-bottom: 30rpx;
		font-size: 28rpx;
		text-align: left;
	  }
	  .recharge {
			position: relative;
			margin-bottom: 35rpx;
			display: flex;
			flex-direction: row;
			align-items: center;
			
			&-tag {
				position: absolute;
				top: -2rpx;
				left: -2rpx;
				width: 170rpx;
				height: 36rpx;
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: center;
				background-image: url('~@/static/user/tag.png');
				background-size: 100%;
				
				&-text {
					font-size: 20rpx;
					color: #FFFFFF;
					text-align: center;
				}
			}
			
			&-item {
				position: relative;
				padding: 40rpx 0;
				margin-left: 15rpx;
				width: 29.33%;
				height: 270rpx;
				flex-shrink: 0;
				display: flex;
				flex-direction: column;
				align-items: center;
				border: solid 1rpx #CBCCCE;
				border-radius: 12rpx;
				
				&-active {
					border: solid 2rpx #EDD2A9;
					background-color: #FBF1E5;
				}
				
				&-duration {
					margin-bottom: 30rpx;
					font-size: 26rpx;
					color: #1C1C1C;
				}
				
				&-price {
					margin-bottom: 20rpx;
					display: flex;
					flex-direction: row;
					align-items: baseline;
					
					&-text {
						font-size: 48rpx;
						color: #E3BE83;
					}
				}
				
				&-des {
					font-size: 22rpx;
					color: #A5A3A2;
				}
			}
		}
	}
</style>
