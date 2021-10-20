<template>
  <view class="container">
    <!-- 搜索框 -->
    <search tips="搜索商品" @event="$navTo('pages/search/index')" />

    <!-- 分类样式：一级分类(大图) 10 -->
    <view class="cate-content" v-if="templet.style == 10 && list.length > 0">
      <view class="cate-wrapper cate_style__10">
        <scroll-view :scroll-y="true" :style="{ height: `${scrollHeight - 10}px` }">
          <view class="cate-item" v-for="(item, index) in list" :key="index" @click="onTargetGoodsList(item.category_id)">
            <image mode="widthFix" :src="item.logo"></image>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 分类样式：二级分类 20 -->
    <view class="cate-content dis-flex" v-else-if="templet.style == 20 && list.length > 0">
	
      <!-- 左侧 一级分类 -->
      <scroll-view class="cate-left f-28" :scroll-y="true" :style="{ height: `${scrollHeight}px` }">
		  <view v-for="(item, index) in list" :key="index">
			  <text class="cart-badge" v-if="item.total">{{ item.total }}</text>
			  <text class="type-nav" :class="{ selected: curIndex == index }" @click="handleSelectNav(index)">{{ item.name }}</text>
		  </view>
      </scroll-view>

      <!-- 右侧 二级分类 -->
      <scroll-view class="cate-right b-f" :scroll-top="scrollTop" :scroll-y="true" :style="{ height: `${scrollHeight}px` }">
        <view v-if="list[curIndex]">
          <view class="cate-right-cont">
            <view class="cate-two-box">
              <view class="cate-cont-box">
                <view class="flex-five item" v-for="(item, idx) in list[curIndex].goodsList" :key="idx">
                  <view class="cate-img">
                    <image v-if="item.logo" :src="item.logo"></image>
                  </view>
				  <view class="cate-info">
                    <text class="name text">{{ item.name }}</text>
				    <text class="stock text">库存:{{ item.stock }} 已售:{{ item.initSale }}</text>
				    <view class="action">
						<text class="price">￥{{ item.price }}</text>
						<view class="cart">
						    <view class="ii do-minus" v-if="item.buyNum" @click="onSaveCart(item.id, '-')"></view>
							<view class="ii num" v-if="item.buyNum">{{ (item.buyNum != undefined) ? item.buyNum : 0 }}</view>
							<view class="ii do-add" v-if="item.stock > 0" @click="onSaveCart(item.id, '+')"></view>
						</view>
					</view>
				  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
	
	<view class="flow-fixed-footer b-f m-top10">
	  <view class="dis-flex chackout-box">
	    <view class="chackout-left pl-12">
	      <view class="col-amount-do">总金额：￥{{ totalPrice }}</view>
		  <view class="col-amount-view">共计：{{ totalNum }} 件</view>
	    </view>
	    <view class="chackout-right" @click="doSubmit()">
	      <view class="flow-btn f-32">选好了</view>
	    </view>
	  </view>
	</view>
	
    <empty v-if="!list.length" :isLoading="isLoading" />
  </view>
</template>

