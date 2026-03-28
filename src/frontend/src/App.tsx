import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { useAudioManager } from "./hooks/useAudioManager";
import { useSpeechManager } from "./hooks/useSpeechManager";
import type { Weekday } from "./utils/weekdayCalculator";

const WEEKDAY_NOTE_TEXTS: Record<Weekday, string> = {
  Monday: "Call back on Monday, should be free after lunch",
  Tuesday: "Tuesday is the meeting — don't forget slides",
  Wednesday: "Wednesday morning — gym + errands",
  Thursday: "Book dinner for Thursday, tell them 7pm",
  Friday: "Friday night — pick up wine on the way home",
  Saturday: "Saturday: market, then beach if weather holds",
  Sunday: "Sunday reset — laundry, meal prep, early night",
};

const DEFAULT_RESULT_NOTE = "Check back later for that thing";

type NoteItem = {
  id: string;
  title: string;
  preview: string;
  date: string;
  isResult?: boolean;
};

const STATIC_NOTES: NoteItem[] = [
  {
    id: "n1",
    title: "Grocery list",
    preview: "Eggs, oat milk, sourdough, avocados, lemons...",
    date: "Today",
  },
  {
    id: "n2",
    title: "Book recs from Sarah",
    preview: "Tomorrow and Tomorrow — Elena Ferrante — Piranesi",
    date: "Yesterday",
  },
  {
    id: "n3",
    title: "Reminder",
    preview: DEFAULT_RESULT_NOTE,
    date: "Mon",
    isResult: true,
  },
  {
    id: "n4",
    title: "Flight packing",
    preview: "Charger, passport, noise cancelling headphones...",
    date: "Mar 22",
  },
  {
    id: "n5",
    title: "Apartment ideas",
    preview: "Warm pendant lights, linen curtains, terracotta pot",
    date: "Mar 18",
  },
  {
    id: "n6",
    title: "Morning routine",
    preview: "No phone first 30 min, journal, make actual coffee",
    date: "Mar 15",
  },
  {
    id: "n7",
    title: "Movie list",
    preview: "Past Lives, The Holdovers, All of Us Strangers",
    date: "Mar 10",
  },
];

