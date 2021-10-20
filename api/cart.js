import request from '@/utils/request'

// api地址
const api = {
  list: 'cart/list',
  save: 'cart/save',
}

// 购物车列表
export const list = () => {
  return request.get(api.list, {}, { load: false })
}

// 更新购物车
export const save = (goodsId, action) => {
  return request.post(api.save, { goodsId, action })
}
