import {addVisibleWM} from "./util/watermark/visible_wm.js"
import {encodeImg, decodeImg} from "./util/watermark/invisible_wm.js";

if (window.localStorage.getItem('uid') === null) {
  // 未登录
  location.href = '/login_page'
}

$(function () {
  let img = document.querySelector('#origin')

// ----------------- 可见水印部分 -------------------
// -------------------------------------------------

// 为了证明确实是水印，水印文本采用实时时间
  let date = new Date()
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  let hh = date.getHours()
  let mm = date.getMinutes() + ''
  if (mm.length === 1) mm = '0' + mm
  let time = year + '/' + month + '/' + day + ' ' + hh + ':' + mm

  let wmParams = {
    font: "microsoft yahei",
    textArray: ['191250024', '丁炳智', time],
    color: '#ffffff7b',
    density: 3
  }

// 渲染加水印后图片
// 取得添加水印后的base64图片编码
  addVisibleWM(img.src, wmParams).then(function (base64Str) {
    // 向dom的ul中添加子节点li
    // 子节点li由img和span两个节点组成
    let node = document.createElement("LI")
    let img_visible_wm = document.createElement("IMG")
    // console.log(base64Str)
    img_visible_wm.src = base64Str
    // 加入图片描述
    let des_node = document.createElement("SPAN")
    des_node.innerText = "可见水印示意（时间为当前时刻）"

    node.appendChild(img_visible_wm)
    node.appendChild(des_node)
    document.getElementById("pic-list").appendChild(node)
  })



// -------------------------------------------------
// ----------------- 可见水印部分 -------------------




// ---------------- 不可见水印部分 ------------------
// -------------------------------------------------

// 存放施加了不可见水印之后的图片base64码
  let invisible_img_base64Str
  wmParams = {
    font: "microsoft yahei",
    textArray: ['191250024', '丁炳智', time],
    density: 3
  }

// ****** 不可见水印图片 *******

// 取得添加水印后的base64图片编码
  encodeImg(img.src, wmParams).then((result) => {
    let node = document.createElement("LI")
    let img_invisible_wm = document.createElement("IMG")
    img_invisible_wm.src = result
    invisible_img_base64Str = result
    // 加入图片描述
    let des_node = document.createElement("SPAN")
    des_node.innerText = "不可见水印示意（对含文本的像素点进行G通道扰动）"

    node.appendChild(img_invisible_wm)
    node.appendChild(des_node)
    document.getElementById("pic-list").appendChild(node)

    // ****** 数字水印示意 *******
    decodeImg(result).then((result_1) => {
      node = document.createElement("LI")
      let invisible_wm = document.createElement("IMG")

      // 取得添加水印后的base64图片编码
      invisible_wm.src = result_1
      // 加入图片描述
      des_node = document.createElement("SPAN")
      des_node.innerText = "数字水印示意（含当前时刻）"

      node.appendChild(invisible_wm)
      node.appendChild(des_node)
      document.getElementById("pic-list").appendChild(node)
    })
  })



// -------------------------------------------------
// ---------------- 不可见水印部分 ------------------
})
