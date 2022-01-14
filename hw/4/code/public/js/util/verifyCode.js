/**
 * 生成验证码的函数，采用canvas
 */
function draw() {
  let canvasEl = $('#canvas')
  canvasEl.css('background', getLightColor())
  let codeChars = ['', '', '', '']
  let width = canvasEl.width()
  let height = canvasEl.height()

  const canvas = document.getElementById('canvas')
  // 清空画布，当画布的高、宽重新设置时就会清空
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  const chars = "a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,0,1,2,3,4,5,6,7,8,9".split(',')

  // 生成随机字符
  for (let i = 0; i < 4; i++) {
    // 四位验证码

    // 选择随机字符
    let ind = Math.floor(Math.random() * chars.length)
    // 生成随机弧度
    let rad = Math.random() - 1 / 2
    // 得到随机内容
    let chr = chars[ind]
    codeChars[i] = chr.toLowerCase()

    // 绘制
    // 计算坐标
    let x = 10 + i * 17
    let y = 20 + Math.random() * 8
    // 绘制过程
    ctx.save()

    ctx.font = 'bold 20px "Times New Roman"'
    // 转换原点、旋转
    ctx.translate(x, y)
    ctx.rotate(rad)
    ctx.fillStyle = getDarkColor()
    ctx.fillText(chr, 0, 0)

    ctx.restore()
  }

  // 生成干扰线条
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = getDarkColor()
    ctx.beginPath()
    ctx.moveTo(Math.random() * width, Math.random() * height)
    ctx.lineTo(Math.random() * width, Math.random() * height)
    ctx.stroke()
  }

  // 生成干扰点
  for (let i = 0; i < 30; i++) {
    ctx.strokeStyle = getDarkColor()
    ctx.beginPath()
    let x = Math.random() * width
    let y = Math.random() * width
    ctx.moveTo(x, y)
    ctx.lineTo(x + 1, y + 1)
    ctx.stroke()
  }

  return codeChars
}


function getDarkColor() {
  let r = Math.floor((Math.random() * 0.6) * 255)
  let g = Math.floor((Math.random() * 0.6) * 255)
  let b = Math.floor((Math.random() * 0.6) * 255)
  return `rgb(${r},${g},${b})`
}

function getLightColor() {
  // 随机浅色，用于验证码图片底色
  let r = Math.floor((Math.random() * 0.9 + 0.7) * 255)
  let g = Math.floor((Math.random() * 0.9 + 0.7) * 255)
  let b = Math.floor((Math.random() * 0.9 + 0.7) * 255)
  return `rgb(${r},${g},${b})`
}

function checkVerifyCode(verifyEl, chars, ifCheck = false, ifShake = false) {
  // ifCheck:是否检查验证码输入正确，仅当按下登录/注册按钮时检查

  if (verifyEl.val().length === 0) {
    $('.verify-hint').text('请输入验证码！')
    if (ifShake) shake(verifyEl)
    return false
  } else {
    $('.verify-hint').text('')
  }

  // 检查是否输入正确
  if (ifCheck) {
    let inputChars = verifyEl.val().split('').map(ch => ch.toLowerCase())
    if (inputChars.toString() === chars.toString()) {
      return true
    } else {
      $('.verify-hint').text('验证码输入错误！')
      if (ifShake) shake(verifyEl)
      return false
    }
  } else {
    return true
  }
}
