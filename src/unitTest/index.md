# 1. 理解 Jest Mocks

## 1. The Mock Functions

the mock function 提供了三种特性

1. 捕获调用
2. 设置返回值
3. 改变内部实现

> 1.捕获调用
```js
test("returns undefined by default", () => {
  const mock = jest.fn();

  let result = mock("foo");

  expect(result).toBeUndefined();
  expect(mock).toHaveBeenCalled();
  expect(mock).toHaveBeenCalledTimes(1);
  expect(mock).toHaveBeenCalledWith("foo");
});
```
> 2.mock实现
```
test("mock implementation", () => {
  const mock = jest.fn(() => "bar");

  expect(mock("foo")).toBe("bar");
  expect(mock).toHaveBeenCalledWith("foo");
});

test("also mock implementation", () => {
  const mock = jest.fn().mockImplementation(() => "bar");

  expect(mock("foo")).toBe("bar");
  expect(mock).toHaveBeenCalledWith("foo");
});
```
> 3.mock 返回值
```
test("mock return value", () => {
  const mock = jest.fn();
  mock.mockReturnValue("bar");

  expect(mock("foo")).toBe("bar");
  expect(mock).toHaveBeenCalledWith("foo");
});

test("mock promise resolution", () => {
  const mock = jest.fn();
  mock.mockResolvedValue("bar");

  expect(mock("foo")).resolves.toBe("bar");
  expect(mock).toHaveBeenCalledWith("foo");
});
```
## 2.Dependency Injection

```
const doAddd = function (x,y,callback)=>{
  callback(x+y)
}

test("calls callback with arguments added", () => {
  const mockCallback = jest.fn();
  doAdd(1, 2, mockCallback);
  expect(mockCallback).toHaveBeenCalledWith(3);
});
```
## 3.Mocking Modules and Functions

- jest.fn: mock a function
- jest.mock: mock a module
- jest.spyOn: spy or mock a function

#### demo 理解一下
```
├ example/
| └── app.js
| └── app.test.js
| └── math.js
```
math.js
```
export const add      = (a, b) => a + b;
export const subtract = (a, b) => b - a;
export const multiply = (a, b) => a * b;
export const divide   = (a, b) => b / a;
```

app.js
```
import * as math from './math.js';

export const doAdd      = (a, b) => math.add(a, b);
export const doSubtract = (a, b) => math.subtract(a, b);
export const doMultiply = (a, b) => math.multiply(a, b);
export const doDivide   = (a, b) => math.divide(a, b);
```
#### 1. 首先用 jest.fn 去 mock

```js
import * as app from "./app";
import * as math from "./math";

math.add = jest.fn();
math.subtract = jest.fn();

test("calls math.add", () => {
  app.doAdd(1, 2);
  expect(math.add).toHaveBeenCalledWith(1, 2);
});

test("calls math.subtract", () => {
  app.doSubtract(1, 2);
  expect(math.subtract).toHaveBeenCalledWith(1, 2);
});
```
jest.fn 以这种方式可以实现测试,但是有更好的方式
- jest.mock 能够在一个模块中自动实现mock 函数的功能
- jest.spyOn 不仅能够实现 mock 函数功能还能恢复函数的原始功能

#### 2. mock a module with jest.mock

```js
import * as app from "./app";
import * as math from "./math";

// Set all module functions to jest.fn
jest.mock("./math.js");

test("calls math.add", () => {
  app.doAdd(1, 2);
  expect(math.add).toHaveBeenCalledWith(1, 2);
});

test("calls math.subtract", () => {
  app.doSubtract(1, 2);
  expect(math.subtract).toHaveBeenCalledWith(1, 2);
});
```
::: tip
**注意:** jest.mock("./math.js") 等同于 set math.js to:
:::

```js
export const add      = jest.fn();
export const subtract = jest.fn();
export const multiply = jest.fn();
export const divide   = jest.fn();
```
#### 3. mock a function with jest.spyOn

::: warning
**jest.mock()缺陷** 就是不能访问函数的原始实现.
有时我们想观察一个函数调用,但是同时又想保留函数的原始实现;有时候想 mock 函数实现,但是在其它的测试用例中使用原始的函数实现
:::
针对以上的这些情况,我们应该用jest.spyOn.
```js
import * as app from "./app";
import * as math from "./math";

test("calls math.add", () => {
  const addMock = jest.spyOn(math, "add");

  // calls the original implementation
  expect(app.doAdd(1, 2)).toEqual(3);

  // and the spy stores the calls to add
  expect(addMock).toHaveBeenCalledWith(1, 2);
});
```
先 mock实现, 然后用原始实现
```js
import * as app from "./app";
import * as math from "./math";

test("calls math.add", () => {
  const addMock = jest.spyOn(math, "add");

  // override the implementation
  addMock.mockImplementation(() => "mock");
  expect(app.doAdd(1, 2)).toEqual("mock");

  // restore the original implementation
  addMock.mockRestore();
  expect(app.doAdd(1, 2)).toEqual(3);
});
```
::: tip
jest.spyOn 是 jest.fn()的语法糖,能够通过 jest.fn() 实现 jest.spyOn 功能
:::

- **store** the original implementation
- mock add with the original implementation
- spy the calls to add
- override the implementation
- restore the original implementation

```js
import * as app from "./app";
import * as math from "./math";

test("calls math.add", () => {
  // store the original implementation
  const originalAdd = math.add;

  // mock add with the original implementation
  math.add = jest.fn(originalAdd);

  // spy the calls to add
  expect(app.doAdd(1, 2)).toEqual(3);
  expect(math.add).toHaveBeenCalledWith(1, 2);

  // override the implementation
  math.add.mockImplementation(() => "mock");
  expect(app.doAdd(1, 2)).toEqual("mock");
  expect(math.add).toHaveBeenCalledWith(1, 2);

  // restore the original implementation
  math.add = originalAdd;
  expect(app.doAdd(1, 2)).toEqual(3);
});
```













