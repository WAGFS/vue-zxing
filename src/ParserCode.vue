<template>
  <div class="parser-code">
    <slot name="header">
      <header>
        <div class="refresh" @click="decodeOnceFromConstraintsFunc(switchPerspective)" v-if="showToggleBtnCopy">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-shuaxin"></use>
          </svg>
        </div>
        <div class="toggle" @click="toggle" v-if="showToggleBtnCopy">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-iconqiehuanjingtou"></use>
          </svg>
        </div>
      </header>
    </slot>
    <div class="page" v-if="parseType === 'Camera'">
      <video
        id="video"
        :class="{ video: !videoWidth && !videoHeight }"
        :width="videoWidth"
        :height="videoHeight"
        autoplay
      ></video>
      <slot>
      <div
        class="scanBox"
        :style="{ width: scanBoxWidth, height: scanHeight }"
        v-if="parseType === 'Camera' && showScanBoxCopy"
      >
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
    </div>
    <!-- 选择图片 -->
    <input
      type="file"
      id="choose"
      accept="image/*"
      v-if="parseType === 'Image' && inputId === 'choose' && showDefaultInput"
    />
   
    <slot name="other"></slot>
  </div>
</template>
<script>
import "./assets/svg/iconfont";
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
      default: false,
    },
    // 是否展示切换镜头按钮
    showToggleBtn: {
      type: Boolean,
      default: false,
    },
    videoWidth: {
      typeof: Number,
      default: null,
    },
    videoHeight: {
      typeof: Number,
      default: null,
    },
    scanBoxWidth: {
      typeof: Number,
      default: null,
    },
    scanHeight: {
      typeof: Number,
      default: null,
    },
    success: {
      type: Function,
      default() {
        return null
      },
    },
    fail: {
      type: Function,
      default() {
        return null
      },
    },
    // 获取摄像头失败回调
    getVideoFail: {
      type: Function,
      default() {
       return null
      },
    },
  },
  data() {
    return {
      codeReader: null,
      tipMsg: "扫描装备条码",
      tipShow: true,
      video:null,
      img: null,
      reader: null,
      back: true,
      showScanBoxCopy: this.showScanBox,
      showToggleBtnCopy: this.showToggleBtn,
      inputDom: null,
    };
  },
  computed: {
    switchPerspective() {
      return this.back
        ? { video: { facingMode: { exact: "environment" } } }
        : { video: { facingMode: "user" } };
    },
  },
  created() {
    if (this.parseType === "Camera") {
      this.openScan();
    } else {
      this.reader = new FileReader();
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
    if (this.parseType === "Image") {
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
          if (videoInputDevices.length > 1) {
            this.showScanBoxCopy = true;
            this.tipShow = true;
            this.showToggleBtnCopy = true;
            this.tipMsg = "扫描装备条码";
            this.decodeOnceFromConstraintsFunc(this.switchPerspective);
          } else {
            return alert("请允许获取摄像头权限后再进行二维码扫描");
          }
        })
        .catch((err) => {
          this.showScanBoxCopy = false;
          this.tipShow = false;
          this.getVideoFail(err) || alert('调取用户摄像头失败');
        });
    },
    toggle() {
      this.back = !this.back;
      this.decodeOnceFromConstraintsFunc(this.switchPerspective);
    },
    async decodeOnceFromConstraintsFunc(constraints) {
      //this.codeReader.reset(); // 重置
      // this.codeReader.decodeOnceFromConstraints(
      //   constraints,
      //   "video"
      // )
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      await this.codeReader.reset();
      this.video = await this.codeReader.attachStreamToVideo(stream, "video");
      await this.decoding(this.video)
    },
    async decoding(video){
      let result = this.codeReader.decodeOnce(video)
      result.then((result) => {
          this.tipShow = true;
          this.tipMsg = "正在尝试识别...";
          if (result) {
            if (result.text) {
              this.success ? this.success(result.text) : alert(result.text)
              this.tipMsg = "扫描装备条码";
              this.decoding(this.video)
            }
          }
          },(err) => {
            if (err) {
            if(err.message === 'Video stream has ended before any code could be detected.') return
            this.tipMsg = "识别失败";
            this.fail(err) || alert(err);
            setTimeout(()=>{this.tipShow = false},2000)
          }
          });
    },
    // 返回一个promise对象，如果要获取解析后的值可以通过调用then方法来获取
    async parseStaticImg(imgSrc) {
      this.codeReader = await new BrowserMultiFormatReader();
      let res = this.codeReader
        .decodeFromImage(undefined, imgSrc)
        .then((result) => {
          this.success ? this.success(result.text) : alert(result.text)
          return result.text;
        })
        .catch((err) => {
          this.fail(err) || alert(err);
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

<style scoped>
body {
  margin: 0;
}
.parser-code{
  position: relative;
}
/* 头部 */
header {
  position: absolute;
  top: 2%;
  left: 0;
  right: 0;
  display: flex;
  height: 40px;
  justify-content: flex-end;
  z-index: 999;
}
.toggle,.refresh {
  width: 30px;
  height: 30px;
  margin-right: 5%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.refresh{
  margin-right: 2%;
}
/*vjs-fluid 自适video 长宽*/
.video {
  height: 100%;
  width: 100%;
  /* 打破video宽高比，填充满父级 */
  object-fit: fill;
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
  position: absolute;
  top: 0;
  left: 0;
}
.scanBox {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  /* 扫描框变大，相机离太远不易得出结果，所以选择放大扫描框 */
  height: 30%;
  width: 85%;
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
  animation: move 3.5s linear infinite;
}
@keyframes move {
  0% {
    transform: translateY(-3px);
  }
  100% {
    /* scanBox变高扫描线运动范围增大 */
    transform: translateY(calc(30vh - 3px));
  }
}
.icon {
  width: 3em;
  height: 3em;
  vertical-align: -0.15em;
  fill: white;
  overflow: hidden;
}
</style>
