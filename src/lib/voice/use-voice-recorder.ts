"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type RecorderState = "idle" | "requesting" | "recording" | "transcribing";

interface UseVoiceRecorderReturn {
  state: RecorderState;
  elapsedSeconds: number;
  error: string | null;
  startRecording: () => void;
  stopRecording: () => void;
  cancelRecording: () => void;
  isSupported: boolean;
}

export function useVoiceRecorder(
  onTranscription: (text: string) => void
): UseVoiceRecorderReturn {
  const [state, setState] = useState<RecorderState>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isSupported =
    typeof window !== "undefined" &&
    !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setElapsedSeconds(0);
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startRecording = useCallback(async () => {
    setError(null);

    if (!isSupported) {
      setError("Voice recording is not supported in this browser. Please type your answer instead.");
      return;
    }

    setState("requesting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeType || "audio/webm",
        });

        if (blob.size === 0) {
          setState("idle");
          cleanup();
          return;
        }

        setState("transcribing");

        try {
          const ext = mimeType.includes("mp4") ? "mp4" : "webm";
          const formData = new FormData();
          formData.append("audio", blob, `recording.${ext}`);

          const res = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || "Transcription failed");
          }

          const data = await res.json();
          if (data.text && data.text.trim()) {
            onTranscription(data.text.trim());
          } else {
            setError("No speech detected. Try again or type your answer.");
          }
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Transcription failed. Please try again or type your answer."
          );
        } finally {
          setState("idle");
          cleanup();
        }
      };

      recorder.start(1000);
      setState("recording");

      setElapsedSeconds(0);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      cleanup();
      setState("idle");

      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("Microphone access was denied. Please allow microphone access in your browser settings, or type your answer instead.");
      } else {
        setError("Could not access microphone. Please type your answer instead.");
      }
    }
  }, [isSupported, onTranscription, cleanup]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    cleanup();
    setState("idle");
  }, [cleanup]);

  return {
    state,
    elapsedSeconds,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    isSupported,
  };
}
