import {bar} from './b.mjs'
console.log('a.mjs exec')
console.log(bar())
function foo() {
  return 'foo'
}
export {foo}
