/**
 * SlotManager - 插槽管理器
 *
 * 用以处理 Section 中引入的 Header & Footer 带来的偏移计算
 */

export default class SlotManager {
  constructor () {
    this.slots = []
  }

  size () {
    return this.slots.length
  }

  getSlot (index) {
    return this.slots[index]
  }

  /**
   * 新增/更新插槽对象
   *
   * @param {*} index 新增/更新的插槽索引
   * @param {*} curSlot 插槽对象
   */
  insertSlot (index, curSlot) {
    const prevSlot = this.slots[index]

    this.slots[index] = {
      ...prevSlot, ...curSlot
    }
  }

  /**
   * 获取全部插槽累加尺寸
   */
  getTotalSlotSize () {
    return this.getAggregateSlotSizeToIndex(this.size())
  }

  /**
   * 返回到对应索引的所有插槽的累加尺寸
   *
   * @param {*} index 插槽索引
   */
  getAggregateSlotSizeToIndex (index) {
    if (index < 1 || this.size() === 0) {
      return 0
    }

    return this.slots.slice(0, index).reduce((agg, slot) => {
      return agg + (slot.header || 0) + (slot.footer || 0)
    }, 0)
  }

  /**
   * 返回从对应索引开始之后的所有插槽的累加尺寸
   *
   * @param {*} slotIndex 插槽索引
   * @param {*} itemIndex 元素索引
   */
  getRestSlotSizeToIndex (slotIndex, itemIndex) {
    const size = this.size()

    if (slotIndex === size || slotIndex < 0) {
      return 0
    }

    const aggregateSize = this.slots.slice(slotIndex, size).reduce((agg, slot) => {
      return agg + (slot.header || 0) + (slot.footer || 0)
    }, 0)

    const slot = this.slots[slotIndex]
    if (slot && itemIndex >= slot.start) {
      return aggregateSize - slot.header
    }

    return aggregateSize
  }

  /**
   * 返回根据元素索引寻找命中的插槽的所有
   *
   * @param {*} itemIndex 元素索引
   */
  findSlotIndexByItemIndex (itemIndex) {
    const size = this.size()

    if (size === 0 || itemIndex < 0 || itemIndex >= this.slots[size - 1].end) {
      return -1
    }
    return this.slots.findIndex(slot => {
      return itemIndex >= slot.start && itemIndex < slot.end
    })
  }
}
