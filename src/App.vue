<script setup lang="ts">
import Recorder from './components/recorder/Recorder.vue'
</script>

<template>
  <main>
    <Recorder
      :attempts="3"
      :time="2"
      :before-recording="callback"
      :pause-recording="callback"
      :after-recording="callback"
      :select-record="callback"
      :before-upload="callback"
      :successful-upload="callback"
      :failed-upload="callback"
    ></Recorder>
  </main>
</template>

<script lang="ts">
import MPEGMode from 'lamejs/src/js/MPEGMode'
import Lame from 'lamejs/src/js/Lame'
import BitStream from 'lamejs/src/js/BitStream'

export default {
  name: 'App',
  mounted() {
    // @ts-ignore
    window.MPEGMode = MPEGMode
    // @ts-ignore
    window.Lame = Lame
    // @ts-ignore
    window.BitStream = BitStream
  },
  methods: {
    callback(data: any) {
      console.debug(data)
    }
  }
}
</script>
