let verify_chars

$(function() {
  verify_chars = draw()
  let canvas = $('#canvas')
  let email = $('input[type=email]')
  let displayName = $('input[type=text]:first')
  let passwd = $('input[type=password]:first')
  let repPasswd = $('input[type=password]:last')

  canvas.click(function () {
    verify_chars = draw()
  })

  email.focus(function () {
    $('.email-hint').text('请输入您用于注册的正确邮箱').css('color', '#50B9F7')
  })

  email.blur(function () {
    $('.email-hint').css('color', '#F85A5A')
    checkEmail($(this))
  })

  displayName.on('input', function () {
    if (!checkName($(this))) {
      $('.display-name-hint').css('color', '#F85A5A')
    }
  })

  displayName.focus(function () {
    $('.display-name-hint').text('支持中文、英文、数字、下划线组合，4-20字符').css('color', '#50B9F7')
  })

  displayName.blur(function () {
    $('.display-name-hint').css('color', '#F85A5A')
    checkName($(this))
  })

  passwd.on('input', function () {
    processPasswdStrength($(this))
  })

  passwd.focus(function () {
    $('#password-hint-box').css('display', 'flex')
    processPasswdStrength($(this))
  })

  passwd.blur(function () {
    $('.passwd-hint').css('color', '#F85A5A')
    if (checkPasswd($(this))) $('#password-hint-box').css('display', 'none')
    else $('#password-hint-box').css('display', 'flex')
  })

  repPasswd.focus(function () {
    $('.repeat-passwd-hint').text('请再次输入密码，与上文一致').css('color', '#50B9F7')
  })

  repPasswd.blur(function () {
    $('.repeat-passwd-hint').css('color', '#F85A5A')
    checkRepeatPasswd($('input[type=password]:first'), $(this))
  })

  $('input[type=text]:last').blur(function () {
    checkVerifyCode($(this), verify_chars)
  })

  $('#confirm-signup').click(function () {
    processSignup()
  })

  $(document).keyup(function (e) {
    if (e.keyCode === 13) {
      processSignup()
    }
  })
})

function processPasswdStrength(passwdEl) {
  // 实时监听用户的输入密码，以提示密码强度
  if (passwdEl.val().length === 0) {
    $('#strength-icon').attr('src', '')
    $('.passwd-hint').text('请使用字母、数字和符号两种及以上组合，8-20字符').css('color', '#50B9F7')
    return
  }

  let strength = checkPasswdStrength(passwdEl.val())
  if (!isValidPasswd(passwdEl.val())) {
    $('.passwd-hint').text('密码应由字母/数字/符号两种以上组合，8-20字符!').css('color', '#F85A5A')
    $('#strength-icon').attr('src', '../image/密码不规范.png')
    return
  }
  if (strength === 0 || strength === 1 || strength === 2) {
    // 低
    $('.passwd-hint').text('密码强度：低。建议多个大小写字母/数字/字符组合').css('color', '#F85A5A')
    $('#strength-icon').attr('src', '../image/密码强度低.png')
    return
  }
  if (strength === 3) {
    // 中
    $('.passwd-hint').text('密码强度：中。建议多个大小写字母/数字/字符组合').css('color', '#FFC300')
    $('#strength-icon').attr('src', '../image/密码强度中.png')
    return
  }
  if (strength === 4) {
    // 高
    $('.passwd-hint').text('密码强度：高。您的密码不易被猜到').css('color', '#44C944')
    $('#strength-icon').attr('src', '../image/密码强度高.png')
    return
  }
}

function processSignup() {
  let email = $('input[type=email]')
  let display_name = $('input[type=text]:first')
  let passwd =  $('input[type=password]:first')
  let rep_passwd = $('input[type=password]:last')
  let verify = $('input[type=text]:last')
  let agree = $('input[type=checkbox]')
  let signupData = {
    email: email.val(),
    display_name: display_name.val()
  }

  // 之所以不用条件判断，是因为条件判断会产生短路而不会检查后续表项
  let cnt = 0
  cnt += checkEmail(email, true)
  cnt += checkName(display_name, true)
  cnt += checkPasswd(passwd, true)
  cnt += checkRepeatPasswd(passwd, rep_passwd, true)

  if (!checkVerifyCode(verify, verify_chars, true, true)) {
    verify.val('')
    verify_chars = draw()
  } else {
    cnt++
  }

  if (cnt <= 4) {
    verify_chars = draw()
    return
  }

  if (!checkAgreement(agree, true)) {
    $('.verify-hint').text('请阅读并勾选同意许可条款！')
    agree.blur()
    return
  } else {
    cnt++
    $('.verify-hint').text('')
  }

  if (cnt !== 6) return

  let salt = genSalt(32)
  signupData.passwd = genHashedPasswd(passwd.val(), salt)
  signupData.salt = salt
  // 邮箱地址、密码、协议均符合要求，发起请求
  $.ajax({
    type: 'post',
    url: '/signup',
    dataType: 'json',
    data: signupData,

    success: function (res) {
      console.log(res)
      if (res.code === 0 && res.msg === '邮箱已注册') {
        $('.email-hint').text('此邮箱已注册！')
        shake(email)
        verify_chars = draw()
        verify.val('')
        return
      }
      if (res.code === -1 && res.msg === '用户昵称已注册') {
        $('.display-name-hint').text('此昵称已存在！')
        shake(display_name)
        verify_chars = draw()
        verify.val('')
        return
      }
      if (res.code === 1 && res.msg === '注册成功') {
        let confirmBtn = $('#confirm-signup')
        confirmBtn.text('注册成功！')
        shake(confirmBtn)
        setTimeout(function () {
          location.href = '/login_page'
        }, 1500)
      }
    },

    error: function (err) {
      console.log(err)
    }

  })
}

function checkName(nameEl, ifShake = false) {
  if (nameEl.val().length === 0) {
    $('.display-name-hint').text('请输入您的用户昵称！')
    if (ifShake) shake(nameEl)
    return false
  } else {
    if (isValidName(nameEl.val())) {
      $('.display-name-hint').text('')
      return true
    } else {
      $('.display-name-hint').text('昵称由中文、英文、数字、下划线组合，4-20字符！')
      if (ifShake) shake(nameEl)
      return false
    }
  }
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
    if (isValidPasswd(passwdEl.val())) {
      $('.passwd-hint').text('')
      return true
    } else {
      $('.passwd-hint').text('密码格式不正确！')
      $('#strength-icon').attr('src', '../image/密码不规范.png')
      if (ifShake) shake(passwdEl)
      return false
    }
  }
}

function checkRepeatPasswd(passwdEl, repeatPasswdEl, ifShake = false) {
  if (passwdEl.val().length !== 0) {
    if (repeatPasswdEl.val().length === 0) {
      $('.repeat-passwd-hint').text('请再次输入您的密码！')
      if (ifShake) shake(repeatPasswdEl)
      return false
    } else {
      $('.repeat-passwd-hint').text('')
    }

    if (repeatPasswdEl.val().length !== 0 && passwdEl.val().length !== 0 && repeatPasswdEl.val() !== passwdEl.val()) {
      $('.repeat-passwd-hint').text('两次输入的密码不一致！')
      if (ifShake) {
        shake(repeatPasswdEl)
        shake(passwdEl)
      }
      return false
    } else {
      $('.repeat-passwd-hint').text('')
      return true
    }
  }
  return true
}

function checkAgreement(agreeEl, ifShake = false) {
  if (!agreeEl.is(':checked')) {
    agreeEl.focus()
    if (ifShake) shake(agreeEl)
    return false
  }
  return true
}

