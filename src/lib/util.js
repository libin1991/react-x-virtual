export function throttle (fn, threshhold, scope) {
  threshhold || (threshhold = 250)
  let last, deferTimer
  return function () {
    let context = scope || this

    let now = +new Date()
    let args = arguments
    if (last && now < last + threshhold) {
      clearTimeout(deferTimer)
      deferTimer = setTimeout(() => {
        last = now
        fn.apply(context, args)
      }, threshhold)
    } else {
      last = now
      fn.apply(context, args)
    }
  }
}

export const isNumber = obj => {
  return typeof obj === 'number'
}

export function easeInOutQuad (t, b, c, d) {
  t /= d / 2
  if (t < 1) {
    return c / 2 * t * t + b
  }
  t--
  return -c / 2 * (t * (t - 2) - 1) + b
}

export function scrollTo (element, to, duration, direction = 'scrollTop') {
  const start = element[direction]
  const change = to - start
  const increment = 20

  let currentTime = 0

  var animateScroll = function () {
    currentTime += increment
    const val = easeInOutQuad(currentTime, start, change, duration)
    element[direction] = val
    if (currentTime < duration) {
      setTimeout(animateScroll, increment)
    }
  }
  animateScroll()
}