<script>
  import { setCartTabBadge } from '@/utils/app'
  import * as SettlementApi from '@/api/settlement'
  import * as CartApi from '@/api/cart'
  import * as GoodsApi from '@/api/goods'
  import Search from '@/components/search'
  import Empty from '@/components/empty'

  const App = getApp()

  export default {
    components: {
      Search,
      Empty
    },
    data() {
      return {
		goodsCart: [],
		totalNum: 0,
		totalPrice: 0.00,
        // 列表高度
        scrollHeight: 500,
        // 一级分类：指针
        curIndex: 0,
        // 内容区竖向滚动条位置
        scrollTop: 0,
        // 分类列表
        list: [],
        // 分类模板设置
        templet: {'style': 20},
        // 正在加载中
        isLoading: true
      }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {
      const app = this
      // 设置分类列表高度
      app.setListHeight()
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
      const app = this
      // 获取页面数据
      app.getPageData()
      // 更新购物车角标
      setCartTabBadge()
    },

    methods: {

      /**
       * 获取页面数据
	   * 
       */
      getPageData() {
        const app = this
        app.isLoading = true
        Promise.all([
            // 获取分类列表
            GoodsApi.cateList(),
			// 获取购物车列表
			CartApi.list()
          ])
          .then(result => {
            // 初始化分类列表数据
            app.list = result[0].data
			app.totalNum = result[1].data.totalNum
			app.goodsCart = result[1].data.list
          })
          .finally(() => {
			  app.isLoading = false
			  app.totalPrice = 0
			  app.list.forEach(function(item, index) {
				  let total = 0
				  item.goodsList.forEach(function(goods, key) {
					  app.goodsCart.forEach(function(cart){
						 if (goods.id == cart.goodsId) {
							app.$set(app.list[index].goodsList[key], 'buyNum', cart.num)
							total = total + cart.num
							app.totalPrice = app.totalPrice + (goods.price * cart.num)
						 } 
					  })
				  })
				  app.$set(app.list[index], 'total', total)
			  })
		  })
      },

      /**
       * 设置分类列表高度
       */
      setListHeight() {
        const app = this
        uni.getSystemInfo({
          success(res) {
            app.scrollHeight = res.windowHeight - 47
          }
        })
      },

      // 一级分类：选中分类
      handleSelectNav(index) {
        const app = this
        app.curIndex = index
        app.scrollTop = 0
      },
	  
	  // 更新购物车
	  onSaveCart(goodsId, action) {
	    const app = this
		console.log(goodsId + action)
		CartApi.save(goodsId, action)
		  .then(result => {
			  app.getPageData()
		  })
	  },
	  
	  // 结算
	  doSubmit() {
		  if (this.totalPrice > 0) {
		     this.$navTo('pages/settlement/goods', { couponId: 0, selectNum: '' })
		  } else {
			 this.$error("请先选择商品")
		  }
	  }
    },

    /**
     * 设置分享内容
     */
    onShareAppMessage() {
      const app = this
      return {
        title: _this.templet.shareTitle,
        path: '/pages/category/index?' + app.$getShareUrlParams()
      }
    },

    /**
     * 分享到朋友圈
     * 本接口为 Beta 版本，暂只在 Android 平台支持，详见分享到朋友圈 (Beta)
     * https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/share-timeline.html
     */
    onShareTimeline() {
      const app = this
      return {
        title: _this.templet.shareTitle,
        path: '/pages/category/index?' + app.$getShareUrlParams()
      }
    }

  }
</script>

<style>
  page {
    background: #fff;
  }
</style>
<style lang="scss" scoped>
  .cate-content {
    background: #fff;
  }

  .cate-wrapper {
    padding: 0 20rpx 20rpx 20rpx;
    box-sizing: border-box;
  }

  /* 一级分类(大图) 10 */
  .cate_style__10 .cate-item {
    margin-bottom: 18rpx;
  }

  .cate_style__10 .cate-item:last-child {
    margin-bottom: 0;
  }

  .cate_style__10 .cate-item image {
    display: block;
    width: 100%;
    height: auto;
  }

  /* 一级分类(小图) 11 */
  .cate_style__11 .cate-item {
    float: left;
    padding: 25rpx;
    width: 33.3333%;
    text-align: center;
    box-sizing: border-box;
  }

  .cate_style__11 .cate-item image {
    /* height: 208.656rpx; */
    width: 100%;
    display: block;
  }

  .cate_style__11 .cate-item image {
    display: block;
    width: 100%;
    margin-bottom: 10rpx;
  }

  .cate_style__11 .cate-item text {
    display: block;
    color: #555;
  }

  /* 二级分类 20 */
  .cate-content {
    width: 100%;
  }

  .cate-left {
    flex-direction: column;
    display: flex;
    width: 200rpx;
    color: #444;
    height: 100%;
    background: #f8f8f8;
	.cart-badge {
	  position: absolute;
	  right: 1rpx;
	  margin-top: 10rpx;
	  margin-right: 5rpx;
	  font-size: 18rpx;
	  background: red;
	  z-index: 999999;
	  text-align: center;
	  line-height: 28rpx;
	  color: #ffffff;
	  border-radius: 100%;
	  min-height: 30rpx;
	  min-width: 30rpx;
	  padding: 1rpx;
	}
  }

  .cate-right {
    display: flex;
    flex-direction: column;
    width: 550rpx;
    height: 100%;
    overflow: hidden;
  }

  .cate-right-cont {
    width: 100%;
    display: flex;
    flex-flow: row wrap;
    align-content: flex-start;
    padding-top: 26rpx;
  }

  .type-nav {
    position: relative;
    height: 90rpx;
    line-height: 90rpx;
    text-align: center;
    z-index: 10;
    display: block;
    font-size: 26rpx;
  }

  .type-nav.selected {
    color: #666666;
	background: #ffffff;
    border-right: none;
	border-left: solid 8rpx red;
	font-weight: 555;
    font-size: 28rpx;
  }

  .cate-cont-box {
    margin-bottom: 30rpx;
    padding-bottom: 10rpx;
    background: #FFFFFF;
    overflow: hidden;
	.item {
		height: 200rpx;
		clear: both;
	}
  }

  .cate-cont-box .cate-img {
    padding: 13rpx 10rpx 4rpx 10rpx;
  }

  .cate-cont-box .cate-img image {
    width: 160rpx;
    height: 150rpx;
	float: left;
    border-radius: 5rpx;
  }

  .cate-cont-box .cate-info {
    text-align: left;
    display: block;
    font-size: 26rpx;
	margin-left: 168rpx;
    padding-bottom: 14rpx;
    color: #444;
    padding: 0 15rpx 30rpx 15rpx;
	.text {
		display: block;
		float: left;
		width: 100%;
	}
	.name {
		font-weight: bold;
		width: 100%;
		font-size: 26rpx;
	}
	.stock {
		margin-top: 30rpx;
		color: #999;
	}
	.action {
		.price {
			margin-top: 20rpx;
			color: red;
			float: left;
		}
		.cart {
			margin-top: 20rpx;
			float: right;
			font-size: 30rpx;
			height: 60rpx;
			.ii {
				float: left;
				text-align: center;
				width: 60rpx;
				cursor: pointer;
			}
			.do-add {
				background: url('~@/static/icon/add.png') no-repeat;
				background-size: 100% 100%;
				width: 45rpx;
				height: 45rpx;
			}
			.do-minus {
				background-image: url('~@/static/icon/minus.png');
				background-size: 100% 100%;
				width: 45rpx;
				height: 45rpx;
			}
		}
	}
  }
  .cate-two-box {
    width: 100%;
    padding: 0 10px;
  }
  
  // 底部操作栏
  .flow-fixed-footer {
    position: fixed;
    bottom: var(--window-bottom);
    width: 100%;
    background: #fff;
    border-top: 1px solid #eee;
    z-index: 11;
    
    .chackout-left {
      font-size: 28rpx;
      height: 98rpx;
      color: #777;
      flex: 4;
      padding-left: 12px;
  	  text-align: right;
  	  padding-right: 40rpx;
  	  .col-amount-do {
  		font-size:35rpx;
  		color:red;
  		margin-top: 5rpx;
  		margin-bottom:5rpx;
  	  }
    }
    
    .chackout-right {
      font-size: 34rpx;
      flex: 2;
    }
    
    // 提交按钮
    .flow-btn {
      background: linear-gradient(to right, #f9211c, #ff6335);
      color: #fff;
      text-align: center;
      line-height: 92rpx;
      display: block;
      font-size: 28rpx;
       // 禁用按钮
       &.disabled {
         background: #ff9779;
       }
    }
  }
</style>
