if (window.localStorage.getItem('uid') === null) {
  // 尚未登录
  location.href = '/login_page'
}

let verify_chars

$(function () {
  verify_chars = draw()
  let canvas = $('#canvas')
  let originalPasswd = $('input[type=password]:first')
  let newPasswd = $('input[type=password]:odd')
  let repNewPasswd = $('input[type=password]:last')
  let verify = $('input[type=text]')

  canvas.click(function () {
    verify_chars = draw()
  })

  originalPasswd.focus(function () {
    $('.original-passwd-hint').text('请输入您的原密码').css('color', '#50B9F7')
  })

  originalPasswd.blur(function () {
    $('.original-passwd-hint').css('color', '#F85A5A')
    checkOriginalPasswd($(this))
  })

  newPasswd.on('input', function () {
    processPasswdStrength($(this))
  })

  newPasswd.focus(function () {
    $('#new-password-hint-box').css('display', 'flex')
    processPasswdStrength($(this))
  })

  newPasswd.blur(function () {
    $('.new-passwd-hint').css('color', '#F85A5A')
    $('#strength-icon').attr('src', '')
    if (checkNewPasswd(originalPasswd, $(this))) $('#new-password-hint-box').css('display', 'none')
    else $('#new-password-hint-box').css('display', 'flex')
  })

  repNewPasswd.focus(function () {
    $('.new-passwd-repeat-hint').text('请再次输入新密码').css('color', '#50B9F7')
  })

  repNewPasswd.blur(function () {
    $('.new-passwd-repeat-hint').css('color', '#F85A5A').text('')
    checkRepeatNewPasswd(newPasswd, $(this))
  })

  verify.blur(function () {
    checkVerifyCode(verify, verify_chars, false, false)
  })

  $('#confirm-change').click(function () {
    let changeData = {
      originalPasswd: originalPasswd.val(),
      newPasswd: newPasswd.val(),
      uid: window.localStorage.getItem('uid')
    }

    let cnt = 0
    cnt += checkOriginalPasswd(originalPasswd, true)
    cnt += checkNewPasswd(originalPasswd, newPasswd, true)
    cnt += checkRepeatNewPasswd(newPasswd, repNewPasswd, true)
    if (!checkVerifyCode(verify, verify_chars, true, true)) {
      verify.val('')
      verify_chars = draw()
      return
    } else {
      cnt++
    }

    // 邮箱地址、密码、协议均符合要求，发起请求
    // 先获取盐
    $.ajax({
      type: 'post',
      url: '/get_salt',
      dataType: 'json',
      async: false,
      data: {
        email: window.localStorage.getItem('email')
      },

      success: function (res) {
        if (res.code === 1) {
          // 得到盐
          let salt = res.salt
          let passwd = genHashedPasswd(originalPasswd.val(), salt)
          let newSalt = genSalt(32)
          $.ajax({
            type: 'post',
            url: '/change_passwd',
            dataType: 'json',
            async: false,
            data: {
              uid: window.localStorage.getItem('uid'),
              originalPasswd: passwd,
              newPasswd: genHashedPasswd(newPasswd.val(), newSalt),
              salt: newSalt
            },

            success: function (res1) {
              if (res1.code === 1 && res1.msg === '密码修改成功') {
                let resHint = $('#confirm-change')
                resHint.text('修改成功！')
                shake(resHint)
                setTimeout(function () {
                  location.href = '/main_page'
                }, 1200)
              } else if (res1.code === -1 && res1.msg === '原密码错误') {
                $('.original-passwd-hint').text('原密码错误！请重新输入').focus()
                shake(originalPasswd)
                verify_chars = draw()
                verify.val('')
              }
            },

            error: function (err) {
              console.log(err)
            }

          })
        }
      },

      error: function (err) {
        console.log(err)
      }
    })
  })
})

function processPasswdStrength(passwdEl) {
  // 实时监听用户的输入密码，以提示密码强度
  if (passwdEl.val().length === 0) {
    $('#strength-icon').attr('src', '')
    $('.new-passwd-hint').text('请使用字母、数字和符号两种及以上组合，8-20字符').css('color', '#50B9F7')
    return
  }

  let strength = checkPasswdStrength(passwdEl.val())
  if (!isValidPasswd(passwdEl.val())) {
    $('.new-passwd-hint').text('密码应由字母/数字/符号两种以上组合，8-20字符!').css('color', '#F85A5A')
    $('#strength-icon').attr('src', '../image/密码不规范.png')
    return
  }
  if (strength === 0 || strength === 1 || strength === 2) {
    // 低
    $('.new-passwd-hint').text('密码强度：低。建议多个大小写字母/数字/字符组合').css('color', '#F85A5A')
    $('#strength-icon').attr('src', '../image/密码强度低.png')
    return
  }
  if (strength === 3) {
    // 中
    $('.new-passwd-hint').text('密码强度：中。建议多个大小写字母/数字/字符组合').css('color', '#FFC300')
    $('#strength-icon').attr('src', '../image/密码强度中.png')
    return
  }
  if (strength === 4) {
    // 高
    $('.new-passwd-hint').text('密码强度：高。您的密码不易被猜到').css('color', '#44C944')
    $('#strength-icon').attr('src', '../image/密码强度高.png')
    return
  }
}

function checkOriginalPasswd(passwdEl, ifShake = false) {
  if (passwdEl.val().length === 0) {
    $('.original-passwd-hint').text('请输入您的原密码！')
    if (ifShake) shake(passwdEl)
    return false
  } else {
    $('.original-passwd-hint').text('')
    return true
  }
}

function checkNewPasswd(originalPasswdEl, newPasswdEl, ifShake = false) {
  if (newPasswdEl.val().length === 0) {
    $('.new-passwd-hint').text('请输入您的新密码！')
    if (ifShake) shake(newPasswdEl)
    return false
  } else {
    $('.new-passwd-hint').text('')
  }

  if (newPasswdEl.val() === originalPasswdEl.val()) {
    $('.new-passwd-hint').text('新密码与原密码一致，请重新输入！')
    if (ifShake) shake(newPasswdEl)
    return false
  } else {
    if (isValidPasswd(newPasswdEl.val())) {
      $('.new-passwd-hint').text('')
      return true
    } else {
      $('.new-passwd-hint').text('密码格式不正确！')
      return false
    }
  }
}

function checkRepeatNewPasswd(passwdEl, repPasswdEl, ifShake = false) {
  if (passwdEl.val().length !== 0) {
    if (repPasswdEl.val().length === 0) {
      $('.new-passwd-repeat-hint').text('请再次输入新密码！')
      if (ifShake) shake(repPasswdEl)
      return false
    } else {
      $('.new-passwd-repeat-hint').text('')
    }

    if (passwdEl.val() !== repPasswdEl.val()) {
      $('.new-passwd-repeat-hint').text('两次输入的密码不一致！')
      if (ifShake) shake(repPasswdEl)
      return false
    } else {
      return true
    }
  }
  return true
}

