import React from 'react'
import classNames from 'classnames'
import {
  VWIDGET_ID,
  STYLE_ITEM,
  sizeProp,
  positionProp
} from './constants'

class Footer extends React.PureComponent {
  static isVirtual = child => child.type._VID === VWIDGET_ID.FOOTER
  static getAttachStyle = ({
    index,
    scrollDirection,
    props,
    sizeAndPositionManager
  }) => {
    const style = { ...STYLE_ITEM }
    const sizePropName = sizeProp[scrollDirection]
    const positionPropName = positionProp[scrollDirection]
    const footerSize = props[sizePropName]
    const { offset, size } = sizeAndPositionManager.getSizeAndPositionForIndex(index)

    style.width = '100%'
    style.height = '100%'
    style[sizePropName] = footerSize + 'px'
    style[positionPropName] = (offset + size) + 'px'

    return style
  }

  constructor () {
    super(...arguments)
    this.wrapperRef = React.createRef(null)
  }

  render () {
    const {
      children, style, ...props
    } = this.props

    return (
      <div ref={this.wrapperRef} style={style} className={classNames('taro-virtual-list--footer', props.className)}>
        {children}
      </div>
    )
  }
}

Footer._VID = VWIDGET_ID.FOOTER

export default Footer
