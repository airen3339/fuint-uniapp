import request from '@/utils/request'

// api地址
const api = {
  cateList: 'goodsApi/cateList',
  list: 'goodsApi/list',
  detail: 'goodsApi/detail'
}

// 商品分类列表
export const cateList = param => {
  return request.get(api.cateList, param)
}

// 商品列表
export const list = param => {
  return request.get(api.list, param)
}

// 商品详情
export const detail = goodsId => {
  return;
  return request.get(api.detail, { goodsId })
}
