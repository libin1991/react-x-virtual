/**
 * SizeAndPositionManager - 尺寸位置管理器
 *
 * 用以管理所有子项元素的尺寸、位置信息计算，解耦与视图之间的逻辑关联
 */
import SlotManager from './SlotManager'
import { ALIGNMENT } from './constants'

export default class SizeAndPositionManager {
  constructor ({ itemCount, itemSizeGetter, estimatedItemSize }) {
    this.itemSizeGetter = itemSizeGetter
    this.itemCount = itemCount
    this.estimatedItemSize = estimatedItemSize

    // 建立以元素索引的哈希表，用以缓存列表子元素的尺寸和位置信息
    this.itemSizeAndPositionData = {}

    // 记录已经测算尺寸的最近索引
    // 在此索引之前的元素的测算信息可以信赖，在此索引之后的元素尺寸信息为预估信息
    this.lastMeasuredIndex = -1

    // 处理插槽（e.g. Header & Footer）信息的管理者对象
    this.slotManager = new SlotManager()
  }

  getTotalItemCount () {
    return this.itemCount
  }

  setTotalItemCount (totalItemCount) {
    this.itemCount = totalItemCount
  }

  updateConfig ({ itemCount, itemSizeGetter, estimatedItemSize }) {
    if (itemCount != null) {
      this.itemCount = itemCount
    }
    if (itemSizeGetter != null) {
      this.itemSizeGetter = itemSizeGetter
    }
    if (estimatedItemSize != null) {
      this.estimatedItemSize = estimatedItemSize
    }
  }

  getLastMeasuredIndex () {
    return this.lastMeasuredIndex
  }

  /**
   * 在运行时中从缓存的已计算索引位置开始遍历计算，直到匹配对应的索引
   * 返回计算得出的对应元素尺寸、偏移位置
   */
  getSizeAndPositionForIndex (index) {
    if (index < 0 || index >= this.itemCount) {
      throw Error(
        `Requested index ${index} is outside of range 0..${this.itemCount}`
      )
    }

    if (index > this.lastMeasuredIndex) {
      const lastMeasuredSizeAndPosition = this.getSizeAndPositionOfLastMeasuredItem()
      const slotIndex = this.slotManager.findSlotIndexByItemIndex(index)

      let offset = lastMeasuredSizeAndPosition.offset + lastMeasuredSizeAndPosition.size

      for (let i = this.lastMeasuredIndex + 1; i <= index; i++) {
        const size = this.itemSizeGetter(i)

        if (size == null || isNaN(size)) {
          throw Error(`Invalid size returned for index ${i} of value ${size}`)
        }

        if (slotIndex >= 0) {
          const currentSlot = this.slotManager.getSlot(slotIndex)
          const prevSlot = this.slotManager.getSlot(slotIndex - 1)

          if (i === currentSlot.start) {
            offset += currentSlot.header
            if (prevSlot && i === prevSlot.end) {
              offset += prevSlot.footer
            }
          }
        }

        this.itemSizeAndPositionData[i] = { offset, size }
        offset += size
      }

      this.lastMeasuredIndex = index
    }

    return this.itemSizeAndPositionData[index]
  }

  getSizeAndPositionOfLastMeasuredItem () {
    if (this.lastMeasuredIndex >= 0) {
      return this.itemSizeAndPositionData[this.lastMeasuredIndex]
    } else {
      return { offset: 0, size: 0 }
    }
  }

  /**
   * 计算得出所有元素的叠加尺寸
   * 注意此方法在初始时得到的尺寸信息完全为预估（依赖 itemSize 以及 estimatedItemSize），之后逐渐动态更新替换预估值
   */
  getTotalSize () {
    const lastMeasuredSizeAndPosition = this.getSizeAndPositionOfLastMeasuredItem()
    const totalItemSize =
      lastMeasuredSizeAndPosition.offset +
      lastMeasuredSizeAndPosition.size +
      (this.itemCount - this.lastMeasuredIndex - 1) * this.estimatedItemSize

    if (this.slotManager.size() > 0) {
      const slotIndex = this.slotManager.findSlotIndexByItemIndex(this.lastMeasuredIndex)
      const restSlotSize = this.slotManager.getRestSlotSizeToIndex(slotIndex, this.lastMeasuredIndex)

      return totalItemSize + restSlotSize
    } else {
      return totalItemSize
    }
  }

