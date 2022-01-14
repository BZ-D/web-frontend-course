/**
 * 整体思路：
 * 1、传入图片base64数据，使用 js Image 对象加载图片（img src 可以直接加载base64数据）
 * 2、使用canvas写入图片，再绘制水印文本
 * 3、canvas输出添加水印后的base64数据
 */

/**
 * Image加载图片，创建canvas绘制图片
 * base64Img：原始图片base64数据
 * wmConfig：水印配置，参考如下
 * wmConfig = {
 * font: 'microsoft yahei',
 * color: '#00000000'
 * textArray: ['name', 'time'], // 最大允许三行水印
 * density: 3  // 密度，值越大水印越多
 * }
 */


/**
 * new Image() 创建img对象，通过img.src = base64Img 加载图片
 * 加载成功(img.onload)后，作为canvas的参数
 * 在画布中绘制原始图片 ctx.drawImage(img,0,0) 后两个0表示从canvas的左上角开始绘制
 * drawWaterMark(ctx, img.width, img.height, wmConfig) 方法实现在原始图片上绘制水印
 * 水印绘制完成后，使用canvas的toDataURL方法将canvas内容转为base64数据
 * 由于图片base64数据较大，使用Promise封装将处理后的数据异步返回
 */

const addVisibleWM = (base64Src, wmParams) => {

  // console.log(base64Src)

  // base64 编码较长，用Promise包装后异步返回
  return new Promise((resolve, reject) => {
    // 模板
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    let base64_WM = null

    // 图片加载之后立即执行
    img.onload = function () {
      canvas.width = img.width
      canvas.height = img.height

      // canvas 绘制图片，从左上角开始
      ctx.drawImage(img, 0, 0)

      // 写入水印
      drawWM(ctx, img.width, img.height, wmParams)

      // 返回一个包含图片展示的data url，以 'data:image/png,base64,' 开头
      base64_WM = canvas.toDataURL('image/png')

      // console.log(resultBase64)

      if (!base64_WM) {
        // rejected
        reject()
      } else {
        // fulfilled
        resolve(base64_WM)
      }
    }
    img.src = base64Src
  })
}

/**
 * canvas绘制水印文本算法
 * canvas基本文本绘制设置：
 *    font-字体
 *    fillStyle-颜色/透明度
 *    textAlign-对齐方式
 *    fillText-填充字体
 * 水印算法思想：
 *    1）取图片水平像素和垂直像素最大值，以密度density值除该最大值得步长step
 *    2）原点取图片中心，确定第一个水印坐标点，再以step为步长向四周扩散
 *    3）水印文案以原点为圆心，旋转一定弧度即可
 */

const drawWM = (ctx, imgWidth, imgHeight, wmParams) => {
  // 调整字体
  let fontSize = 22

  // console.log(imgWidth, imgHeight, fontSize)
  ctx.font = `${fontSize}px ${wmParams.font}`
  ctx.fillStyle = wmParams.color
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'

  // 确定蔓延步长
  const maxPx = Math.max(imgWidth, imgHeight)
  const stepPx = Math.floor(maxPx / wmParams.density)

  let arrayX = [0]  // 初始水印位置（横坐标），canvas坐标(0,0)
  while (arrayX[arrayX.length - 1] < maxPx / 2) {
    // 先向一个方向蔓延
    arrayX.push(arrayX[arrayX.length - 1] + stepPx)
  }

  // ...扩展运算符可将数组扩展为参数序列
  // 再向相反方向蔓延
  arrayX.push(...arrayX.slice(1, arrayX.length).map((el) => {
    return -el
  }))

  // console.log(arrayX)

  // 画水印
  for (let i = 0; i < arrayX.length; i++) {
    for (let j = 0; j < arrayX.length; j++) {
      // 绘制过程：
      // 先将原点转移到图像中心: translate
      // 再旋转一定角度: rotate
      // 然后填充文字: fillText，其中坐标值决定了文本的最终位置

      // 保留当前图像的一份拷贝，把当前状态推入到绘图堆栈中
      // 画之前save，画好后restore，防止污染状态栈
      ctx.save()
      // 将 dx,dy 作为新的原点，重复使用效果叠加
      // 即将图片的中心作为原点
      ctx.translate(imgWidth / 2, imgHeight / 2)
      // 旋转一定角度
      ctx.rotate(-Math.PI / 7)

      wmParams.textArray.forEach((el, ind) => {
        // 对垂直方向设一个偏移，防止textArray里的文本叠在一行
        let offsetY = fontSize * ind

        // 注意：这里参数中的x和y（第二、三个参数）是相对于
        // translate 后的原点，也就是图片的中心点
        ctx.fillText(el, arrayX[i], arrayX[j] + offsetY)
      })
      // 从绘图堆栈中弹出上一个canvas的状态
      ctx.restore()
    }
  }
}

export {addVisibleWM, drawWM}
