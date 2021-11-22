<template>
  <view class="container">
	  <block>
	      <Search :itemStyle="options.searchStyle" :params="options.searchParam" />
	  </block>
	  <block>
	      <Banner :itemStyle="options.bannerStyle" :params="options.bannerParam" :dataList="banner" />
	  </block>
	  <block>
	      <Blank :itemStyle="options.blankStyle" />
	  </block>
	  <block>
	      <NavBar :itemStyle="options.navStyle" :params="{}" :dataList="options.navBar" />
	  </block>
	  <block>
	      <Blank :itemStyle="options.blankStyle" />
	  </block>
	  <block>
	      <Goods :itemStyle="options.goodsStyle" :params="options.goodsParams" :dataList="goods" />
	  </block>
  </view>
</template>

<script>
  import { setCartTabBadge, showMessage } from '@/utils/app'
  import Search from '@/components/page/search'
  import Banner from '@/components/page/banner'
  import NavBar from '@/components/page/navBar'
  import Blank from '@/components/page/blank'
  import Goods from '@/components/page/goods'
  import * as Api from '@/api/page'

  const App = getApp()
  
  export default {
	components: {
	   Search,
	   Banner,
	   NavBar,
	   Blank,
	   Goods
	},
    data() {
      return {
        options: {
			"searchStyle": {
				"textAlign": "left",
				"searchStyle": "radius",
			},
			"searchParam": {
				"placeholder": "搜索关键字",
			},
			"blankStyle": {
				"height": "5",
				"background": "#ffffff",
			},
			"navBar": [{
						"imgUrl": "/static/nav/1.png",
						"imgName": "icon-1.png",
						"linkUrl": "pages\/pay\/index",
						"text": "买单支付",
						"tip": "支付攒积分",
						"color": "#666666"
					}, {
						"imgUrl": "/static/nav/3.png",
						"imgName": "icon-1.png",
						"linkUrl": "pages\/coupon\/list?type=C&needPoint=1",
						"text": "积分换券",
						"tip": "积分换好礼",
						"color": "#666666"
					}, {
						"imgUrl": "/static/nav/2.png",
						"imgName": "icon-1.png",
						"linkUrl": "pages\/coupon\/list?type=P",
						"text": "预存充值",
						"tip": "充值有优惠",
						"color": "#666666",
					}, {
						"imgUrl": "/static/nav/4.png",
						"imgName": "icon-1.png",
						"linkUrl": "pages\/coupon\/list?type=T",
						"text": "热门活动",
						"tip": "抽奖、集次等等",
						"color": "#666666"}],
			"goodsStyle": {
				"background": "#F6F6F6",
				"display": "list",
				"column": 1,
				"show": ["goodsName", "goodsPrice", "linePrice", "sellingPoint", "goodsSales"]
			},
			"goodsParams": {
				"source": "auto",
				"auto": {
					"category": 0,
					"goodsSort": "all",
					"showNum": 40
				}
			},
			"bannerStyle": {
				"btnColor": "#ffffff",
				"btnShape": "round",
			},
			"bannerParam": {
				"interval": 2800
			},
			"navStyle": {
				"background": "#ffffff",
				"rowsNum": "2",
			}
		},
        banner: [],
		goods: []
		}
	},

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {
      this.getPageData();
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
	  showMessage();
    },

    methods: {
		/**
		 * 加载页面数据
		 * @param {Object} callback
		 */
		getPageData(callback) {
		  const app = this
		  Api.home()
		    .then(result => {
		      app.banner = result.data.banner
			  app.goods = result.data.goods
		    })
		    .finally(() => callback && callback())
		},
		
		/**
		 * 下拉刷新
		 */
		onPullDownRefresh() {
		  // 获取数据
		  this.getPageData(() => {
		     uni.stopPullDownRefresh()
		  })
		}
    },

    /**
     * 分享当前页面
     */
    onShareAppMessage() {
      const app = this
      return {
         title: "FuInt会员系统",
         path: "/pages/index/index?" + app.$getShareUrlParams()
      }
    },

    /**
     * 分享到朋友圈
     * 本接口为 Beta 版本，暂只在 Android 平台支持，详见分享到朋友圈 (Beta)
     * https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/share-timeline.html
     */
    onShareTimeline() {
      const app = this
      const { page } = app
      return {
        title: page.params.share_title,
        path: "/pages/index/index?" + app.$getShareUrlParams()
      }
    }

  }
</script>

<style lang="scss" scoped>
  .container {
    background: #fff;
  }
</style>
