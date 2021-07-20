## pdf-zoom
手机端手指控制pdf的放大缩小
### 原理
将pdf渲染成canvas（不支持选中文字等操作），然后通过控制div的transform：scale()来控制放大缩小。
### 问题
如果图片不够清晰，可通过调整默认的放大倍数来调整，默认放大倍数越大，放大时越清晰。
### 使用
详见样例[demo](https://midcu.github.io/pdf-zoom)
```
var mPdfZoom = {};
pdfZoom.call(mPdfZoom, 'main-container', {
    pdfUrl: "./09.pdf",// pdf地址
    scale: 5  // 最大放大倍数
});
```