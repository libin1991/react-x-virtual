## API

```ts
type TypeItemSizeHandler = Array<number> | Array<(idx: number):number>
type TypeSize = number | string
type TypeAlignment = 'auto' | 'start' | 'center' | 'end'
type TypeAlignTo = 'none' | 'top' | 'bottom'
```

### \<List /> API

|     | 属性                | 类型                | 默认值    | 是否必填 | 说明                                                                               |
| --- | ------------------- | ------------------- | --------- | -------- | ---------------------------------------------------------------------------------- |
| √   | itemCount           | number              | 0         | √        | 长列表有多少个 Cell                                                                |
| √   | scrollX             | boolean             | false     |          | 设置为横向滚动                                                                     |
| √   | scrollY             | boolean             | true      |          | 设置为竖向滚动                                                                     |
| √   | initialScrollIndex  | number              | 0         |          | 在列表初始化时即可指定显示的 index，避免初始化后再通过 scrollTo 系列方法产生的闪动 |
| √   | onScroll            | EventHandler        |           |          | 滚动时触发                                                                         |
| √   | scrollEventThrottle | number              | 10        |          | 指定滑动事件的回调频率，传入数值指定了多少毫秒(ms)组件会调用一次 scroll 回调事件   |
| √   | onStartScroll       | EventHandler        |           |          | 开始滚动时触发                                                                     |
| √   | onEndScroll         | EventHandler        |           |          | 结束滚动时触发                                                                     |
| √   | upperThreshold      | number              | 50        |          | 距顶部/左边多远时（单位 px），触发 scrolltoupper 事件                              |
| √   | onScrollToUpper     | EventHandler        |           |          | 滚动到顶部/左边                                                                    |
| √   | lowerThreshold      | number              | 50        |          | 距底部/右边多远时（单位 px），触发 scrolltolower 事件                              |
| √   | onScrollToLower     | EventHandler        |           |          | 滚动到底部/右边                                                                    |
| √   | initialRows         | number              | 5         |          | 在异步长列表实现中, 首次渲染多少行数据. 需要能覆盖显示区域                         |
| √   | scrollTo            | number              |           | √        | 滑动的距离                                                                         |
| √   | width               | TypeSize            |           | √        | (TaroLynx 配置) 容器宽度，当 scrollX 时必填                                        |
| √   | height              | TypeSize            |           | √        | (TaroLynx 配置) 容器高度，当 scrollY 时必填                                        |
| √   | itemSize            | TypeItemSizeHandler | [50, ...] | √        | (TaroLynx 配置) 列表子项高度配置                                                   |
| √   | estimatedItemSize   | number              | 50        |          | (TaroLynx 配置) 预估列表子项尺寸                                                   |
| √   | scrollToAlignment   | TypeAlignment       | 'auto'    |          | (TaroLynx 配置) 滚动对齐策略                                                       |

### \<Header /> API

|     | 属性   | 类型     | 默认值 | 是否必填 | 说明                           |
| --- | ------ | -------- | ------ | -------- | ------------------------------ |
| √   | width  | TypeSize |        | √        | Header 宽度，当 scrollX 时必填 |
| √   | height | TypeSize |        | √        | Header 高度，当 scrollY 时必填 |

### \<Footer /> API

|     | 属性   | 类型     | 默认值 | 是否必填 | 说明                           |
| --- | ------ | -------- | ------ | -------- | ------------------------------ |
| √   | width  | TypeSize |        | √        | Footer 宽度，当 scrollX 时必填 |
| √   | height | TypeSize |        | √        | Footer 高度，当 scrollY 时必填 |

### \<Section /> API

|     | 属性      | 类型   | 默认值 | 是否必填 | 说明                  |
| --- | --------- | ------ | ------ | -------- | --------------------- |
| √   | itemCount | number | 0      | √        | Section 有多少个 Cell |

### Row/Column API

|     | 属性         | 类型         | 默认值 | 是否必填 | 说明             |
| --- | ------------ | ------------ | ------ | -------- | ---------------- |
| √   | onNodeAppear | EventHandler |        |          | 节点可见时的回调 |

### ScrollToPosition

虚拟列表抛掷动画，调用方式如下：

```js
virtualListRef.current.scrollToPosition(/* params */);
```

Params 参数示意：

|     | 属性     | 类型        | 默认值 | 是否必填 | 说明                                                                                                   |
| --- | -------- | ----------- | ------ | -------- | ------------------------------------------------------------------------------------------------------ |
| √   | position | number      |        | √        | 取值范围：0 ~ itemCount。虚拟子节点 index （在包含多个 section 的情况下，不是 section 内的 itemIndex） |
| √   | smooth   | boolean     | false  | √        | 是否有平滑动画                                                                                         |
| √   | alignTo  | TypeAlignTo | 'none' | √        | 滚动后目标节点的对齐方式（默认对齐/顶部对齐/底部对齐）                                                 |

## 更多

如对实现感兴趣，可以参考我的博客：[浅谈虚拟列表实现与原理分析](https://www.yuque.com/sulirc/sea/ksli3t)
