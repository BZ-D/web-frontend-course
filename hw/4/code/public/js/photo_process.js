/**
 * LenaJS
 * 锐化：gaussian
 * 老照片：grayscale
 * 明艳：saturation
 * 负片：invert
 * 复古：sepia
 * 鲜红：red
 */

$(function () {
  // 进入二级页面后，显示出上一页面中点击的图片
  const photoPath = decodeURI(location.search.substr(11))
  const originalImage = document.getElementById('original-image')
  const realImage = document.getElementById('real-image')
  originalImage.setAttribute('src', photoPath)
  realImage.setAttribute('src', photoPath)

  // 默认展示“复古”效果
  realImage.onload = () => {
    let filteredImageCanvas = addSimpleFilter(realImage, 'sepia')
    filteredImageCanvas.style.display = 'none'

    let processArea = document.getElementsByClassName('process-area')
    processArea[0].appendChild(filteredImageCanvas)

    // 将添加滤镜的图像插入到DOM中
    filteredImageCanvas.style.width = '100%'
    filteredImageCanvas.style.height = '100%'
    filteredImageCanvas.style.display = 'inherit'

    $('.btn-area').show()
  }

  $('.filter-btn').click(function () {
    handleChangeSimpleFilter($(this), realImage)
  })

  $('.tailor-btn').click(function () {
    location.href = `/tailor?photoName=${photoPath}`
  })

  $('.more-filters-btn').click(function () {
    $(this).css('display', 'none')
    $('.tailor-btn').css('display', 'none')
    handleMoreOperations()

    Caman('#caman-canvas', photoPath, function () {
      this.render()
    })

    document.getElementById('caman-canvas').style.display = 'inherit'
    document.getElementsByClassName('more-pick')[0].style.display = 'block'
    document.getElementById('more-operations').style.display = 'flex'
  })

  $('input[type=range]').on('input', function () {
    // 范围条实时更新数值
    let realVal = $(this).val()
    $(this).next().text(realVal)
  })

  $('#check-btn').click(function () {
    handleFilterSetting(photoPath)
    $('#check-btn').text('预览效果')
  })
})

function addSimpleFilter(imgSrc, filterName) {
  let filteredImageCanvas = document.createElement('canvas')
  filteredImageCanvas.setAttribute('id', 'lena-canvas')
  let filter = LenaJS[filterName]
  LenaJS.filterImage(filteredImageCanvas, filter, imgSrc)
  return filteredImageCanvas
}

function handleChangeSimpleFilter(clickBtn, realImage) {
  // 将之前按钮恢复默认色
  $('.picked').removeClass('picked')

  // 滤镜操作
  // 选取了哪种滤镜
  let chooseText = clickBtn.text()
  let filterChosen = ''
  if (chooseText.indexOf('复古') !== -1) {
    filterChosen = 'sepia'
  } else if (chooseText.indexOf('锐化') !== -1) {
    filterChosen = 'gaussian'
  } else if (chooseText.indexOf('老照片') !== -1) {
    filterChosen = 'grayscale'
  } else if (chooseText.indexOf('负片') !== -1) {
    filterChosen = 'invert'
  } else if (chooseText.indexOf('明艳') !== -1) {
    filterChosen = 'saturation'
  } else if (chooseText.indexOf('鲜红') !== -1) {
    filterChosen = 'red'
  }

  // 开始转换
  // 将上一张滤镜图删掉
  $('canvas').remove()

  let filteredImageCanvas = addSimpleFilter(realImage, filterChosen)
  filteredImageCanvas.style.display = 'none'

  let processArea = document.getElementsByClassName('process-area')
  processArea[0].appendChild(filteredImageCanvas)

  // 将添加滤镜的图像插入到DOM中
  filteredImageCanvas.style.width = '100%'
  filteredImageCanvas.style.height = '100%'
  filteredImageCanvas.style.display = 'inherit'

  $('.btn-area').show()

  // 选中当前按钮，按钮变色
  clickBtn.addClass('picked')
}

function handleMoreOperations() {
  // 按下更多操作按钮
  $('h2').text('更多操作')
  $('.pick').css('display', 'none')
  $('#lena-canvas').remove()

  let ranges = $('input[type=range]')
  let values = $('.filter-value')
  for (let i = 0; i < ranges.length; i++) {
    values.eq(i).text(ranges.eq(i).val())
  }
}

function handleFilterSetting(photoPath) {
  $('#check-btn').text('渲染中')

  Caman('#caman-canvas', photoPath, function () {
    this.revert(false)
    let ranges = $('input[type=range]')
    for (let i = 0; i < ranges.length; i++) {
      let setParam = ranges.eq(i).attr('id')
      let filterVal = ranges.eq(i).val()

      if (setParam === 'brightness') this.brightness(filterVal)
      else if (setParam === 'contrast') this.contrast(filterVal)
      else if (setParam === 'saturation') this.saturation(filterVal)
      else if (setParam === 'exposure') this.exposure(filterVal)
      else if (setParam === 'hue') this.hue(filterVal)
      else if (setParam === 'sepia') this.sepia(filterVal)
      else if (setParam === 'noise') this.noise(filterVal)
    }

    this.render()
  })
}
