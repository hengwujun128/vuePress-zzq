
# tricks and tips


## 1. handle assert import in xxx.vue?

```js
npm i --save-dev jest-transform-stub
```
```
"jest": {
  "transform": {
    ".+\\.(css|styl|less|sass|scss|png|jpg|svg|ttf|woff|woff2)$": "jest-transform-stub"
  }
}
```
## 2. how to test dependencies?

1. original file
```js
import clip from '../common/clipboard'
...
...
...
 handleCopy ($event) {
      const text = this.authorLink
      clip(text, $event, () => {
        this.handleSetToast('复制成功')
      }, () => {
        this.handleSetToast('复制失败')
      })
    }
```
2. dependency

import clip from '../common/clipboard'
```js
import Clipboard from 'clipboard'
export default function handleClipboard (text, event, succCb, errCb) {
  const clipboard = new Clipboard(event.target, {
    text: () => text
  })
  clipboard.on('success', () => {
    // clipboardSuccess()
    succCb && succCb()
    clipboard.destroy()
  })
  clipboard.on('error', () => {
    // clipboardError()
    errCb && errCb()
    clipboard.destroy()
  })
  clipboard.onClick(event)
}
```

## 3. how to mock window object?

1. 在 window 对象新增属性
```
 Object.defineProperty(window, 'VIGOR_WALLPAPER', {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      OnShow: jest.fn(),
      OnStateChange:jest.fn()
    })),
  });
```
:::tip
Mocking methods which are not implemented in JSDOM
:::

```js
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```
2. 可以把 window 对象的 mock 单独抽离到一个文件中
```js
import './matchMedia.mock'; // Must be imported before the tested file
import {myMethod} from './file-to-test';

describe('myMethod()', () => {
  // Test the method here...
});
```
## 4. 事件测试传参数

```html
<div
  v-show="play"
  class="user-info"
  :data-uid="data.author_uid"
  @click="handleViewAuthor"
>
```
```js
 handleViewAuthor ($event) {
      const $target = $event.currentTarget
      const uid = +$target.dataset.uid
      if (uid) {
        this.$router.push({
          path: '/authorPersonalPage',
          query: {
            uid,
            t: Date.now()
          }
        })
      }
    },
```
case:
- btn.element.dataset.uid = 123
```js
 test('should trigger handleViewAuthor correctly', async() => {
    await wrapper.setData({
      cachedVideo: 'blob:xxx'
    })
    await wrapper.setProps({play: true})
    const btn = wrapper.find('.user-info')
    btn.element.dataset.uid = 123
    await btn.trigger('click')
    expect($router.push).toHaveBeenCalledTimes(1)
  });
```

## important code
- AuthorWallpaperItem
- RanklistCarouselItem
- creationList
- 

