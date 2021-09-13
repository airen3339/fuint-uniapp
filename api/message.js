import request from '@/utils/request'

// api地址
const api = {
  getOne: 'message/getOne',
  readed: 'message/readed'
}

// 读取最新的一条消息
export const getOne = (param, option) => {
  return request.get(api.getOne, param)
}

// 将消息置为已读
export const readed = (param) => {
  return request.get(api.readed, param)
}

