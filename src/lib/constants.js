export const ALIGNMENT = {
  AUTO: 'auto',
  START: 'start',
  CENTER: 'center',
  END: 'end'
}

export const DIRECTION = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical'
}

export const SCROLL_CHANGE_REASON = {
  OBSERVED: 'observed',
  REQUESTED: 'requested'
}

export const scrollProp = {
  [DIRECTION.VERTICAL]: 'scrollTop',
  [DIRECTION.HORIZONTAL]: 'scrollLeft'
}

export const sizeProp = {
  [DIRECTION.VERTICAL]: 'height',
  [DIRECTION.HORIZONTAL]: 'width'
}

export const positionProp = {
  [DIRECTION.VERTICAL]: 'top',
  [DIRECTION.HORIZONTAL]: 'left'
}

export const marginProp = {
  [DIRECTION.VERTICAL]: 'marginTop',
  [DIRECTION.HORIZONTAL]: 'marginLeft'
}

export const oppositeMarginProp = {
  [DIRECTION.VERTICAL]: 'marginBottom',
  [DIRECTION.HORIZONTAL]: 'marginRight'
}

export const VWIDGET_ID = {
  HEADER: Symbol('VirtualList#Header'),
  FOOTER: Symbol('VirtualList#Footer'),
  SECTION: Symbol('VirtualList#Section')
}

export const STYLE_WRAPPER = {
  overflow: 'auto',
  willChange: 'transform',
  WebkitOverflowScrolling: 'touch'
}

export const STYLE_INNER = {
  position: 'relative',
  width: '100%',
  minHeight: '100%'
}

export const STYLE_ITEM = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%'
}

export const STYLE_STICKY_ITEM = {
  ...STYLE_ITEM,
  position: 'sticky'
}
