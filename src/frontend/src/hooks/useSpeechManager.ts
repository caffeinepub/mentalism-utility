import { useCallback, useEffect, useRef, useState } from "react";
import { parseDate } from "../utils/dateParser";
import { getWeekday } from "../utils/weekdayCalculator";
import type { Weekday } from "../utils/weekdayCalculator";

type SpeechState = "idle" | "listening" | "triggered";

interface UseSpeechManagerOptions {
  onWeekday: (weekday: Weekday) => void;
  enabled: boolean;
}

export function useSpeechManager({
  onWeekday,
  enabled,
}: UseSpeechManagerOptions) {
  const recognitionRef = useRef<any>(null);
  const stateRef = useRef<SpeechState>("idle");
  const [isListening, setIsListening] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const captureBufferRef = useRef<string>("");
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const SpeechRecognition =
    typeof window !== "undefined"
      ? (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition
      : null;

  useEffect(() => {
    setIsAvailable(!!SpeechRecognition);
  }, [SpeechRecognition]);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  const startRecognition = useCallback(() => {
    if (!SpeechRecognition || !enabledRef.current) return;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        /* ignore */
      }
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase().trim();
        const isFinal = event.results[i].isFinal;

        if (stateRef.current === "idle") {
          if (transcript.includes("let me try")) {
            stateRef.current = "triggered";
            captureBufferRef.current = "";
          }
        } else if (stateRef.current === "triggered") {
          captureBufferRef.current += ` ${transcript}`;

          if (isFinal) {
            const date = parseDate(captureBufferRef.current);
            if (date) {
              const weekday = getWeekday(date);
              onWeekday(weekday);
            }
            stateRef.current = "idle";
            captureBufferRef.current = "";
          }
        }
      }
    };

    recognition.onerror = (event: any) => {
      if (
        event.error === "not-allowed" ||
        event.error === "service-not-available"
      ) {
        setIsListening(false);
        setIsAvailable(false);
        return;
      }
      stateRef.current = "idle";
    };

    recognition.onend = () => {
      setIsListening(false);
      if (enabledRef.current) {
        restartTimerRef.current = setTimeout(() => {
          startRecognition();
        }, 300);
      }
    };

    try {
      recognition.start();
    } catch {
      // ignore
    }
  }, [SpeechRecognition, onWeekday]);

  useEffect(() => {
    if (enabled) {
      startRecognition();
    } else {
      stopRecognition();
    }
    return () => {
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      stopRecognition();
    };
  }, [enabled, startRecognition, stopRecognition]);

  return { isListening, isAvailable };
}
