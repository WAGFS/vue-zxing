import 'webrtc-adapter';
import ParserCode from './ParserCode.vue'

export default{
  install:function(Vue,options){
    Vue.component('v-zxing',ParserCode)
  }
}

