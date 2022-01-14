console.log('执行b')
import {foo} from './a.mjs'
console.log('b.mjs exec')
console.log(foo())
function bar() {
  return 'bar'
}
export {bar}
