import Mp3Encoder from './mp3-encoder'
import WavEncoder from './wav-encoder'
import { convertTimeMMSS } from './utils'

export default class {
  constructor(options = {}) {
    // @ts-ignore
    this.beforeRecording = options.beforeRecording
    // @ts-ignore
    this.pauseRecording = options.pauseRecording
    // @ts-ignore
    this.afterRecording = options.afterRecording
    // @ts-ignore
    this.micFailed = options.micFailed
    // @ts-ignore
    this.format = options.format

    // @ts-ignore
    this.encoderOptions = {
      // @ts-ignore
      bitRate: options.bitRate,
      // @ts-ignore
      sampleRate: options.sampleRate
    }

    // @ts-ignore
    this.bufferSize = 4096
    // @ts-ignore
    this.records = []

    // @ts-ignore
    this.isPause = false
    // @ts-ignore
    this.isRecording = false

    // @ts-ignore
    this.duration = 0
    // @ts-ignore
    this.volume = 0

    // @ts-ignore
    this.wavSamples = []

    // @ts-ignore
    this._duration = 0

    console.log(this)
  }

  start() {
    const constraints = {
      video: false,
      audio: {
        channelCount: 1,
        echoCancellation: false
      }
    }

    // @ts-ignore
    this.beforeRecording && this.beforeRecording('start recording')

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(this._micCaptured.bind(this))
      .catch(this._micError.bind(this))

    // @ts-ignore
    this.isPause = false
    // @ts-ignore
    this.isRecording = true

    // @ts-ignore
    if (this._isMp3() && !this.lameEncoder) {
      // @ts-ignore
      console.log(this.encoderOptions)
      // @ts-ignore
      this.lameEncoder = new Mp3Encoder(this.encoderOptions)
    }
  }

  stop() {
    // @ts-ignore
    this.stream.getTracks().forEach((track) => track.stop())
    // @ts-ignore
    this.input.disconnect()
    // @ts-ignore
    this.processor.disconnect()
    // @ts-ignore
    this.context.close()

    let record = null

    if (this._isMp3()) {
      // @ts-ignore
      record = this.lameEncoder.finish()
    } else {
      const wavEncoder = new WavEncoder({
        // @ts-ignore
        bufferSize: this.bufferSize,
        // @ts-ignore
        sampleRate: this.encoderOptions.sampleRate,
        // @ts-ignore
        samples: this.wavSamples
      })
      record = wavEncoder.finish()
      // @ts-ignore
      this.wavSamples = []
    }

    // @ts-ignore
    record.duration = convertTimeMMSS(this.duration)
    // @ts-ignore
    this.records.push(record)

    // @ts-ignore
    this._duration = 0
    // @ts-ignore
    this.duration = 0

    // @ts-ignore
    this.isPause = false
    // @ts-ignore
    this.isRecording = false

    // @ts-ignore
    this.afterRecording && this.afterRecording(record)
  }

  pause() {
    // @ts-ignore
    this.stream.getTracks().forEach((track) => track.stop())
    // @ts-ignore
    this.input.disconnect()
    // @ts-ignore
    this.processor.disconnect()

    // @ts-ignore
    this._duration = this.duration
    // @ts-ignore
    this.isPause = true

    // @ts-ignore
    this.pauseRecording && this.pauseRecording('pause recording')
  }

  recordList() {
    // @ts-ignore
    return this.records
  }

  lastRecord() {
    // @ts-ignore
    return this.records.slice(-1).pop()
  }

  _micCaptured(stream: any) {
    // @ts-ignore
    this.context = new (window.AudioContext || window.webkitAudioContext)()
      // @ts-ignore
    this.duration = this._duration
      // @ts-ignore
    this.input = this.context.createMediaStreamSource(stream)
      // @ts-ignore
    this.processor = this.context.createScriptProcessor(this.bufferSize, 1, 1)
      // @ts-ignore
    this.stream = stream

      // @ts-ignore
    this.processor.onaudioprocess = (ev) => {
      const sample = ev.inputBuffer.getChannelData(0)
      let sum = 0.0

      if (this._isMp3()) {
        // @ts-ignore
        this.lameEncoder.encode(sample)
      } else {
        // @ts-ignore
        this.wavSamples.push(new Float32Array(sample))
      }

      for (let i = 0; i < sample.length; ++i) {
        sum += sample[i] * sample[i]
      }

      // @ts-ignore
      this.duration = parseFloat(this._duration) + parseFloat(this.context.currentTime.toFixed(2))
      // @ts-ignore
      this.volume = Math.sqrt(sum / sample.length).toFixed(2)
    }

    // @ts-ignore
    this.input.connect(this.processor)
    // @ts-ignore
    this.processor.connect(this.context.destination)
  }

  _micError(error: any) {
    // @ts-ignore
    this.micFailed && this.micFailed(error)
  }

  _isMp3() {
    // @ts-ignore
    return (this.format || '').toLowerCase() === 'mp3'
  }
}
