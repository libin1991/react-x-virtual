import React from 'react'
import SizeAndPositionManager from './SizeAndPositionManager'
import {
  ALIGNMENT,
  DIRECTION,
  SCROLL_CHANGE_REASON,
  marginProp,
  oppositeMarginProp,
  positionProp,
  scrollProp,
  sizeProp,
  STYLE_WRAPPER,
  STYLE_INNER,
  STYLE_ITEM,
  STYLE_STICKY_ITEM
} from './constants'
import classNames from 'classnames'
import { isNumber, throttle, scrollTo } from './util'
import Section from './Section'
import Header from './Header'
import Footer from './Footer'

class VirtualList extends React.PureComponent {
  static defaultProps = {
    itemCount: 0,
    initialRows: 5,
    upperThreshold: 50,
    lowerThreshold: 50,
    scrollEventThrottle: 10,
    initialScrollIndex: 0,
    onScroll: () => { },
    onStartScroll: () => { },
    onEndScroll: () => { },
    onScrollToUpper: () => { },
    onScrollToLower: () => { }
  }

  constructor() {
    super(...arguments)
    const {
      scrollX,
      scrollY,
      initialScrollIndex,
      scrollTo,
      onScroll,
      scrollEventThrottle,
      itemCount
    } = this.props

    if (scrollY) {
      this.scrollDirection = DIRECTION.VERTICAL
    } else if (scrollX) {
      this.scrollDirection = DIRECTION.HORIZONTAL
    } else {
      this.scrollDirection = DIRECTION.VERTICAL
    }
    const sections = Section.walkSectionChildren(
      React.Children.toArray(this.props.children), itemCount
    )
    const totalItemCount = Section.getTotalSectionItemCount(sections)

    this.itemSizeGetter = (itemSize = this.props.itemSize) => {
      return index => this._getSize(index, itemSize)
    }
    this.sizeAndPositionManager = new SizeAndPositionManager({
      itemCount: totalItemCount,
      itemSizeGetter: this.itemSizeGetter(this.props.itemSize),
      estimatedItemSize: this._getEstimatedItemSize()
    })

    Section.setSectionSlotToManager({
      sections,
      sizeAndPositionManager: this.sizeAndPositionManager,
      scrollDirection: this.scrollDirection
    })
    this.sections = sections
    this.state = {
      offset: isNumber(scrollTo) ? scrollTo : this.getOffsetForIndex(initialScrollIndex),
      scrollChangeReason: SCROLL_CHANGE_REASON.REQUESTED
    }

    this.styleCache = {}
    this.rootNodeRef = React.createRef(null)
    this.scrollWrapperNodeRef = React.createRef(null)

    // The throttle inner onScroll event
    this.throttleScroll = throttle(onScroll, scrollEventThrottle)
  }

  componentDidMount() {
    const { scrollTo } = this.props

    if (isNumber(scrollTo)) {
      this._scrollTo(scrollTo)
    } else {
      this._scrollTo(this.state.offset)
    }

    this.rootNodeRef.current.addEventListener('scroll', this._handleScroll, {
      passive: true
    })
  }

  componentWillUnmount() {
    this.rootNodeRef.current.removeEventListener('scroll', this._handleScroll)
  }

  componentWillReceiveProps(nextProps) {
    const {
      itemCount,
      itemSize,
      estimatedItemSize,
      scrollToAlignment,
      scrollTo,
      onScroll,
      scrollEventThrottle
    } = this.props

    const scrollPropsHaveChanged =
      nextProps.scrollTo !== scrollTo ||
      nextProps.scrollToAlignment !== scrollToAlignment
    const itemPropsHaveChanged =
      nextProps.itemCount !== itemCount ||
      nextProps.itemSize !== itemSize ||
      nextProps.estimatedItemSize !== estimatedItemSize

    // Regenerate throttle scroll function
    if (nextProps.scrollEventThrottle !== scrollEventThrottle) {
      this.throttleScroll = throttle(onScroll, nextProps.scrollEventThrottle)
    }

    if (nextProps.itemSize !== itemSize) {
      this.sizeAndPositionManager.updateConfig({
        itemSizeGetter: this.itemSizeGetter(nextProps.itemSize)
      })
    }

    if (
      nextProps.itemCount !== itemCount ||
      nextProps.estimatedItemSize !== estimatedItemSize
    ) {
      this.sizeAndPositionManager.updateConfig({
        itemCount: nextProps.itemCount,
        estimatedItemSize: this._getEstimatedItemSize(nextProps)
      })
    }

    if (itemPropsHaveChanged) {
      this.recomputeSizes()
    }

    if (
      typeof nextProps.scrollTo === 'number' &&
      (scrollPropsHaveChanged || itemPropsHaveChanged)
    ) {
      this.setState({
        offset: nextProps.scrollTo,
        scrollChangeReason: SCROLL_CHANGE_REASON.REQUESTED
      })
    }
  }

