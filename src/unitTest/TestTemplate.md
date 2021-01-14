# 2. common boilerplate


### 1.Reducing duplicated code in your test

> 我在写vue 单元测试的时候,经常会从上个测试文件 copy 测试代码到要测试的文件, 随着APP 越来越大和越复杂,组件中会有不同的 properties,third party code ,例如,elementUI,vuex,vue-router等 ,这就造成了要测试代码中很多重复的代码,而且 copy 的测试代码与当前的测试没有直接的关系

- 如何在 测试用例中编写 vuex 代码
- 如何在 测试用例中编写 vuer-router 代码
- 如何在 测试用例中编写通用的 boilerplate 代码

## 1. 从一个 component 开始

- props: message 如果传入,就在模板中显示
- vuex: 根据 vuex 中的 authenticated 显示和隐藏 button
- vuex: 根据 vuex 中的 posts 展示列表
- vue-router: template 中使用 vue-link

```vue
<template>
  <div>
    <div id="message" v-if="message">{{ message }}</div>

    <div v-if="authenticated">
      <router-link 
        class="new-post" 
        to="/posts/new"
      >
        New Post
      </router-link>
    </div>

    <h1>Posts</h1>
    <div 
      v-for="post in posts" 
      :key="post.id" 
      class="post"
    >
      <router-link :to="postLink(post.id)">
        {{ post.title }}
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Posts',
  props: {
    message: String,
  },

  computed: {
    authenticated() {
      return this.$store.state.authenticated
    },

    posts() {
      return this.$store.state.posts
    }
  },

  methods: {
    postLink(id) {
      return `/posts/${id}`
    }
  }
}
</script>
```

### 1. 要测试的点

- 断言message 的渲染(props is given)
- 断言state 的posts  是否正确渲染
- 断言当 state 的 authenticated is true 和 false 时候,按钮的行为

## 2. Vuex/VueRouter Factory Functions

::: tip
1. 通常,为了测试方便,为Vuex和VueRouter导出一个工厂函数是很有必要的
:::

```js
// store.js
export default new Vuex.Store({...})

// router.js
export default new VueRouter({...})
```
> regularly, 对于一般的应用程序非常好,但是对于写测试用例就不太合适,如果这样做,每次在测试用例中用 store 和 router时,它们同时也会被其它的测试用例共享(当其它测试用例也 import and use ),ideally 的做法,是每个测试用例 用一个独立的store 和 router

::: tip
2. 解决方法是导出一个工厂函数,函数内部 return a  instance
:::

```js
// store.js
export const store = new Vuex.Store({...})
export const createStore = ()=>{
  return new Vuex.Store({...})
}

// router.js

export default new VueRouter({...})
export const createRouter = ()=>{
  return new VueRouter({...})
}
```
> 在源码文件中: import { store } from './store.js';在每个测试文件中用 import {createStore} from './store.js',然后 创建一个实例: const store = createStore();同样 router 测试也一样

#### 注:createStore 和 createRouter 可以单独抽离出一个文件createStore.js,createRouter.js
## 3. 编写测试用例

```js
// third-party library
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import { mount, createLocalVue } from '@vue/test-utils'

import Posts from '@/components/Posts.vue'
import { createRouter } from '@/createRouter'
import { createStore } from '@/createStore'

describe('Posts.vue', () => {
  it('renders a message if passed', () => {
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    localVue.use(Vuex)

    const store = createStore()
    const router = createRouter()
    const message = 'New content coming soon!'
    const wrapper = mount(Posts, {
      propsData: { message },
      store, router,
      // localVue
    })

    expect(wrapper.find("#message").text()).toBe('New content coming soon!')
  })

  it('renders posts', async () => {
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    localVue.use(Vuex)

    const store = createStore()
    const router = createRouter()
    const message = 'New content coming soon!'

    const wrapper = mount(Posts, {
      propsData: { message },
      store, router,
      // localVue
    })
    //  通过vm.$store 去触发 commit
    wrapper.vm.$store.commit('ADD_POSTS', [{ id: 1, title: 'Post' }])
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.post').length).toBe(1)
  })
})

```
> issue1: 代码重复
```js
const localVue = createLocalVue()
localVue.use(VueRouter)
localVue.use(Vuex)

const store = createStore()
const router = createRouter()
```
封装成一个函数
```js
// encapsulated
const createTestVue = () => {
  const localVue = createLocalVue()
  localVue.use(VueRouter)
  localVue.use(Vuex)

  const store = createStore()
  const router = createRouter()
  //  因为需要把 store,router localVue 传递给 mount 函数,所以要return 出去
  return { store, router, localVue }
}
```
使用:

```js
it('renders a message if passed', () => {
  // 对 store ,router ,localVue的封装,确保每个测试用例是唯一
  const { localVue, store, router } = createTestVue()
  const message = 'New content coming soon!'
  const wrapper = mount(Posts, {
    propsData: { message },
    store,
    router,
    localVue
  })

  expect(wrapper.find("#message").text()).toBe('New content coming soon!')
})
```
Let's refactor second test, which makes use of the of Vuex store.
```js
it('renders posts', async () => {
  const { localVue, store, router } = createTestVue()
  const wrapper = mount(Posts, {
    store,
    router,
  })

  wrapper.vm.$store.commit('ADD_POSTS', [{ id: 1, title: 'Post' }])
  //  wrapper.vm.$nextTick() 
  await wrapper.vm.$nextTick()

  expect(wrapper.findAll('.post').length).toBe(1)
})
```
## 4.更进一步: 
### Defining a createWrapper method

::: tip
每个测试用例中的 wrapper 都是独一无二的,beforeEach()可以实现
:::

```js
// 
const createWrapper = (component, options = {}) => {
  const { localVue, store, router } = createTestVue()
  return mount(component, {
    store,
    router,
    localVue,
    ...options
  })
}
```
refactor testing
```js
it('renders a message if passed', () => {
  const message = 'New content coming soon!'
  const wrapper = createWrapper(Posts, {
    propsData: { message },
  })

  expect(wrapper.find("#message").text()).toBe('New content coming soon!')
})

it('renders posts', async () => {
  const wrapper = createWrapper(Posts)

  wrapper.vm.$store.commit('ADD_POSTS', [{ id: 1, title: 'Post' }])
  await wrapper.vm.$nextTick()

  expect(wrapper.findAll('.post').length).toBe(1)
})
```

## 5.Setting the Initial Vuex State

### 1. 重构 createStore() ,让其接收初始化的 state 对象
```js
// createStore.js
const createStore = (initialState = {}) => new Vuex.Store({
  state: {
    authenticated: false,
    posts: [],
    ...initialState
  },
  mutations: {
    // ...
  }
})
export { createStore }

```

### 2. 重构 createWrapper ,让每个测试用例能够传入自己色 state

```js
const createWrapper = (component,options={},storeState={})=>{
  const localVue = createLocalVue()
  localVue.use(VueRouter)
  localVue.use(Vuex)
  // 传入 state
  const store = createStore(storeState)
  const router = createRouter()

  return mount(component, {
    store,
    router,
    localVue,
    ...options
  })
}
```
Now our test now can be written as follows:

```js
it('renders posts', async () => {
  // 每个测试用例可以设置自己的 state
  const wrapper = createWrapper(Posts, {}, {
    posts: [{ id: 1, title: 'Post' }]
  })

  expect(wrapper.findAll('.post').length).toBe(1)
})

```







