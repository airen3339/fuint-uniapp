import Enum from '../enum'

/**
 * 枚举类：订单状态
 * OrderStatusEnum
 */
export default new Enum([
  { key: 'CREATED', name: '待支付', value: 'A' },
  { key: 'PAID', name: '已支付', value: 'B' },
  { key: 'CANCEL', name: '已取消', value: 'C' },
  { key: 'DELETED', name: '已删除', value: 'D' }
])