export default function App() {
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [currentWeekday, setCurrentWeekday] = useState<Weekday | null>(null);
  const [highlightResult, setHighlightResult] = useState(false);

  const { playTone, unlockAudio } = useAudioManager();

  const handleWeekday = useCallback(
    (weekday: Weekday) => {
      setCurrentWeekday(weekday);
      setHighlightResult(true);
      playTone(weekday);
      setTimeout(() => setHighlightResult(false), 1200);
    },
    [playTone],
  );

  const { isAvailable } = useSpeechManager({
    onWeekday: handleWeekday,
    enabled: speechEnabled,
  });

  const handleActivate = () => {
    unlockAudio();
    setShowPrompt(false);
    setSpeechEnabled(true);
  };

  const notes: NoteItem[] = STATIC_NOTES.map((note) => {
    if (note.isResult && currentWeekday) {
      return { ...note, preview: WEEKDAY_NOTE_TEXTS[currentWeekday] };
    }
    return note;
  });

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#F6F1E8" }}
    >
      {/* Header */}
      <header className="px-4 pt-10 pb-2">
        <div className="flex items-end justify-between mb-3">
          <h1
            className="text-4xl font-bold tracking-tight"
            style={{ color: "#1C1C1E" }}
          >
            Notes
          </h1>
          <button
            type="button"
            className="text-base"
            style={{ color: "#F4A80A" }}
          >
            Edit
          </button>
        </div>

        {/* Fake search bar */}
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ backgroundColor: "rgba(116,116,128,0.12)" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8E8E93"
            strokeWidth="2.5"
            strokeLinecap="round"
            role="img"
            aria-label="Search"
          >
            <title>Search</title>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <span style={{ color: "#8E8E93", fontSize: "15px" }}>Search</span>
        </div>
      </header>

      {/* Folder label */}
      <div className="px-4 pt-5 pb-1">
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "#8E8E93" }}
        >
          On My iPhone
        </span>
      </div>

      {/* Notes list */}
      <main className="flex-1 notes-scroll">
        <div
          className="mx-3 rounded-2xl overflow-hidden"
          style={{ backgroundColor: "#FFFFFF" }}
          data-ocid="notes.list"
        >
          {notes.map((note, index) => (
            <motion.div
              key={note.id}
              data-ocid={`notes.item.${index + 1}`}
              animate={{
                backgroundColor:
                  note.isResult && highlightResult
                    ? "rgba(255, 214, 10, 0.18)"
                    : "rgba(255,255,255,0)",
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold truncate"
                      style={{
                        fontSize: "15px",
                        color: "#1C1C1E",
                        lineHeight: "1.3",
                      }}
                    >
                      {note.title}
                    </p>
                    <p
                      className="truncate mt-0.5"
                      style={{
                        fontSize: "13px",
                        color: "#8E8E93",
                        lineHeight: "1.4",
                      }}
                    >
                      {note.preview}
                    </p>
                  </div>
                  <span
                    className="shrink-0 text-right mt-0.5"
                    style={{ fontSize: "13px", color: "#8E8E93" }}
                  >
                    {note.date}
                  </span>
                </div>
              </div>
              {index < notes.length - 1 && (
                <div
                  className="ml-4"
                  style={{
                    height: "0.5px",
                    backgroundColor: "rgba(60,60,67,0.18)",
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Note count footer */}
        <p
          className="text-center py-4"
          style={{ fontSize: "13px", color: "#8E8E93" }}
        >
          {notes.length} Notes
        </p>
      </main>

      {/* Fake iOS tab bar */}
      <nav
        className="flex items-center justify-between px-8 pt-3 pb-6"
        style={{
          backgroundColor: "rgba(246,241,232,0.92)",
          borderTop: "0.5px solid rgba(60,60,67,0.18)",
        }}
      >
        <button type="button" className="flex flex-col items-center gap-1">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8E8E93"
            strokeWidth="1.8"
            strokeLinecap="round"
            role="img"
            aria-label="Folders"
          >
            <title>Folders</title>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span style={{ fontSize: "10px", color: "#8E8E93" }}>Folders</span>
        </button>

        <button type="button" className="flex flex-col items-center gap-1">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="#F4A80A"
            stroke="#F4A80A"
            strokeWidth="1.8"
            strokeLinecap="round"
            role="img"
            aria-label="Notes"
          >
            <title>Notes</title>
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
              fill="#F4A80A"
            />
            <polyline points="14 2 14 8 20 8" stroke="white" fill="none" />
            <line x1="16" y1="13" x2="8" y2="13" stroke="white" />
            <line x1="16" y1="17" x2="8" y2="17" stroke="white" />
            <polyline points="10 9 9 9 8 9" stroke="white" fill="none" />
          </svg>
          <span
            style={{ fontSize: "10px", color: "#F4A80A", fontWeight: "600" }}
          >
            Notes
          </span>
        </button>

        <button
          type="button"
          className="flex flex-col items-center gap-1"
          onClick={() => {
            if (!speechEnabled) handleActivate();
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#F4A80A"
            strokeWidth="1.8"
            strokeLinecap="round"
            role="img"
            aria-label="New Note"
          >
            <title>New Note</title>
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          <span style={{ fontSize: "10px", color: "#F4A80A" }}>New Note</span>
        </button>
      </nav>

      {/* First-load activation overlay */}
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.45)", zIndex: 50 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-ocid="notes.modal"
          >
            <motion.div
              className="rounded-2xl px-6 py-6 mx-8 text-center"
              style={{ backgroundColor: "#FFFFFF", maxWidth: "280px" }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
            >
              <h2
                className="font-semibold mb-2"
                style={{ fontSize: "17px", color: "#1C1C1E" }}
              >
                "Notes" Would Like to Access the Microphone
              </h2>
              <p
                className="mb-5"
                style={{
                  fontSize: "13px",
                  color: "#3C3C43",
                  lineHeight: "1.5",
                }}
              >
                Voice input is used for search and hands-free note creation.
              </p>
              <div
                style={{
                  height: "0.5px",
                  backgroundColor: "rgba(60,60,67,0.18)",
                }}
              />
              <div className="flex">
                <button
                  type="button"
                  className="flex-1 py-3 text-center font-medium"
                  style={{ fontSize: "17px", color: "#8E8E93" }}
                  onClick={() => setShowPrompt(false)}
                  data-ocid="notes.cancel_button"
                >
                  Don't Allow
                </button>
                <div
                  style={{
                    width: "0.5px",
                    backgroundColor: "rgba(60,60,67,0.18)",
                  }}
                />
                <button
                  type="button"
                  className="flex-1 py-3 text-center font-semibold"
                  style={{ fontSize: "17px", color: "#0A84FF" }}
                  onClick={handleActivate}
                  data-ocid="notes.confirm_button"
                >
                  {isAvailable ? "OK" : "OK"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
