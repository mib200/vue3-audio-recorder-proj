<template>
  <div class="ar-player">
    <div class="ar-player-actions">
      <button
        id="play"
        class="ar-icon ar-icon__lg ar-player__play"
        :name="playBtnIcon"
        :class="{ 'ar-player__play--active': isPlaying }"
        @click="playback"
      >
        Play
      </button>
    </div>

    <div class="ar-player-bar">
      <div class="ar-player__time">{{ playedTime }}</div>
      <!-- <line-control
        class="ar-player__progress"
        ref-id="progress"
        :percentage="progress"
        @change-linehead="_onUpdateProgress"
      /> -->
      <div class="ar-player__time">{{ duration }}</div>
      <!-- <volume-control @change-volume="_onChangeVolume" /> -->
    </div>

    <audio :id="playerUniqId" :src="audioSource"></audio>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
// import IconButton from './icon-button'
// import LineControl from './line-control'
// import VolumeControl from './volume-control'
import { convertTimeMMSS } from '@/lib/utils'

export default defineComponent({
  name: 'AudioPlayer',
  props: {
    src: { type: String },
    record: { type: Object },
    filename: { type: String }
  },
  data() {
    return {
      isPlaying: false,
      duration: convertTimeMMSS(0),
      playedTime: convertTimeMMSS(0),
      progress: 0,
      player: null as any | null,
    }
  },
  // components: {
  //   IconButton,
  //   LineControl,
  //   VolumeControl
  // },
  mounted: function () {
    this.player = document.getElementById(this.playerUniqId)

    this.player?.addEventListener('ended', () => {
      this.isPlaying = false
    })

    this.player?.addEventListener('loadeddata', () => {
      this._resetProgress()
      this.duration = convertTimeMMSS(this.player?.duration)
    })

    this.player?.addEventListener('timeupdate', this._onTimeUpdate)
  },
  computed: {
    audioSource() {
      const url = this.src || this.record?.url
      if (url) return url
      this._resetProgress()
      return null
    },
    playBtnIcon() {
      return this.isPlaying ? 'pause' : 'play'
    },
    playerUniqId() {
      console.log(`audio-player`);
      return `audio-player`
    }
  },
  methods: {
    playback() {
      if (!this.audioSource) {
        return
      }

      if (this.isPlaying) {
        this.player.pause()
      } else {
        setTimeout(() => {
          this.player.play()
        }, 0)
      }

      this.isPlaying = !this.isPlaying
    },
    _resetProgress() {
      if (this.isPlaying) {
        this.player.pause()
      }

      this.duration = convertTimeMMSS(0)
      this.playedTime = convertTimeMMSS(0)
      this.progress = 0
      this.isPlaying = false
    },
    _onTimeUpdate() {
      this.playedTime = convertTimeMMSS(this.player.currentTime)
      this.progress = (this.player.currentTime / this.player.duration) * 100
    },
    _onUpdateProgress(pos: number) {
      if (pos) {
        this.player.currentTime = pos * this.player.duration
      }
    },
    _onChangeVolume(val: any) {
      if (val) {
        this.player.volume = val
      }
    }
  }
});
</script>
