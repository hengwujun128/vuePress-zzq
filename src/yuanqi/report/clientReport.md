# 调用客户端 API 上报

## 1. 上报流程的思路

::: tip
**step one** (bridge.js): 首先,通过调用客户端方法 onreport 进行埋点
:::

```js
/**
 * 上报
 * @param {object} data 表名
 * @param {string} data.table 表名
 * @param {object} data.info 数据
 */
export const onreport = (data) => {
  console.log('onreport:', data)
  const params = {
    table: data.table,
    info: data.info,
  }
  return client('onreport', params)
}
```

::: tip
**step two**(collectClient.js): 然后,是定义上报数据,封装上报方法
:::

```js
/**
 * 超级桌面：锁屏上报
 *
 */
const collectLockScreenMap = {
  action: 'byte', //1、展示选择弹窗 5、选中弹窗某专题/分类 6、反选弹窗某专题/分类 7、点击弹窗“开启自动锁屏” 8、点击弹窗“暂停自动锁屏”
  open_scene: 'byte', //1、超级桌面 2、锁屏界面——设置中心 3、锁屏界面——精选主题
  tab_all: 'string', // action=7、8、9时上报所选专题
  tab_action: 'string', // action=5、6时上报操作专题
}
export const collectLockScreen = (params = {}) => {
  const dat = 'desktop_yuanqi_wallpaper_lockscreen_setup'
  const data = Object.assign(
    {
      action: 0,
      open_scene: 0,
      tab_all: '',
      tab_action: '',
    },
    params
  )
  parseData(data, collectLockScreenMap)

  onreport({
    table: dat,
    info: data,
  })
}
```

:::tip
**step three**(collect.js): 在此对 collectClient.js 中的方法进行再次的封装,只是改变了函数名称
:::

```js
import {
  collectMainPageClick as collectMainPageClickClient,
  collectOtherPageClick as collectOtherPageClickClient,
  collectChargeResult as collectChargeResultClient,
  collectVipChargeResult as collectVipChargeResultClient,
  collectAutoOpen as collectAutoOpenClient,
  collectMyWallpaper as collectMyWallpaperClient,
  collectSearchpageBehavior as collectSearchpageBehaviorClient,
} from '../common/collectClient'

...
...
...
export const collectMyWallpaper = (params = {}) => {
  collectMyWallpaperClient(params)
}

export const collectSearchpageBehavior = (params = {}) => {
  collectSearchpageBehaviorClient(params)
}
```

:::tip
**step four**(some component): 这一步,才是最后的调用进行上报;

eg: staticDetail.vue
:::

```vue
<script>
import {
  collectMainPageClick,
  collectOtherPageClick,
  collectAutoOpen,
} from '../common/collect'

export default {
  data() {
    return {
      //
    }
  },
  methods: {
    // 这里最后一次再次对 collect.js 中的方法进行了封装
    collectMainPageClick(params) {
      collectMainPageClick(
        Object.assign(
          {
            current_page: 2,
            current_sort: this.cateId,
            current_label: this.tagId || ZERO_NUM,
            pic_id: this.data.id || this.data.wid,
            pic_type: 1,
          },
          params
        )
      )
    },
  },
}
</script>
```

::: warning
以上只是针对一般上报方法的封装流程,如:collectMainPageClick,collectOtherPageClick,collectChargeResult
有些上报流程还要多一步,更复杂多一点,如:collectMyWallpaper,collectSearchpageBehavior

:::

1. 首先在 common/report 目录下新建单独的上报文件,如 reportCreation.js,reportSearchCenter.js
2. 在 该文件中 引入 **step three** 中的方法,并封装
3. 最后是 进行**step four** 的流程

```js
import {
  collectMyWallpaper
} from '../../common/collect'

...
...
...

export const reportCreationShow = (params = {}) => {
  collectMyWallpaper({
    action: 1,
    ...defaultParams,
    ...parseCommonData(params)
  })
}

export const reportCreationSetWallpaper = (params = {}) => {
  collectMyWallpaper({
    action: 2,
    ...defaultParams,
    ...parseCommonData(params)
  })
```

## 2. 上报方法论

1. 一次定义
2. 两步分装
