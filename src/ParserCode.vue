<template>
  <div>
    <div class="page" v-if="parseType === 'Camera'">
      <video
        id="video"
        :class="{ video: !videoWidth && !videoHeight }"
        :width="videoWidth"
        :height="videoHeight"
        autoplay
      ></video>
    </div>
    <!-- 选择图片 -->
    <input
      type="file"
      id="choose"
      accept="image/*"
      v-if="parseType === 'Image' && inputId === 'choose' && showDefaultInput"
    />
    <slot>
      <div class="scanBox" v-if="parseType === 'Camera' && showScanBox">
        <div class="frame upperLeft"></div>
        <div class="frame upperRight"></div>
        <div class="frame lowerRight"></div>
        <div class="frame lowerLeft"></div>
        <div class="pointerBox">
          <div class="pointer"></div>
        </div>
        <div v-show="tipShow" class="tip">{{ tipMsg }}</div>
      </div>
    </slot>
    <slot name="other"></slot>
  </div>
</template>
<script>
import { BrowserMultiFormatReader } from "@zxing/library";
export default {
  name: "parser-code",
  props: {
    parseType: {
      // 传入需要解码的类型  摄像头还是静态图 Camera 或 Image
      type: String,
      default: "Camera",
      validator: function(value) {
        // 这个值必须匹配下列字符串中的一个
        let result = ["Camera", "Image"].indexOf(value) !== -1;
        if (!result)
          throw new Error("parseType can only be 'Camera' or 'Image'");
        return true;
      },
    },
    // 如果选择使用静态图  那么可以传入一个input的id，这个input类型需要是file类型，否则采用组件默认的input
    inputId: {
      type: String,
      default: "choose",
    },
    // 如果不想要默认的input框展示可以传入showDefaultInput,然后通过组件下的parseStaticImg方法传入图片路径来获取解析后的值
    showDefaultInput: {
      type: Boolean,
      default: true,
    },
    showScanBox: {
      type: Boolean,
      default: true,
    },
    videoWidth: {
      typeof: Number,
      default: null,
    },
    videoHeight: {
      typeof: Number,
      default: null,
    },
    success: {
      type: Function,
      default() {},
    },
    fail: {
      type: Function,
      default() {},
    },
  },
  data() {
    return {
      codeReader: null,
      tipMsg: "扫描装备条码",
      tipShow: true,
      img: null,
      reader: null,
      inputDom: null,
    };
  },
  created() {
    if (this.parseType === "Camera") {
      this.openScan();
    } else {
      this.reader = new FileReader()
      let _this = this;
      this.reader.onload = function(e) {
        if (!e.target.result)
          throw new Error("[FileReader]:Image parsing failed");
        _this.parseStaticImg(e.target.result); // 'data:image/jpeg;base64,/9j/4AAQSk...(base64编码)...'
      };
    }
  },
  mounted() {
    // 防止获取不到父组件中的元素
   if(this.parseType === "Image"){
      this.$nextTick(() => {
      this.inputDom = document.querySelector(`#${this.inputId}`);
      this.inputDom &&
        this.inputDom.addEventListener("change", this.selectImg(this), false);
    });
   }
  },
  methods: {
    async openScan() {
      this.codeReader = await new BrowserMultiFormatReader();
      this.codeReader
        .getVideoInputDevices()
        .then((videoInputDevices) => {
          // videoInputDevices 是一个设备(摄像头，[前置，后置])列表
          this.tipShow = true;
          this.tipMsg = "扫描装备条码";
          // 默认获取第一个摄像头设备id
          let firstDeviceId = videoInputDevices[0].deviceId;
          // 获取第一个摄像头设备的名称
          const videoInputDeviceslablestr = JSON.stringify(
            videoInputDevices[0].label
          );
          if (videoInputDevices.length > 1) {
            // 判断是否后置摄像头
            if (videoInputDeviceslablestr.indexOf("back") > -1) {
              firstDeviceId = videoInputDevices[0].deviceId;
            } else {
              firstDeviceId = videoInputDevices[1].deviceId;
            }
          }
          this.decodeFromInputVideoFunc(firstDeviceId);
        })
        .catch((err) => {
          this.tipShow = false;
          console.error(err);
        });
    },
    decodeFromInputVideoFunc(firstDeviceId) {
      this.codeReader.reset(); // 重置
      this.codeReader.decodeFromInputVideoDeviceContinuously(
        firstDeviceId,
        "video",
        (result, err) => {
          this.tipMsg = "正在尝试识别...";
          if (result) {
            if (result.text) {
              this.tipShow = true;
              alert(result.text);
              this.success(result.text);
            }
          }
          if (err && !err) {
            this.tipMsg = "识别失败";
            this.fail(err);
            console.error(err);
          }
        }
      );
    },
    // 返回一个promise对象，如果要获取解析后的值可以通过调用then方法来获取
    async parseStaticImg(imgSrc) {
      this.codeReader = await new BrowserMultiFormatReader();
      let res = this.codeReader
        .decodeFromImage(undefined, imgSrc)
        .then((result) => {
          console.log(result.text);
          this.success(result.text);
          return result.text;
        })
        .catch((err) => {
          this.fail(err);
        });
      return res;
    },
    selectImg(_this) {
      return function() {
        let file = this.files[0];
        if (
          file.type !== "image/jpeg" &&
          file.type !== "image/png" &&
          file.type !== "image/gif"
        ) {
          this.value = "";
          this.outerHTML = this.outerHTML;
          alert("不是有效的图片文件!");
          return;
        }
        this.value = "";
        // 以DataURL的形式读取文件: 该方法是一个异步方法，所以上面采用onload监听文件读取完成
        _this.reader.readAsDataURL(file);
      };
    },
  },
};
</script>

<style>
body {
  margin: 0;
}
/*vjs-fluid 自适video 长宽*/
.video {
  height: 100vh;
  width: 100vw;
}
.tip {
  position: absolute;
  left: 50%;
  top: 120%;
  transform: translate(-50%, 0);
  white-space: nowrap;
  color: rgba(222, 220, 222, 1);
  font-size: 16px;
}
/* common */
.page {
  width: 100vw;
  height: 100vh;
  position: relative;
}
.scanBox {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  height: 20%;
  width: 70%;
}
.frame {
  position: absolute;
  width: 15px;
  height: 15px;
  border: 3px solid transparent;
  background: transparent;
}
.upperLeft {
  top: 0;
  left: 0;
  border-left-color: rgba(66, 133, 244, 1);
  border-top-color: rgba(66, 133, 244, 1);
}
.upperRight {
  top: 0;
  right: 0;
  border-right-color: rgba(66, 133, 244, 1);
  border-top-color: rgba(66, 133, 244, 1);
}
.lowerRight {
  bottom: 0;
  right: 0;
  border-bottom-color: rgba(66, 133, 244, 1);
  border-right-color: rgba(66, 133, 244, 1);
}
.lowerLeft {
  bottom: 0;
  left: 0;
  border-left-color: rgba(66, 133, 244, 1);
  border-bottom-color: rgba(66, 133, 244, 1);
}
.pointerBox {
  position: absolute;
  top: 0;
  left: 0;
  width: 98%;
  height: 100%;
  overflow: hidden;
}
.pointer {
  height: 3px;
  background-image: linear-gradient(
    to right,
    transparent 0%,
    rgba(66, 133, 244, 1) 50%,
    transparent 100%
  );
  transform: translateY(-3px);
  animation: move 2s linear infinite;
}
@keyframes move {
  0% {
    transform: translateY(-3px);
  }
  100% {
    transform: translateY(calc(20vh - 3px));
  }
}
</style>
