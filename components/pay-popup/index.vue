<template>
  <view class="pay-popup popup" catchtouchmove="true" :class="(value && complete) ? 'show' : 'none'"
    @touchmove.stop.prevent="moveHandle">
    <!-- 页面内容开始 -->
    <view class="mask" @click="close('mask')"></view>
    <!-- 页面开始 -->
    <view class="layer attr-content" :style="'border-radius: 10rpx 10rpx 0 0;'">
      <view class="specification-wrapper">
        <scroll-view class="specification-wrapper-content" scroll-y="true">
          <view class="specification-header">
            <view class="specification-name">支付确认</view>
          </view>
          <view class="specification-content">
            <view v-if="payInfo.usePoint > 0" class="pay-item">
                <view class="item-point">
					<view class="title">使用<text class="point-amount">{{ payInfo.usePoint }}</text>积分抵扣
					   <text class="amount">￥{{ payInfo.pointAmount }}</text>
					   <text class="modify" @click="modifyPoint">修改>></text>
					</view>
				</view>
            </view>
			<view class="pay-item">
			    <view class="item-amount">
					<view class="title">实付金额：￥<text class="amount">{{ payInfo.payAmount }}</text></view>
				</view>
			</view>
          </view>
        </scroll-view>
        <view class="close" @click="close('close')" v-if="showClose">
          <image class="close-item" :src="closeImage"></image>
        </view>
      </view>
      <view class="btn-wrapper">
        <view class="sure" @click="payNow">确认支付</view>
      </view>
      <!-- 页面结束 -->
    </view>
	<view class="point-popup">
	   <uni-popup ref="pointPopup" type="dialog">
		  <uni-popup-dialog mode="input" focus="false" v-model="payInfo.usePoint" title="修改积分"  type="info" placeholder="请输入积分数量" :before-close="true" @close="cancelUsePoint" @confirm="doUsePoint"></uni-popup-dialog>
	   </uni-popup>
	</view>
    <!-- 页面内容结束 -->
  </view>
</template>

<script>
  import * as SettlementApi from '@/api/settlement'
  import PayTypeEnum from '@/common/enum/order/PayType'
  import { wxPayment } from '@/utils/app'
  
  var that; // 当前页面对象
  var vk; // 自定义函数集
  export default {
    name: 'PayPopup',
    props: {
      // true 组件显示 false 组件隐藏
      value: {
        Type: Boolean,
        default: false
      },
      // vk云函数路由模式参数开始-----------------------------------------------------------
      // 支付信息
      payInfo: {
        Type: Object,
        default: {}
      },
      // vk云函数路由模式参数结束-----------------------------------------------------------
      // 点击遮罩是否关闭组件 true 关闭 false 不关闭 默认true
      maskCloseAble: {
        Type: Boolean,
        default: true
      },
      // 是否显示右上角关闭按钮
      showClose: {
        Type: Boolean,
        default: true
      },
      // 关闭按钮的图片地址
      closeImage: {
        Type: String,
        default: "https://img.alicdn.com/imgextra/i1/121022687/O1CN01ImN0O11VigqwzpLiK_!!121022687.png"
      }
    },
    data() {
      return {
        complete: false, // 组件是否加载完成
        isShow: false, // true 显示 false 隐藏
		usePoint: ''
      };
    },
    mounted() {
      that = this;
    },
    methods: {
      // 初始化
      init() {
         //empty
      },
	  async open() {
	    that.complete = true;
	    that.$emit("open", true);
	    that.$emit("input", true);
	  },
      // 监听 - 弹出层收起
      close(s) {
        if (s == "close") {
          that.$emit("input", false);
          that.$emit("close", "close");
        } else if (s == "mask") {
          if (that.maskCloseAble) {
            that.$emit("input", false);
            that.$emit("close", "mask");
          }
        }
      },
	  
      moveHandle() {
        //禁止父元素滑动
      },
	  
      // 立即支付
      payNow() {
		const app = this
		// 请求api
		SettlementApi.submit(0, "", "payment", app.payInfo.remark, app.payInfo.payAmount, app.payInfo.usePoint, 0, 0, 0, "")
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
	  			app.$navTo(`pages/pay/result`, { amount: parseFloat(app.payInfo.payAmount).toFixed(2), point: parseInt(app.payInfo.usePoint)})
	  		})
	        .catch(err => 
			app.$error('支付失败'))
	        .finally(() => {
	          //empty
	        })
	    }
	  	
	  	// 余额支付
	    if (result.data.payType == PayTypeEnum.BALANCE.value) {
	        app.$navTo(`pages/pay/result`, { amount: parseFloat(app.payInfo.payAmount).toFixed(2), point: parseInt(app.payInfo.usePoint)})
	    }
	  },
	  modifyPoint() {
		this.$refs.pointPopup.open('top')
	  },
	  doUsePoint(usePoint) {
		if (!(/(^[0-9]\d*$)/.test(usePoint))) {
			this.$error('请输入正整数')
		　　return false
		}
		
		if (usePoint > this.payInfo.maxPoint) {
			this.$error('最多使用' + this.payInfo.maxPoint + '积分')
			return false
		}
		
		this.$emit('modifyUsePoint', usePoint)
	  	this.$refs.pointPopup.close()
	  },
	  cancelUsePoint() {
	  	this.$refs.pointPopup.close()
	  },
      // 弹窗
      toast(title, icon) {
        uni.showToast({
          title: title,
          icon: icon
        });
      }
    },
    watch: {
      value: function(val) {
        if (val) {
          that.open();
        }
      },
    }
  };
