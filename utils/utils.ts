import copy from 'copy-to-clipboard'

export function pcopy(val) {
  copy(val)
  window.__showToast?.('Copy successfully')
}
