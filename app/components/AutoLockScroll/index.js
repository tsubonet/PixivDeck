// @flow
import React from 'react'

type Props = {
  lock: boolean,
}

let lockingCounter: number = 1
let originalBodyOverflow = null

function getElementBody() {
  return document.getElementsByTagName('body')[0]
}

class AutoLockScroll extends React.Component {
  props: Props

  componentDidMount() {
    if (this.props.lock === true) {
      this.preventScrolling()
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.lock === nextProps.lock) {
      return
    }

    if (nextProps.lock) {
      this.preventScrolling()
    } else {
      this.allowScrolling()
    }
  }

  componentWillUnmount() {
    this.allowScrolling()
  }

  locked: boolean = false

  preventScrolling() {
    if (this.locked) {
      return
    }

    lockingCounter += 1

    this.locked = true

    if (lockingCounter === 1) {
      const body = getElementBody()
      originalBodyOverflow = body.style.overflow
      body.style.overflow = 'hidden'
    }
  }

  allowScrolling() {
    if (this.locked) {
      lockingCounter -= 1
      this.locked = false
    }

    if (lockingCounter === 0 && originalBodyOverflow !== null) {
      const body = getElementBody()
      body.style.overflow = originalBodyOverflow || ''
      originalBodyOverflow = null
    }
  }

  // eslint-disable-next-line
  render() {
    return null
  }
}

export default AutoLockScroll
