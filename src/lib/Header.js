import React from 'react'
import classNames from 'classnames'
import {
  VWIDGET_ID,
  STYLE_ITEM,
  sizeProp,
  positionProp
} from './constants'

class Header extends React.PureComponent {
  static isVirtual = child => child.type._VID === VWIDGET_ID.HEADER
  static getAttachStyle = ({
    index,
    scrollDirection,
    props,
    sizeAndPositionManager
  }) => {
    const style = { ...STYLE_ITEM }
    const sizePropName = sizeProp[scrollDirection]
    const positionPropName = positionProp[scrollDirection]
    const size = props[sizePropName]
    const { offset } = sizeAndPositionManager.getSizeAndPositionForIndex(index)

    style.width = '100%'
    style.height = '100%'
    style[sizePropName] = size + 'px'
    style[positionPropName] = (offset - size) + 'px'

    return style
  }

  constructor() {
    super(...arguments)
    this.wrapperRef = React.createRef(null)
  }

  render() {
    const {
      children, style, ...props
    } = this.props

    console.log('Header', props)

    return (
      <div
        ref={ this.wrapperRef }
        style={ style }
        className={ classNames('taro-virtual-list--header', props.className) }>
        { children }
      </div>
    )
  }
}

Header._VID = VWIDGET_ID.HEADER

export default Header
