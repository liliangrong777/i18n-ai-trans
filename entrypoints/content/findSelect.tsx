import { finder } from '@medv/finder'
export function findSelect(input: Element) {
  const selectPriority = customFinder(input)
  if (selectPriority) return selectPriority
  // 自定义的查找找不到时再用finder查找
  return finder(input, {
    attr: validAttr,
  })
}
export function customFinder(input: Element) {
  const elemSelect = [...getId(input), ...getAttrs(input), ...getClasses(input)]
  const combineSelectList = [...combine(elemSelect)]
  const found =
    combineSelectList.find(
      (item) => document.querySelectorAll(item).length === 1
    ) ?? ''

  return found
}

export function validAttr(name: string, value: string) {
  const validAttrName = ['name', 'type', 'form']
  if (validAttrName.includes(name)) return true
  const fnMap = {
    href() {
      return ['/checkout', '/cart'].includes(value)
    },
  }
  return fnMap[name]?.()
}

function getId(input: Element) {
  const elementId = input.getAttribute('id')
  if (elementId) return ['#' + CSS.escape(elementId)]
  return []
}

function getAttrs(input: Element) {
  return Array.from(input.attributes)
    .filter((attr) => validAttr(attr.name, attr.value))
    .map((attr) => `[${CSS.escape(attr.name)}="${CSS.escape(attr.value)}"]`)
}

function getClasses(input: Element) {
  return Array.from(input.classList).map((item) => '.' + CSS.escape(item))
}
// 自定义的元素查找选择器

const isId = (x) => x.startsWith('#')
const isAttr = (x) => x.startsWith('[')
function getPriority(x) {
  if (isId(x)) return 1
  if (isAttr(x)) return 2
  return 3
}

function sortFn(a, b) {
  const priorityA = getPriority(a)
  const priorityB = getPriority(b)
  if (priorityA === priorityB) return a.localeCompare(b)
  return priorityA - priorityB
}

function combine(arr: string[], depth = 2) {
  const result = new Set<string>()
  const i = 0
  function exec(arr: string[], curr: string[] = []) {
    if (arr.length === 0) return
    arr.forEach((item) => {
      if (curr.includes(item)) return
      const currNew = [...curr, item].sort(sortFn)
      // 只需要{depth}级数据
      if (currNew.length > depth) return
      const selector = currNew.join('')
      if (result.has(selector)) return
      result.add(selector)
      exec(arr.slice(i + 1), currNew)
    })
  }
  exec(arr)
  return result
}
