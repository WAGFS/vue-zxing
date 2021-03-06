# vue-zxing

基于zxing-js/library插件封装的vue组件，组件可以扫描解析二维码、条形码。

**注意：**

* **请尽可能的在https域名下调用组件，在http域名下只能是localhost或者是127.0.0.1，其他域名会导致相机唤醒失败。**
* **请在可调取摄像头的设备上使用组件。**
* **通过浏览器调用的摄像头清晰度可能并没有您想象的那么高，您可能需要将设备离要扫描的二维码或条形码足够近相机才能正确对焦并识别。**
* **您可以使用具有摄像头的设备通过访问 [https://wagfs.github.io/Barcode-Dom/](https://wagfs.github.io/Barcode-Dom/)这个地址来查看示例（该示例暂无选择图片识别功能） 。**

[zxing-js/library](https://github.com/zxing-js/library) 's wrapper for Vue.js

# Installtion

## npm

``` bash
npm i vue-zxing
```

# Basic Example

```
<template>
  <div>
    <v-zxing :success="success"></v-zxing>
  </div>
</template>

<script>
import Vue from 'vue'
import VueZxing from 'vue-zxing';

Vue.use(VueZxing);

export default {
  name: 'VueBarcodeTest',
  methods: {
    success(codeText){
    console.log(codeText)
    }
  }
}
</script>
```

# Usage

## Props

### `parseType`:String

`parseType`决定使用相机模式📷还是静态文件📕模式，相机模式会调起手机后置摄像头，对准二维码或条形码即可解析，静态文件模式则是让用户手动选择需要解析的图片（一般来说这种模式准确率更高一点），默认为相机模式。

` parseType:'Camera' | 'Image' `





### `inputId`:String

如果选择使用静态文件📕模式，那么可以传入一个input的id，这个input类型需要是file类型，如果不传入id则采用组件默认的input。





### `showDefaultInput`:Boolean

如果不想要默认的input框展示可以传入`showDefaultInput`,然后通过组件下的`parseStaticImg`方法传入图片路径来获取解析后的值。





### `showScanBox`:Boolean

在相机📷模式下，默认会展示一个扫描框（条形码），和提示文字，如果不需要的话，可以传入`showScanBox:false`。



### `showToggleBtn`:Boolean

是否展示切换镜头图标，用于切换前置摄像头和后置摄像头。



### `videoWidth`:Number

设置相机的宽度，默认为100vw。





### `videoHeight`:Number

设置相机高度，默认为100vh。





### `scanBoxWidth`:Number

设置扫描框宽度，默认为70%。





### `scanBoxWidth`:Number

设置扫描框高度，默认为20%。





### `success`:Function(codeText)

解析成功后的回调，`codeText`为解析后的结果字符，默认会当作success回调的第一个参数传递进去，并使用alert将成功结果弹出。





### `fail`:Function(error)

解析失败后的回调，`error`为解析失败后的错误对象，默认会当作fail回调的第一个参数传递进去，并使用alert将失败原因弹出。





### `getVideoFail`:Function(error)

调取用户摄像头失败后的回调，`error`为解析失败后的错误对象，默认会当作getVideoFail回调的第一个参数传递进去，并使用alert将失败原因弹出。



## slot

### #default

组件内设有默认插槽，当模式为相机📷模式时，默认会有一个扫描框和提示文字，可查看 上文showScanBox属性。





### #other

用户可以通过使用other插槽来添加自己想要的一些ui。





### #header

头部工具栏，默认具有切换镜头工具和刷新工具（有些机型切换到后台再返回页面视频流会卡住）。切换镜头可调用组件下的`decodeOnceFromConstraintsFunc`方法，必须传入一个参数指定切换前置（`{ video: { facingMode: "user" } }`）还是后置（`{ video: { facingMode: { exact: "environment" } } }`）。刷新视频也可调用该方法。