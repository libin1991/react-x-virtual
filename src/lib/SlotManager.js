export default class SlotManager {
  constructor() {
    this.slots = []
  }

  size() {
    return this.slots.length
  }

  getSlot(index) {
    return this.slots[index]
  }

  insertSlot(index, curSlot) {
    const prevSlot = this.slots[index]

    this.slots[index] = {
      ...prevSlot, ...curSlot
    }
  }

  getTotalSlotSize() {
    return this.getAggregateSlotSizeToIndex(this.size())
  }

  getAggregateSlotSizeToIndex(index) {
    if (index < 1 || this.size() === 0) {
      return 0
    }

    return this.slots.slice(0, index).reduce((agg, slot) => {
      return agg + (slot.header || 0) + (slot.footer || 0)
    }, 0)
  }

  getRestSlotSizeToIndex(slotIndex, index) {
    const size = this.size()

    if (slotIndex === size || slotIndex < 0) {
      return 0
    }

    const aggregateSize = this.slots.slice(slotIndex, size).reduce((agg, slot) => {
      return agg + (slot.header || 0) + (slot.footer || 0)
    }, 0)

    const slot = this.slots[slotIndex]
    if (slot && index >= slot.start) {
      return aggregateSize - slot.header
    }

    return aggregateSize
  }

  findSlotIndexByItemIndex(index) {
    const size = this.size()

    if (size === 0 || index < 0 || index >= this.slots[size - 1].end) {
      return -1
    }
    return this.slots.findIndex(slot => {
      return index >= slot.start && index < slot.end
    })
  }
}
