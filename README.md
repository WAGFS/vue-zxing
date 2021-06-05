# vue-zxingjs

基于zxing-js/library插件封装的vue组件，组件可以扫描解析二维码、条形码。

**注意：**

* **请尽可能的在https域名下调用组件，在http域名下可能导致相机唤醒失败。**

[zxing-js/library](https://serratus.github.io/zxing-js/library/) 's wrapper for Vue.js

# Installtion

## npm

``` bash
npm i vue-zxingjs
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
import VueZxing from 'vue-zxingjs';

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

### `videoWidth`:Number

设置相机的宽度，默认为100vw。

### `videoHeight`:Number

设置相机高度，默认为100vh。

### `success`:Function(codeText)

解析成功后的回调，`codeText`为解析后的结果字符，默认会当作success回调的第一个参数传递进去。

### `fail`:Function(error)

解析失败后的回调，`error`为解析失败后的错误对象，默认会当作fail回调的第一个参数传递进去。

## slot

### #default

组件内设有默认插槽，当模式为相机📷模式时，默认会有一个扫描框和提示文字，可查看 上文showScanBox属性。

### #other

用户可以通过使用other插槽来添加自己想要的一些ui。