  componentDidUpdate(_, prevState) {
    const { offset, scrollChangeReason } = this.state
    if (
      prevState.offset !== offset &&
      scrollChangeReason === SCROLL_CHANGE_REASON.REQUESTED
    ) {
      this._scrollTo(offset)
    }
  }

  scrollToPosition({ position, smooth, alignTo }) {
    const prevTotalSize = this.sizeAndPositionManager.getTotalSize()
    const offset = this.getOffsetForIndex(position, {
      none: ALIGNMENT.CENTER,
      top: ALIGNMENT.START,
      bottom: ALIGNMENT.END
    }[alignTo])
    const positionPropName = positionProp[this.scrollDirection]
    const element = this.rootNodeRef.current

    if (!element) {
      return
    }
    // If scrollToOptions is supported, use it first to achieve high performance
    // https://developer.mozilla.org/zh-CN/docs/Web/API/ScrollToOptions/behavior
    if (typeof element.scroll === 'function') {
      const DOMScroll = () => {
        this.rootNodeRef.current.scroll({
          [positionPropName]: offset,
          behavior: smooth ? 'smooth' : 'auto'
        })
      }
      if (offset > prevTotalSize) {
        this._flushTotalSize(offset, DOMScroll)
      } else {
        DOMScroll()
      }
    } else {
      if (smooth) {
        const ANIMATE_DURATION = 300
        scrollTo(element, offset, ANIMATE_DURATION, scrollProp[this.scrollDirection])
      } else {
        this._scrollTo(offset)
      }
    }
  }

  _scrollTo(offset) {
    this.rootNodeRef.current[scrollProp[this.scrollDirection]] = offset
  }

  _flushTotalSize(offset, callback) {
    const prevOffset = this.state.offset
    this._scrollTo(offset)
    setTimeout(() => {
      this._scrollTo(prevOffset)
      callback()
    }, 0)
  }

  _getTotalItemCount() {
    const sections = this.sections || Section.walkSectionChildren(
      React.Children.toArray(this.props.children),
      this.props.itemCount
    )
    return Section.getTotalSectionItemCount(sections)
  }

  getOffsetForIndex(index, scrollToAlignment = ALIGNMENT.AUTO) {
    let itemCount = this.sizeAndPositionManager.getTotalItemCount()

    if (itemCount === 0) {
      itemCount = this._getTotalItemCount()
    }
    if (index < 0) {
      index = 0
    }
    if (index >= itemCount) {
      index = itemCount - 1
    }

    return this.sizeAndPositionManager.getUpdatedOffsetForIndex({
      align: scrollToAlignment,
      containerSize: this.props[sizeProp[this.scrollDirection]],
      currentOffset: (this.state && this.state.offset) || 0,
      targetIndex: index
    })
  }

  recomputeSizes(startIndex = 0) {
    this.styleCache = {}
    this.sizeAndPositionManager.resetItem(startIndex)
  }

  _scrollWatchTimer = null
  _handleScroll = (event) => {
    clearTimeout(this._scrollWatchTimer)

    const offset = this._getNodeOffset()
    const totalSize = this.sizeAndPositionManager.getTotalSize()
    const containerSize = this.props[sizeProp[this.scrollDirection]]

    if (
      offset < 0 ||
      this.state.offset === offset ||
      event.target !== this.rootNodeRef.current
    ) {
      return
    }

    this.setState({
      offset,
      scrollChangeReason: SCROLL_CHANGE_REASON.OBSERVED
    })

    // Use timer to watch scrolling state
    if (!this._scrollWatchTimer) {
      this.props.onStartScroll(event, offset)
    }

    // Intended to delay 300ms to detect user action
    const DELAY = 300
    this._scrollWatchTimer = setTimeout(() => {
      this.props.onEndScroll(event, offset)
      this._scrollWatchTimer = null
    }, this.props.scrollEventThrottle + DELAY)

    if ((totalSize - offset - containerSize) <= this.props.lowerThreshold) {
      this.props.onScrollToLower(event, offset)
    }

    if (offset <= this.props.upperThreshold) {
      this.props.onScrollToUpper(event, offset)
    }

    this.throttleScroll(event, offset)
  }

  _getNodeOffset() {
    return this.rootNodeRef.current[scrollProp[this.scrollDirection]]
  }

  _getEstimatedItemSize(props = this.props) {
    const defaultEstimatedItemSize = 50

    return (
      props.estimatedItemSize || (typeof props.itemSize === 'number' && props.itemSize) || defaultEstimatedItemSize
    )
  }

