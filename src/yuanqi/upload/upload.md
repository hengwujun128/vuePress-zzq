# 壁纸上传

## 说明:

> 1.壁纸上传涉及到大文件上传,包括 image,MP4的上传,rar 的上传,上传大小可以超过 100M,以往的上传方式,会出现卡顿,等待,体验不是太好

> 2.壁纸上传是壁纸项目中一个很重要的模块功能,很多地方用到,而且代码量很大,了解这块功能实现逻辑很有必要



## 动态壁纸上传涉及点


| Issues |  Description                                     |
| ------------ | :--------------------------------------------------- |
| 如何上传指定格式文件    | 动态壁纸支持视频文件,静态壁纸支持图片文件,UP 主认证支持 rar文件|
| 如何上传指定分辨率视频文件| 视频文件满足分辨率达到 1920 * 1080; 图片文件满足 720*1280 |
| 如何控制上传视频文件大小| 如规定文件大小100M             |
| 如何对大文件进行分割     |对于大文件,采用分块上传,                      |
| 如何避免重复上传  | 对于图片服务器,已经存在的文件,可以不用再次上传,避免重复上传 |

::: tip
如何上传指定格式文件?
:::
```js
if (!file.name || !(/\.mp4$/gi).test(file.name)) {
        Dialog.alert({
          message: '文件格式不合法,请上传MP4格式文件!',
        }).then(() => {
          closePage()
        })
        return
      }
```
::: tip
如何上传指定分辨率视频文件
:::
- 首先要获取 file 代表的文件对象
- 动态创建 video 元素,并监听其onloadedmetadat事件
- 利用函数 URL.createObjectURL(file) 把返回值传给 video.src,进而触发事件
- 在事件处理程序中解构出videoWidth,videoHeight 属性,进而判断
```js
 checkVideoWidthHeight (file) {
      const $video = document.createElement('video')
      try {
        return new Promise((resolve /*, reject */) => {
          $video.onloadedmetadata = () => {
            const { videoWidth, videoHeight } = $video
            if (videoWidth === 0 || videoHeight === 0) {
              resolve(true)
              return
            }
            if (
              videoWidth >= this.videoWidth &&
              videoHeight >= this.videoHeight
            ) {
              resolve(true)
              return
            }

            resolve(false)
          }

          $video.onerror = () => {
            resolve(true)
          }

          try {
            $video.src = URL.createObjectURL(file)
          } catch (err) {
            resolve(true)
          }
        })
      } catch (err) {
        return true
      }
    },

```

:::tip
如何控制上传视频文件大小
:::
这个比较简单,就是通过 file 的 size 进行判断
```js
  if (file.size > this.fileMaxSize) {
        Dialog.alert({
          message: '上传的视频不能超过 50M',
        }).then(() => {
          closePage()
        })
        return
      }
```

:::tip
如何对大文件进行分割
:::

- 首先要使用FileReader对象对 file 进行格式转换;转换成 ArrayBuffer对象
- 目的是把 file对象,转成小块的 buffer,然后保存到数组中;fileReader.readAsArrayBuffer
- 每个 buffer 大小可以自定义,这里是 2M;每次转换2M,存入数组中

```js
const chunkSize = this.chunkSize // chunk 大小
      const chunks = Math.ceil(file.size / chunkSize) // chunk 数量
      let currentChunk = 0 //
      const spark = new SparkMD5.ArrayBuffer()
      const fileReader = new FileReader()
      const fileData = []
      // fileReader 监听
      fileReader.onload = async (e) => {
        // console.log('read chunk nr', currentChunk + 1, 'of', chunks)
        spark.append(e.target.result)
        fileData.push(e.target.result)
        currentChunk++
        if (currentChunk < chunks) {
          loadNext()
        } else {
          // console.log('finished loading', spark.end())
          const md5 = spark.end()
          if (await this.checkMd5(md5)) {
            // todo： 如果已经上传过该视频，这个接口就不会调用
            this.multipartUpload(md5, file, fileData)
          }
        }
      }
      // trigger fileReader.onload
      function loadNext () {
        const start = currentChunk * chunkSize
        const end =
          start + chunkSize >= file.size ? file.size : start + chunkSize
        // fileReader 每次读取2M
        fileReader.readAsArrayBuffer(blobSlice.call(file, start, end))
      }

      loadNext()
```
:::tip
如何避免重复上传
:::

- 借助 md5函数,每个文件(视频,图片等)产生一个 md5 值
- 在上传之前,检查服务器中是否有这个图片,如果有,就返回已经上传的图片地址
- 好处是避免重复上传,减少图片服务器资源浪费
- 这里关键是利用spark-md5,把每个 buffer 放入到 spark 中,分块完成,则当前文件形成一个 md5值
- 然后就可以拿这个 md5 去请求服务器,判断是否存在

```js
 fileReader.onload = async (e) => {
        // console.log('read chunk nr', currentChunk + 1, 'of', chunks)
        spark.append(e.target.result)
        fileData.push(e.target.result)
        currentChunk++
        if (currentChunk < chunks) {
          loadNext()
        } else {
          // console.log('finished loading', spark.end())
          const md5 = spark.end()
          if (await this.checkMd5(md5)) {
            // todo： 如果已经上传过该视频，这个接口就不会调用
            this.multipartUpload(md5, file, fileData)
          }
        }
      }
```


#### 未完,待续(如何计算上传进度,如何计算上传速率等用户体验的问题,下次补上)






