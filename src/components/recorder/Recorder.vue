<template>
  <div class="ar">
    <div class="ar__overlay" v-if="isUploading"></div>
    <div class="ar-spinner" v-if="isUploading">
      <div class="ar-spinner__dot"></div>
      <div class="ar-spinner__dot"></div>
      <div class="ar-spinner__dot"></div>
    </div>

    <div class="ar-content" :class="{ ar__blur: isUploading }">
      <div class="ar-recorder">
        <button
          class="ar-icon ar-icon__lg"
          :name="iconButtonType"
          :class="{
            'ar-icon--rec': isRecording,
            'ar-icon--pulse': isRecording && volume > 0.02
          }"
          @click="toggleRecorder"
        >
          Toggle
        </button>
        <button class="ar-icon ar-icon__sm ar-recorder__stop" name="stop" @click="stopRecorder">
          Stop recording
        </button>
      </div>

      <div class="ar-recorder__records-limit" v-if="attempts">
        Attempts: {{ attemptsLeft }}/{{ attempts }}
      </div>
      <div class="ar-recorder__duration">{{ recordedTime }}</div>
      <div class="ar-recorder__time-limit" v-if="time">Record duration is limited: {{ time }}m</div>

      <div class="ar-records">
        <div
          class="ar-records__record"
          :class="{ 'ar-records__record--selected': record.id === selected.id }"
          :key="record.id"
          v-for="(record, idx) in recordList"
          @click="choiceRecord(record)"
        >
          <!-- <div class="ar__rm" v-if="record.id === selected.id" @click="removeRecord(idx)">
            &times;
          </div> -->
          <div class="ar__text">Record {{ idx + 1 }}</div>
          <div class="ar__text">{{ record.duration }}</div>
        </div>
      </div>

      <audio-player :record="selected" />
    </div>
  </div>
</template>

<script lang="ts">
import AudioPlayer from './Player.vue'
import Recorder from '@/lib/recorder'
import { convertTimeMMSS } from '@/lib/utils'

export default {
  name: 'AudioRecorder',
  props: {
    attempts: { type: Number },
    time: { type: Number },

    bitRate: { type: Number, default: 320 },
    sampleRate: { type: Number, default: 44100 },

    showDownloadButton: { type: Boolean, default: true },
    showUploadButton: { type: Boolean, default: true },
    format: { type: String, default: 'MP3' },

    micFailed: { type: Function },
    beforeRecording: { type: Function },
    pauseRecording: { type: Function },
    afterRecording: { type: Function },
    failedUpload: { type: Function },
    beforeUpload: { type: Function },
    successfulUpload: { type: Function },
    selectRecord: { type: Function }
  },
  data() {
    return {
      isUploading: false,
      recorder: this._initRecorder(),
      recordList: [] as any[],
      selected: {} as any,
      uploadStatus: null
    }
  },
  components: {
    AudioPlayer
    // Downloader,
    // IconButton,
    // Uploader
  },
  beforeUnmount() {
    this.stopRecorder()
  },
  methods: {
    toggleRecorder() {
      if (this.attempts && this.recorder.records.length >= this.attempts) {
        return
      }

      if (!this.isRecording || (this.isRecording && this.isPause)) {
        this.recorder.start()
      } else {
        this.recorder.pause()
      }
    },
    stopRecorder() {
      if (!this.isRecording) {
        return
      }

      this.recorder.stop()
      this.recordList = this.recorder.recordList()
    },
    choiceRecord(record: any) {
      if (this.selected === record) {
        return
      }
      this.selected = record
      this.selectRecord && this.selectRecord(record)
    },
    _initRecorder() {
      return new Recorder({
        beforeRecording: this.beforeRecording,
        afterRecording: this.afterRecording,
        pauseRecording: this.pauseRecording,
        micFailed: this.micFailed,
        bitRate: this.bitRate,
        sampleRate: this.sampleRate,
        format: this.format
      })
    }
  },
  computed: {
    attemptsLeft() {
      return this.attempts! - this.recordList.length
    },
    iconButtonType() {
      return this.isRecording && this.isPause ? 'mic' : this.isRecording ? 'pause' : 'mic'
    },
    isPause() {
      return this.recorder.isPause
    },
    isRecording() {
      return this.recorder.isRecording
    },
    recordedTime() {
      if (this.time && this.recorder.duration >= this.time * 60) {
        this.stopRecorder()
      }
      return convertTimeMMSS(this.recorder.duration)
    },
    volume() {
      return parseFloat(this.recorder.volume)
    }
  }
}
</script>
