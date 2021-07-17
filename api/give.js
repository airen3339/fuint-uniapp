import request from '@/utils/request'

// api地址
const api = {
  doGive: 'give/doGive',
  giveLog: 'give/giveLog'
}

// 转赠
export const doGive = (data) => {
  return request.post(api.doGive, data)
}

// 转赠记录
export const giveLog = (param, option) => {
  return request.get(api.giveLog, param)
}
