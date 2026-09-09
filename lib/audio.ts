"use client";

// Convert recorded audio (webm/opus via MediaRecorder) to 16kHz mono
// Float32Array samples, then optionally to a WAV file (base64).

export async function decodeToPCM16k(blob: Blob): Promise<Float32Array> {
  const arrayBuffer = await blob.arrayBuffer();
  const ctx = new AudioContext();
  const decoded = await ctx.decodeAudioData(arrayBuffer);
  await ctx.close();

  const inputChannels = decoded.numberOfChannels;
  const inputRate = decoded.sampleRate;
  const [inputData] = getMonoChannel(decoded, inputChannels);

  if (inputRate === 16000) {
    return inputData;
  }
  return resample(inputData, inputRate, 16000);
}

function getMonoChannel(
  buffer: AudioBuffer,
  channels: number
): Float32Array[] {
  if (channels === 1) {
    return [buffer.getChannelData(0)];
  }
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);
  const mono = new Float32Array(left.length);
  for (let i = 0; i < left.length; i++) {
    mono[i] = (left[i] + right[i]) / 2;
  }
  return [mono];
}

function resample(
  data: Float32Array,
  fromRate: number,
  toRate: number
): Float32Array {
  if (fromRate === toRate) return data;
  const ratio = fromRate / toRate;
  const newLength = Math.round(data.length / ratio);
  const result = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const pos = i * ratio;
    const i0 = Math.floor(pos);
    const i1 = Math.min(i0 + 1, data.length - 1);
    const frac = pos - i0;
    result[i] = data[i0] * (1 - frac) + data[i1] * frac;
  }
  return result;
}

function pcmToInt16(pcm: Float32Array): Int16Array {
  const int16 = new Int16Array(pcm.length);
  for (let i = 0; i < pcm.length; i++) {
    const s = Math.max(-1, Math.min(1, pcm[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return int16;
}

export function encodeWav(pcm: Float32Array, sampleRate = 16000): Blob {
  const int16 = pcmToInt16(pcm);
  const buffer = new ArrayBuffer(44 + int16.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + int16.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(36, "data");
  view.setUint32(40, int16.length * 2, true);

  const bytes = new Uint8Array(buffer);
  bytes.set(new Uint8Array(int16.buffer, int16.byteOffset, int16.byteLength), 44);

  return new Blob([bytes], { type: "audio/wav" });
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? "";
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function playFloat32Audio(audio: Float32Array, sampleRate = 24000): Promise<void> {
  if (audio.length === 0) return;
  return new Promise((resolve, reject) => {
    const ctx = new AudioContext({ sampleRate });
    if (ctx.state === "suspended") {
      // Autoplay blocked — no user gesture yet. Close and reject so callers
      // can fall back to a "tap to start" flow instead of hanging.
      void ctx.close();
      reject(
        new DOMException(
          "Audio playback requires a user gesture",
          "NotAllowedError"
        )
      );
      return;
    }
    const buffer = ctx.createBuffer(1, audio.length, sampleRate);
    buffer.copyToChannel(audio as Float32Array<ArrayBuffer>, 0);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => {
      void ctx.close();
      resolve();
    };
    source.start();
  });
}

export function playBase64Audio(base64: string, mediaType = "audio/mpeg"): Promise<void> {
  return new Promise((resolve, reject) => {
    const byteChars = atob(base64);
    const bytes = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      bytes[i] = byteChars.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mediaType });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onended = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    audio.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    void audio.play().catch(reject);
  });
}

export interface RecorderState {
  mediaRecorder: MediaRecorder;
  chunks: Blob[];
  stream: MediaStream;
}

export async function createRecorder(): Promise<RecorderState> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: MediaRecorder.isTypeSupported("audio/webm")
      ? "audio/webm"
      : undefined,
  });
  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  return { mediaRecorder, chunks, stream };
}

export async function stopRecorder(state: RecorderState): Promise<Blob> {
  return new Promise<Blob>((resolve) => {
    state.mediaRecorder.onstop = () => {
      state.stream.getTracks().forEach((t) => t.stop());
      resolve(new Blob(state.chunks, { type: state.chunks[0]?.type || "audio/webm" }));
    };
    state.mediaRecorder.stop();
  });
}