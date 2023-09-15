import lame from 'lamejs';

export default class {
  constructor(config: any) {
    // @ts-ignore
    this.bitRate = config.bitRate
    // @ts-ignore
    this.sampleRate = config.sampleRate
    // @ts-ignore
    this.dataBuffer = []
    // @ts-ignore
    console.log(1, this.sampleRate, this.bitRate)
    // @ts-ignore
    this.encoder = new lame.Mp3Encoder(1, this.sampleRate, this.bitRate)
  }

  encode(arrayBuffer: any) {
    const maxSamples = 1152
    const samples = this._convertBuffer(arrayBuffer)
    let remaining = samples.length

    for (let i = 0; remaining >= 0; i += maxSamples) {
      const left = samples.subarray(i, i + maxSamples)

      // @ts-ignore
      const buffer = this.encoder.encodeBuffer(left)
      // @ts-ignore
      this.dataBuffer.push(new Int8Array(buffer))
      remaining -= maxSamples
    }
  }

  finish() {
    // @ts-ignore
    this.dataBuffer.push(this.encoder.flush())
    // @ts-ignore
    const blob = new Blob(this.dataBuffer, { type: 'audio/mp3' })
    // @ts-ignore
    this.dataBuffer = []

    return {
      id: Date.now(),
      blob: blob,
      url: URL.createObjectURL(blob)
    }
  }

  _floatTo16BitPCM(input: any, output: any) {
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]))
      output[i] = s < 0 ? s * 0x8000 : s * 0x7fff
    }
  }

  _convertBuffer(arrayBuffer: any) {
    const data = new Float32Array(arrayBuffer)
    const out = new Int16Array(arrayBuffer.length)
    this._floatTo16BitPCM(data, out)
    return out
  }
}