  /**
   * 返回对应索引的元素出现在容器视窗内，同时对齐配置的元素偏移位置
   *
   * @param align 偏移对齐参数
   * @param containerSize 容器视窗尺寸
   * @return 元素出现在视窗内的偏移位置
   */
  getUpdatedOffsetForIndex ({ align = ALIGNMENT.START, containerSize, currentOffset, targetIndex }) {
    if (containerSize <= 0) {
      return 0
    }

    const datum = this.getSizeAndPositionForIndex(targetIndex)
    const maxOffset = datum.offset
    const minOffset = maxOffset - containerSize + datum.size

    let idealOffset

    switch (align) {
      case ALIGNMENT.END:
        idealOffset = minOffset
        break
      case ALIGNMENT.CENTER:
        idealOffset = maxOffset - (containerSize - datum.size) / 2
        break
      case ALIGNMENT.START:
        idealOffset = maxOffset
        break
      default:
        idealOffset = Math.max(minOffset, Math.min(maxOffset, currentOffset))
    }

    const totalSize = this.getTotalSize()

    return Math.max(0, Math.min(totalSize - containerSize, idealOffset))
  }

  getVisibleRange ({ containerSize, offset, overscanCount }) {
    const totalSize = this.getTotalSize()

    if (totalSize === 0) {
      return {}
    }

    const maxOffset = offset + containerSize
    let start = this.findNearestItem(offset)

    if (typeof start === 'undefined') {
      throw Error(`Invalid offset ${offset} specified`)
    }

    const datum = this.getSizeAndPositionForIndex(start)
    offset = datum.offset + datum.size

    let stop = start

    while (offset < maxOffset && stop < this.itemCount - 1) {
      stop++
      offset += this.getSizeAndPositionForIndex(stop).size
    }

    if (overscanCount) {
      start = Math.max(0, start - overscanCount)
      stop = Math.min(stop + overscanCount, this.itemCount - 1)
    }

    return { start, stop }
  }

  /**
   * 清除该索引以后的所有缓存值
   * 实际上此方法只修改索引，只有在下次触发 getSizeAndPositionForIndex 方法时才会实际更新计算
   */
  resetItem (index) {
    this.lastMeasuredIndex = Math.min(this.lastMeasuredIndex, index - 1)
  }

  /**
   * 返回最匹配此偏移位置的子元素索引
   * 如果没有准确的匹配，则返回最接近偏移位置的元素索引
   */
  findNearestItem (offset) {
    if (isNaN(offset)) {
      throw Error(`Invalid offset ${offset} specified`)
    }

    // 算法会搜索最近的匹配，或者小于（最接近）指定的偏移位置
    // 因此偏移至少都应该是 0，否则无法匹配
    offset = Math.max(0, offset)

    const lastMeasuredSizeAndPosition = this.getSizeAndPositionOfLastMeasuredItem()
    const lastMeasuredIndex = Math.max(0, this.lastMeasuredIndex)

    if (lastMeasuredSizeAndPosition.offset >= offset) {
      // 在已经缓存计算过的区域，使用二分搜索
      return this.binarySearch({
        high: lastMeasuredIndex,
        low: 0,
        offset
      })
    } else {
      // 如果是尚未缓存计算过的区域，使用指数搜索定位最接近的范围，然后再使用二分搜索
      // 指数搜索避免了不必要的计算量，提高了计算速度
      return this.exponentialSearch({
        index: lastMeasuredIndex,
        offset
      })
    }
  }

  binarySearch ({ low, high, offset }) {
    let middle = 0
    let currentOffset = 0

    while (low <= high) {
      middle = low + Math.floor((high - low) / 2)
      currentOffset = this.getSizeAndPositionForIndex(middle).offset

      if (currentOffset === offset) {
        return middle
      } else if (currentOffset < offset) {
        low = middle + 1
      } else if (currentOffset > offset) {
        high = middle - 1
      }
    }

    if (low > 0) {
      return low - 1
    }

    return 0
  }

  exponentialSearch ({ index, offset }) {
    let interval = 1
    while (index < this.itemCount && this.getSizeAndPositionForIndex(index).offset < offset) {
      index += interval
      interval *= 2
    }

    return this.binarySearch({
      low: Math.floor(index / 2),
      high: Math.min(index, this.itemCount - 1),
      offset
    })
  }
}
