import {drawWM} from "./visible_wm.js";


/**
 * 加密函数
 * 处理思想：对有文本信息的像素点位置，其G通道最低位置为1，否则置为0
 * 在解密时，对G通道为1的像素点进行处理即可
 *
 * @param ctx
 * @param textData: 后来的文字信息
 * @param originalData: 原图信息
 */
let addDisturb = function (ctx, textData, originalData) {
  let oData = originalData.data
  let newData = textData.data

  // 像素信息四个元素一组，对应于 R、G、B、alpha
  for (let i = 0; i < oData.length; i += 4) {
    if (newData[i + 3] === 0 && (oData[i + 1] % 2 === 1)) {
      // 该像素点没有文字信息，且原图此处G通道最低位为1
      // 则将原图此处G通道最低为置为0
      if (oData[i + 1] === 255) {
        oData[i + 1]--
      } else {
        oData[i + 1]++
      }
    } else if (newData[i + 3] !== 0 && (oData[i + 1] % 2 === 0)) {
      // 该像素点有文字信息且原图此处G通道最低位为0
      // 将原图此处G通道最低位设为1
      oData[i + 1]++
    }
  }

  ctx.putImageData(originalData, 0, 0)
}


/**
 * 解密图片
 * @param ctx
 * @param originalData
 */

let exposeWM = function (ctx, originalData) {
  let data = originalData.data
  for (let i = 0; i < data.length; i += 4) {
    // 对G通道的末位进行判断
    if (data[i + 1] % 2 === 1) {
      // 末位为1，说明此处有加密信息
      // 青色 - color: '#3ab6b9'
      data[i] = 3 * 16 + 10
      data[i + 1] = 11 * 16 + 6
      data[i + 2] = 11 * 16 + 9
    } else {
      // 末位为0，则设成无像素
      data[i] = 0
      data[i + 1] = 0
      data[i + 2] = 0
      data[i + 3] = 0
    }
  }

  ctx.putImageData(originalData, 0, 0)
}


export const encodeImg = (base64Src, wmParams) => {
  return new Promise((resolve, reject) => {
    let textData
    let canvas = document.createElement('canvas')
    let ctx = canvas.getContext('2d')

    let base64_WM = null
    let img = new Image()
    let originalData

    img.onload = function () {
      ctx.canvas.width = img.width
      ctx.canvas.height = img.height

      // 在画布上绘制文字水印，引用可见水印js中的方法
      drawWM(ctx, img.width, img.height, wmParams)
      // ctx 上目前只有文字水印
      textData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)

      ctx.drawImage(img, 0, 0)
      // ctx 上目前只有原图像信息
      originalData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)

      addDisturb(ctx, textData, originalData)

      base64_WM = canvas.toDataURL('image/png')

      if (!base64_WM) {
        reject()
      } else {
        resolve(base64_WM)
      }
    }

    img.src = base64Src
  })
}


export const decodeImg = (base64Src) => {
  return new Promise((resolve, reject) => {
    let canvas = document.createElement('canvas')
    let ctx = canvas.getContext('2d')

    let base64_WM = null
    let img = new Image()
    let originalData

    img.onload = function () {
      ctx.canvas.width = img.width
      ctx.canvas.height = img.height

      ctx.drawImage(img, 0, 0)
      originalData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)

      exposeWM(ctx, originalData)

      base64_WM = canvas.toDataURL('image/png')

      if (!base64_WM) {
        reject()
      } else {
        resolve(base64_WM)
      }
    }

    img.src = base64Src
  })
}
