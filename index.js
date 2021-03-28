 
 class DOMGuard {
  constructor(opts = {}) {
    const originalElement = document.querySelector(opts.selector)
    if (!originalElement) {
      throw new Error(`Selector "${opts.selector}" not found`)
    }
    this.opts = opts
    this.selector = opts.selector
    this.initialText = normalizeText(originalElement.innerText)
    this.originalParent = originalElement.parentNode
    this.stashedClone = originalElement.cloneNode(true)
    this.detachListener = () => {}
  }
  init() {
    /* Detect changes to any selector instantly */
    const detachListener = domGuard({
      selector: this.selector,
      initialText: this.initialText,
      originalParent: this.originalParent,
      stashedClone: this.stashedClone,
    })
    /* Heartbeat to listen for changes via dev tools */              
    const heartbeat = setInterval(function () {
      restoreDom({
        selector: this.selector,
        initialText: this.initialText,
        stashedClone: this.stashedClone,
        originalParent: this.originalParent,
      })
    }.bind(this), this.opts.heartbeat || 500)
    
    this.detachListener = () => {
      clearInterval(heartbeat)
      detachListener()
    }
    /* Detach listener */
    return this.detachListener
  }
  disable() {
    this.detachListener()
  }
}

function domGuard(apiOpts) {
  const { selector, initialText, originalParent, stashedClone, debug } = apiOpts
  /* attach observer to parent element */
  let detachListener = observeDOM(originalParent, function(m) {
    var addedNodes = [], removedNodes = [];
    m.forEach(record => record.addedNodes.length & addedNodes.push(...record.addedNodes))
    m.forEach(record => record.removedNodes.length & removedNodes.push(...record.removedNodes))
    if (debug) {
      console.log('addedNodes:', addedNodes)
      console.log('removedNodes:', removedNodes)
    }
    if (addedNodes.length || removedNodes.length) {
      /* Disable listener to avoid infinite loop */
      detachListener()
      /* Immediately restore DOM */
      restoreDom({ selector, initialText, stashedClone, originalParent })
      /* Reattach observeDOM Javascript listener */
      detachListener = domGuard(apiOpts)
    }
  })
  return detachListener
}

function normalizeText(str) {
  return str
    .split('\n')
    .map((x) => x.trim())
    .filter((x) => Boolean(x))
    .join('\n')
}

function restoreDom({ selector, initialText, originalParent, stashedClone, debug }) {
  currentElement = document.querySelector(selector)
  if (!currentElement) return

  if (debug) {
    console.log(`────${selector}────`)
    console.log('currentElement', currentElement)
    console.log('stashedClone', stashedClone)
  }

  // const originalText = originalElement.innerText
  const currentElementText = normalizeText(currentElement.innerText)
  const stashedCloneText = normalizeText(stashedClone.innerText)
  if (debug) {
    console.log(`initialText:    "${initialText}"`)
    console.log(`currentText:    "${currentElementText}`)
    console.log(`persistedText:  "${stashedCloneText}"`)
  }

  if (currentElementText !== initialText) {
    if (stashedCloneText === initialText) {
      if (debug) {
        console.log('DOM has changed! Reset it!')
      }
      const dirtyNode = stashedClone.cloneNode(true)
      /* Replace altered DOM with cloned original */
      originalParent.replaceChild(dirtyNode, currentElement)
    }
  }
}

function observeDOM(element, callback) {
  if (!element || element.nodeType !== 1) return
  if (typeof window === 'undefined') return

  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver
  if (MutationObserver) {
    // define a new observer
    var mutationObserver = new MutationObserver(callback)
    // have the observer observe foo for changes in children
    mutationObserver.observe(element, { childList: true, subtree: true })
    // Cleanup mutationObserver
    return () => {
      mutationObserver.disconnect()
    }
  } else if (window.addEventListener) {
    // browser support fallback
    element.addEventListener('DOMNodeInserted', callback, false)
    element.addEventListener('DOMNodeRemoved', callback, false)
    // Cleanup
    return () => {
      element.removeEventListener('DOMNodeInserted', callback)
      element.removeEventListener('DOMNodeRemoved', callback)
    }
  }
}

export default DOMGuard