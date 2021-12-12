if (window.localStorage.getItem('uid') !== null) {
  // 已登录，跳到主页
  location.href = '/main_page'
}


let verify_chars

$(function() {
  verify_chars = draw()

  $('#canvas').click(function () {
    verify_chars = draw()
  })

  $('input[type=email]').blur(function () {
    if (checkEmail($(this))) {
      $('.email-hint').text('')
    }
  })

  $('input[type=password]').blur(function () {
    if (checkPasswd($(this))) {
      $('.passwd-hint').text('')
    }
  })

  $('input[type=text]').blur(function () {
    if (checkVerifyCode($(this), verify_chars)) {
      $('.verify-hint').text('')
    }
  })

  $('#confirm-login').click(function () {
    processLogin()
  })

  $(document).keyup(function (e) {
    // 也要支持回车键登录
    if (e.keyCode === 13) {
      processLogin()
    }
  })
})

function processLogin() {
  let email = $('input[type=email]')
  let passwd =  $('input[type=password]')
  let resHint = $('#res-hint')
  let verify = $('input[type=text]')

  resHint.text('')

  let cnt = 0
  cnt += checkEmail(email, true)
  cnt += checkPasswd(passwd, true)
  if (!checkVerifyCode(verify, verify_chars, true, true)) {
    verify.val('')
    verify_chars = draw()
  } else {
    cnt++
  }

  if (cnt !== 3) return

  // 邮箱地址、密码、协议均符合要求，发起请求
  // 先得到该用户密码的盐，再用盐和输入的密码进行hash，与数据库中的hashedPasswd比较
  $.ajax({
    type: 'post',
    url: '/get_salt',
    dataType: 'json',
    data: {
      email: email.val()
    },

    success: function (res) {
      if (res.code === 1) {
        // 得到盐
        let salt = res.salt
        let _uid = res.uid

        // 验证密码
        $.ajax({
          type: 'post',
          url: '/login',
          dataType: 'json',
          data: {
            uid: _uid,
            passwd: genHashedPasswd(passwd.val(), salt)
          },

          success: function (_res) {
            if (_res.code === 1 && _res.msg === '登录成功') {
              window.localStorage.setItem('display_name', _res.display_name)
              window.localStorage.setItem('email', _res.email)
              window.localStorage.setItem('uid', _res.uid)
              resHint.text('登录成功！').css('color', '#50B9F7')
              shake(resHint)
              setTimeout(function () {
                location.href = '/main_page'
              }, 1500)
            } else {
              // 输入错误，同时也要刷新验证码
              resHint.text('用户名或密码错误')
              shake(resHint)
              verify_chars = draw()
              verify.val('')
            }
          },

          error: function (_err) {
            console.log(_err)
          }
        })
      } else {
        // 输入错误，同时也要刷新验证码
        resHint.text('用户名或密码错误')
        shake(resHint)
        verify_chars = draw()
        verify.val('')
      }
    },

    error: function (err) {
      console.log(err)
    }

  })
}

function checkEmail(emailEl, ifShake = false) {
  if (emailEl.val().length === 0) {
    $('.email-hint').text('请输入您的邮箱地址！')
    if (ifShake) shake(emailEl)
    return false
  } else {
    $('.email-hint').text('')
  }

  if (!isValidEmail(emailEl.val())) {
    $('.email-hint').text('请输入正确的邮箱地址！')
    if (ifShake) shake(emailEl)
    return false
  } else {
    $('.email-hint').text('')
    return true
  }
}

function checkPasswd(passwdEl, ifShake = false) {
  if (passwdEl.val().length === 0) {
    $('.passwd-hint').text('请输入您的密码！')
    if (ifShake) shake(passwdEl)
    return false
  } else {
    $('.passwd-hint').text('')
    return true
  }
}

