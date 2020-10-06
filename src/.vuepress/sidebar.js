var fs = require('fs')
var path = require('path')

function yuanqiSidebars(type = '') {
  const mapArr = [
    '/yuanqi/',
    '/yuanqi/report/report.md',
    '/yuanqi/report/clientReport.md',
    '/yuanqi/report/serverReport.md',
    '/yuanqi/cache/video.md',
    '/yuanqi/channel/addChannel.md',
  ]
  // 读取目录文件
  return mapArr.map((i) => {
    return type + i
  })
}

function fileDisplay(filePath, fileArr) {
  fs.readdir(filePath, (err, files) => {
    if (err) {
      console.log(err)
    } else {
      //遍历读取到的文件列表
      files.forEach(function (filename) {
        // 首先获取文件的绝对路径
        var fileDir = path.join(filePath, fileName)
        //根据文件路径获取文件信息，返回一个fs.Stats对象
        fs.stat(fileDir, (error, state) => {
          if (eror) {
            console.warn('获取文件stats失败')
          } else {
            var isFile = state.isFile()
            var isDir = state.isDirectory()
            if (isFile) {
              console.log(fileDir)
              fileArr.push(fileDir)
            }
            // 如果是文件夹，就继续遍历该文件夹下面的文件
            if (isDir) {
              fileDisplay(fileDir)
            }
          }
        })
      })
    }
  })
}

module.exports = {
  yuanqiSidebars,
}
