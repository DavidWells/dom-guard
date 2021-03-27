

function observeDOM(element, callback) {
  if (!element || element.nodeType !== 1) return
  if (typeof window === 'undefined') return
 
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
  if (MutationObserver) {
    // define a new observer
    var mutationObserver = new MutationObserver(callback)
    // have the observer observe foo for changes in children
    mutationObserver.observe(element, { childList: true, subtree: true })
    // Cleanup
    return () => {
      console.log('Remove observer')
      mutationObserver.disconnect()
    }
  } else if (window.addEventListener) {
    // browser support fallback
    element.addEventListener('DOMNodeInserted', callback, false)
    element.addEventListener('DOMNodeRemoved', callback, false)
    // Cleanup
    return () => {
      console.log('Remove listeners')
      element.removeEventListener('DOMNodeInserted', callback)
      element.removeEventListener('DOMNodeRemoved', callback)
    }
  }
}
