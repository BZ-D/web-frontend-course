function shake(el) {
  // 抖动提示
  el.addClass('shake')
  setTimeout(() => {
    el.removeClass('shake')
  }, 800)
}
