import React from 'react'
import classNames from 'classnames'
import Header from './Header'
import Footer from './Footer'
import omit from 'omit.js'
import {
  VWIDGET_ID,
  sizeProp
} from './constants'

class Section extends React.PureComponent {
  static isVirtual = child => child.type._VID === VWIDGET_ID.SECTION
  static walkSectionChildren = (children, itemCount) => {
    const finalChildren = []
    const childrenSize = React.Children.count(children)
    const rawChildren = React.Children.toArray(children)

    let jumpStep = 0

    for (let i = 0, cursor = 0; i < childrenSize; i += jumpStep) {
      jumpStep = 1

      const currentChild = rawChildren[i]
      const nextChild = rawChildren[i + 1]
      const nnextChild = rawChildren[i + 2]

      if (Section.isVirtual(currentChild)) {
        const sectionWrapper = currentChild
        const sectionItemCount = sectionWrapper.props.itemCount
        const section = {
          itemCount: sectionItemCount,
          start: cursor,
          end: cursor + sectionItemCount
        }

        React.Children.forEach(sectionWrapper.props.children, child => {
          if (Header.isVirtual(child)) {
            section.Header = child
          } else if (Footer.isVirtual(child)) {
            section.Footer = child
          } else {
            section.Cell = child
          }
        })
        finalChildren.push(section)
        cursor += sectionItemCount
      } else {
        const section = {
          itemCount: itemCount,
          start: cursor,
          end: itemCount,
          Cell: currentChild
        }

        if (Header.isVirtual(currentChild)) {
          section.Header = currentChild
          if (nextChild) {
            section.Cell = nextChild
            jumpStep = 2
          }
          if (nnextChild && Footer.isVirtual(nnextChild)) {
            section.Footer = nnextChild
            jumpStep = 3
          }
        }
        finalChildren.push(section)
        cursor += itemCount
      }
    }

    return finalChildren
  }
  static setSectionSlotToManager = ({ sections, scrollDirection, sizeAndPositionManager }) => {
    const sizePropName = sizeProp[scrollDirection]

    sections.forEach((sec, index) => {
      sizeAndPositionManager.slotManager.insertSlot(index, {
        ...omit(sec, ['Header', 'Cell', 'Footer']),
        header: sec.Header ? sec.Header.props[sizePropName] : 0,
        footer: sec.Footer ? sec.Footer.props[sizePropName] : 0
      })
    })
  }
  static findSectionByRangeIndex = (sections, index) => {
    let targetIndex = -1

    const section = sections.find((sec, i) => {
      if (sec.start <= index && sec.end > index) {
        targetIndex = i
        return sec
      }
      return null
    })

    return [section, targetIndex]
  }
  static getSectionItemIndex = ({ sections, sectionIndex, index }) => {
    if (sectionIndex === 0) {
      return index
    }
    return index - sections.slice(0, sectionIndex).reduce((count, sec) => {
      return count + sec.itemCount
    }, 0)
  }
  static getTotalSectionItemCount = sections => {
    return sections.reduce((count, sec) => {
      return count + sec.itemCount
    }, 0)
  }

  constructor() {
    super(...arguments)
    this.wrapperRef = React.createRef(null)
  }

  render() {
    const {
      children, ...props
    } = this.props

    return (
      <div
        ref={ this.wrapperRef }
        className={ classNames('taro-virtual-list--section', props.className) }>
        { children }
      </div>
    )
  }
}

Section._VID = VWIDGET_ID.SECTION

export default Section
