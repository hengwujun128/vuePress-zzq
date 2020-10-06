# 调用服务端 API 上报

## 1. 上报流程

:::tip
**服务端上报主要是通过:调用后端 api 的形式进行,这里总结一下步骤和封装的流程**
:::

1.  util.js 中封装 sendDiReport() 方法,在 component 中直接使用
2.  diReport()就是调用后端 api 的封装,后端目前只提供三个接口统计上报:用户行为上报(diReport),下载量上报(doDownloadReport),壁纸浏览量上报(doScanReport)
3.  调用服务端接口上报,都已封装完成,只需在组件中 import sendDiReport 这个方法即可

```js
import { diReport } from '../apis/serverReport'

export function sendDiReport({
  // eslint-disable-next-line camelcase
  open_id,
  pos,
  wid,
  items,
  scene,
  exp,
  action = 'view',
}) {
  const TIMESTAMP_GAP = 1000
  const ts = parseInt(Date.now() / TIMESTAMP_GAP, 10)
  const sign = hmacMd5(`${APPKEY}${ts}`).toString()
  let metrics = {}
  if (!items && !pos) {
    return
  }
  if (action === 'view') {
    metrics = {
      view: 1,
    }
  } else if (action === 'set_wp') {
    metrics = {
      set_wp: 1,
    }
  }
  if (!items) {
    items = [
      {
        item_id: `${wid}`,
        scene,
        action,
        pos: pos,
        metrics,
        exp,
      },
    ]
  }
  diReport({
    common: {
      appid: 'pcwallpaper',
      // eslint-disable-next-line camelcase
      uid: open_id || '',
      sign,
      ts,
      platform: 'browser',
      brand: 'chrome',
      ver: 'v1',
    },
    items,
  })
}
```

4. 组件中的调用

```vue
<script>
...
setDiReport ($event) {
     const wid = +$event.currentTarget.dataset.id
     const sdata = $event.currentTarget.dataset.sdata
     const pos = $event.currentTarget.dataset.pos
     // eslint-disable-next-line camelcase
     const pos_exact = $event.currentTarget.dataset.posExact
     const report = $event.currentTarget.dataset.report
     const ptype = +$event.currentTarget.dataset.ptype

     if (report) {
       return
     }

     $event.currentTarget.dataset.report = true
     sendDiReport({
       open_id: this.common.open_id,
       scene: 'dynamic_cat_list',
       wid,
       pos,
       action: 'set_wp',
       exp: {
         sdata,
         ptype,
         pos_exact
       }
     })
   }
</script>
```

::: warning
服务端上报的接口使用了签名,但是签名的 key 直接写在代码里,不是个好的 idea,一般类似的 password,secret,signature,包括 appId 不应该直接写在代码里
:::

```

src/common/config.js:
  4  // 用于服务端热度上报签名
  5: export const APPKEY = 'ffRctbwkjlmUk79abf8261sadkl12988'
  6

src/common/util.js:
    7  import { genCode } from '../apis/user'
    8: import { isDaily, APPKEY } from '../common/config'
    9  import { diReport } from '../apis/serverReport'

  631    const ts = parseInt(Date.now() / TIMESTAMP_GAP, 10)
  632:   const sign = hmacMd5(`${APPKEY}${ts}`).toString()
  633    let metrics = {}

```