  _getSize(index, itemSize) {
    if (typeof itemSize === 'function') {
      return itemSize(index)
    }
    const defaultItemSize = 50

    return Array.isArray(itemSize) ? itemSize[index] : (itemSize || defaultItemSize)
  }

  _getStyle({ index, sticky, isCached }) {
    const style = this.styleCache[index]
    const sizePropName = sizeProp[this.scrollDirection]
    const positionPropName = positionProp[this.scrollDirection]

    if (style && isCached) {
      return style
    }

    const { size, offset } = this.sizeAndPositionManager.getSizeAndPositionForIndex(index)

    if (sticky) {
      this.styleCache[index] = {
        ...STYLE_STICKY_ITEM,
        [sizePropName]: size,
        [marginProp[this.scrollDirection]]: offset,
        [oppositeMarginProp[this.scrollDirection]]: -(offset + size),
        zIndex: 1
      }
    } else {
      this.styleCache[index] = {
        ...STYLE_ITEM,
        [sizePropName]: size,
        [positionPropName]: offset
      }
    }

    return this.styleCache[index]
  }

  _getItems = () => {
    const {
      overscanCount,
      initialRows,
      itemCount,
      children,
      ...props
    } = this.props
    const { offset } = this.state

    const sections = this.sections
    const totalItemCount = Section.getTotalSectionItemCount(sections)

    if (itemCount !== totalItemCount) {
      this.sizeAndPositionManager.updateConfig({
        itemCount: totalItemCount
      })
    }

    const containerSize = props[sizeProp[this.scrollDirection]]
    const { start, stop } = this.sizeAndPositionManager.getVisibleRange({
      containerSize,
      offset,
      overscanCount: overscanCount || initialRows
    })
    const items = []

    if (typeof start !== 'undefined' && typeof stop !== 'undefined') {
      for (let index = start; index <= stop; index++) {
        const [section, sectionIndex] = Section.findSectionByRangeIndex(sections, index)
        const {
          Header: VirtualHeader,
          Cell: VirtualCell,
          Footer: VirtualFooter,
          start: sectionStart,
          end: sectionEnd
        } = section

        if (index === sectionStart && VirtualHeader) {
          items.push(
            React.createElement(VirtualHeader.type, {
              ...VirtualHeader.props,
              key: `virtual-section-header-${sectionIndex}`,
              style: Header.getAttachStyle({
                props: VirtualHeader.props,
                index,
                scrollDirection: this.scrollDirection,
                sizeAndPositionManager: this.sizeAndPositionManager
              })
            })
          )
        }
        if (VirtualCell) {
          const itemIndex = Section.getSectionItemIndex({ sections, sectionIndex, index })
          const virtualIndex = index
          const itemStyle = this._getStyle({
            index,
            sticky: false,
            isCached: true
          })
          const CellComponent = React.createElement(VirtualCell.type, {
            ...VirtualCell.props,
            key: virtualIndex,
            virtualIndex,
            index: itemIndex,
            style: itemStyle
          })
          const onNodeAppearHandler = CellComponent.props.onNodeAppear
          if (typeof onNodeAppearHandler === 'function') {
            const itemPos = itemStyle[positionProp[this.scrollDirection]]
            const itemSize = itemStyle[sizeProp[this.scrollDirection]]
            if (itemPos + itemSize > offset && itemPos < offset + containerSize) {
              onNodeAppearHandler({
                itemIndex, virtualIndex, itemStyle
              })
            }
          }
          items.push(CellComponent)
        }
        if (index === sectionEnd - 1 && VirtualFooter) {
          items.push(
            React.createElement(VirtualFooter.type, {
              ...VirtualFooter.props,
              key: `virtual-section-footer-${sectionIndex}`,
              style: Footer.getAttachStyle({
                props: VirtualFooter.props,
                index,
                scrollDirection: this.scrollDirection,
                sizeAndPositionManager: this.sizeAndPositionManager
              })
            })
          )
        }
      }
    }

    return items
  }

  render() {
    const { style, width, height } = this.props
    const items = this._getItems()
    const totalSize = this.sizeAndPositionManager.getTotalSize()
    const wrapperStyle = { ...STYLE_WRAPPER, ...style, width, height }
    const innerStyle = {
      ...STYLE_INNER,
      [sizeProp[this.scrollDirection]]: totalSize
    }
    if (this.scrollDirection === DIRECTION.HORIZONTAL) {
      innerStyle.display = 'flex'
    }

    return (
      <div
        ref={ this.rootNodeRef }
        className={ classNames('taro-virtual-list', this.props.className) }
        style={ wrapperStyle }>
        <div ref={ this.scrollWrapperNodeRef } style={ innerStyle }>{ items }</div>
      </div>
    )
  }
}

VirtualList.Section = Section
VirtualList.Header = Header
VirtualList.Footer = Footer

export default VirtualList