</script>

<style lang="scss" scoped>
  .pay-popup {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 21;
    overflow: hidden;

    &.show {
      display: block;

      .mask {
        animation: showPopup 0.2s linear both;
      }

      .layer {
        animation: showLayer 0.2s linear both;
      }
    }

    &.hide {
      .mask {
        animation: hidePopup 0.2s linear both;
      }

      .layer {
        animation: hideLayer 0.2s linear both;
      }
    }

    &.none {
      display: none;
    }

    .mask {
      position: fixed;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      background-color: rgba(0, 0, 0, 0.65);
    }

    .layer {
      display: flex;
      width: 100%;
      flex-direction: column;
      position: fixed;
      z-index: 99;
      bottom: 0;
      border-radius: 10rpx 10rpx 0 0;
      background-color: #fff;

      .specification-wrapper {
        width: 100%;
        padding: 30rpx 25rpx;
        box-sizing: border-box;
		background: #ffffff;

        .specification-wrapper-content {
          width: 100%;
          max-height: 900rpx;
          min-height: 300rpx;

          &::-webkit-scrollbar {
            /*隐藏滚轮*/
            display: none;
          }

          .specification-header {
            width: 100%;
            display: flex;
            flex-direction: row;
            position: relative;
            margin-bottom: 40rpx;
			text-align: center;
			.specification-name {
				font-weight: bold;
				width: 100%;
				font-size: 30rpx;
				padding: 10rpx;
			}
          }

          .specification-content {
			text-align: center;
			.pay-item {
				padding: 30rpx;
				cursor: pointer;
				margin-bottom: 10rpx;
				border: solid 1rpx #cccccc;
				border-radius: 5rpx;
				.item-point {
					.amount {
						font-weight: bold;
					}
					.modify {
						margin-left: 30rpx;
						color: #0090FF;
					}
				}
				.item-amount {
					font-size: 30rpx;
					.amount {
						color: #f9211c;
						font-size: 35rpx;
						font-weight: bold;
					}
				}
			}
          }
        }

        .close {
          position: absolute;
          top: 30rpx;
          right: 25rpx;
          width: 50rpx;
          height: 50rpx;
          text-align: center;
          line-height: 50rpx;

          .close-item {
            width: 40rpx;
            height: 40rpx;
          }
        }
      }

      .btn-wrapper {
        display: flex;
        width: 100%;
        height: 120rpx;
        flex: 0 0 120rpx;
        align-items: center;
        justify-content: space-between;
        padding: 0 26rpx;
        box-sizing: border-box;

        .layer-btn {
          width: 335rpx;
          height: 76rpx;
          border-radius: 38rpx;
          color: #fff;
          line-height: 76rpx;
          text-align: center;
          font-weight: 500;
          font-size: 28rpx;

          &.add-cart {
            background: #ffbe46;
          }

          &.buy {
            background: #fe560a;
          }
        }

        .sure {
          width: 698rpx;
          height: 80rpx;
          border-radius: 38rpx;
          color: #fff;
          line-height: 80rpx;
          text-align: center;
          font-weight: 500;
          font-size: 28rpx;
		  background:linear-gradient(to right, #f9211c, #ff6335)
        }

        .sure.add-cart {
          background: #ff9402;
        }
      }
    }

    @keyframes showPopup {
      0% {
        opacity: 0;
      }

      100% {
        opacity: 1;
      }
    }

    @keyframes hidePopup {
      0% {
        opacity: 1;
      }

      100% {
        opacity: 0;
      }
    }

    @keyframes showLayer {
      0% {
        transform: translateY(120%);
      }

      100% {
        transform: translateY(0%);
      }
    }

    @keyframes hideLayer {
      0% {
        transform: translateY(0);
      }

      100% {
        transform: translateY(120%);
      }
    }
  }
</style>
