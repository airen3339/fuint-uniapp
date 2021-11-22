import request from '@/utils/request'

// api地址
const api = {
  list: 'cart/list',
  save: 'cart/save',
}

// 购物车列表
export const list = (goodsId, skuId, buyNum) => {
  return request.post(api.list, { goodsId, skuId, buyNum })
}

// 更新购物车
export const save = (goodsId, action, skuId, buyNum) => {
  return request.post(api.save, { goodsId, action, skuId, buyNum })
}
