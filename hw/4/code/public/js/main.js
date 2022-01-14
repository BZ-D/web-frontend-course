if (window.localStorage.getItem('uid') === null) {
  // 尚未登录，跳到登录
  location.href = '/login_page'
}

$(function () {


  $('#user-name').children('span').text('昵称：' + window.localStorage.getItem('display_name'))
  $('#user-email').children('span').text('邮箱：' + window.localStorage.getItem('email'))

  $('#exit').click(function () {
    let confirm = window.confirm('确定要退出登录吗？')
    if (!confirm) return
    setTimeout(function () {
      location.href = '/'
      window.localStorage.removeItem('display_name')
      window.localStorage.removeItem('email')
      window.localStorage.removeItem('uid')
    }, 500)
  })

  $('.item').click(function () {
    let photo_src = $(this).children('img').attr('src')
    location.href = `/photo_process?photoName=${photo_src}`
  })
})
