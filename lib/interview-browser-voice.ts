"use client";

import { playFloat32Audio } from "@/lib/audio";

// Free in-browser voice engine: whisper-tiny (transformers.js) for STT
// and Kokoro (kokoro-js, ONNX WASM) for TTS. Lazy-loaded on first use.

let whisperPipelinePromise: Promise<any> | null = null;
let kokoroTtsPromise: Promise<any> | null = null;

export function loadBrowserWhisper(onProgress?: (stage: string, loaded: number, total: number) => void): Promise<any> {
  if (!whisperPipelinePromise) {
    whisperPipelinePromise = (async () => {
      const { pipeline, env } = await import("@huggingface/transformers");
      env.allowLocalModels = false;
      const transcriber = await pipeline("automatic-speech-recognition", "onnx-community/whisper-tiny", {
        progress_callback: (progress: { status: string; loaded?: number; total?: number }) => {
          onProgress?.(progress.status ?? "loading", progress.loaded ?? 0, progress.total ?? 1);
        },
      });
      return transcriber;
    })();
  }
  return whisperPipelinePromise;
}

export async function transcribeWithWhisper(
  pcm16k: Float32Array,
  onProgress?: (stage: string, loaded: number, total: number) => void
): Promise<string> {
  const transcriber = await loadBrowserWhisper(onProgress);
  const result = await transcriber(pcm16k, {
    language: "english",
    task: "transcribe",
  });
  return (result.text as string) ?? "";
}

export function loadBrowserKokoro(onProgress?: (stage: string, loaded: number, total: number) => void): Promise<any> {
  if (!kokoroTtsPromise) {
    kokoroTtsPromise = (async () => {
      const { KokoroTTS } = await import("kokoro-js");
      const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
        dtype: "q8",
        device: "wasm",
        progress_callback: (progress: { status: string; loaded?: number; total?: number }) => {
          onProgress?.(progress.status ?? "loading", progress.loaded ?? 0, progress.total ?? 1);
        },
      });
      return tts;
    })();
  }
  return kokoroTtsPromise;
}

export async function speakWithKokoro(
  text: string,
  voice: string,
  onProgress?: (stage: string, loaded: number, total: number) => void
): Promise<void> {
  const tts = await loadBrowserKokoro(onProgress);
  const audio = await tts.generate(text, { voice });
  await playFloat32Audio(audio.data, audio.sampling_rate);
}