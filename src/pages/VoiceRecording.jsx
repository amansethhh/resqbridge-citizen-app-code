import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Pause, Play, Square, Trash2 } from "lucide-react";
import ScreenHeader from "@/components/resqbridge/ScreenHeader";
import GlassCard from "@/components/resqbridge/GlassCard";
import AppShell from "@/components/resqbridge/AppShell";
import PermissionState from "@/components/resqbridge/PermissionState";
import { PrimaryButton, SecondaryButton, DangerButton } from "@/components/resqbridge/Buttons";
import SelectableBox from "@/components/resqbridge/SelectableBox";
import { base44 } from "@/api/base44Client";
import {
  requestMicAccess,
  createRecorder,
  isLiveTranscriptionSupported,
  createLiveTranscriber,
} from "@/services/voiceService";
import { getEmergency, updateEmergency } from "@/services/emergencyService";
import { useEmergency } from "@/state/EmergencyContext";

const MAX_SECONDS = 300;

const LANGUAGES = [
  { id: "en-US", label: "English" },
  { id: "hi-IN", label: "Hindi" },
  { id: "mr-IN", label: "Marathi" },
  { id: "gu-IN", label: "Gujarati" },
];
const LANG_LABEL = Object.fromEntries(LANGUAGES.map((l) => [l.id, l.label]));

export default function VoiceRecording() {
  const navigate = useNavigate();
  const { draftId } = useEmergency();
  const [permState, setPermState] = useState("idle");
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [saving, setSaving] = useState(false);
  const [lang, setLang] = useState("en-US");

  const recorderRef = useRef(null);
  const transcriberRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const start = async () => {
    setPermState("requesting");
    try {
      const stream = await requestMicAccess();
      setPermState("granted");
      recorderRef.current = createRecorder(stream);
      recorderRef.current.start();
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SECONDS) stop();
          return s + 1;
        });
      }, 1000);
      if (isLiveTranscriptionSupported()) {
        transcriberRef.current = createLiveTranscriber(setTranscript, lang);
        transcriberRef.current.start();
      }
    } catch (err) {
      setPermState(err.code || "denied");
    }
  };

  const togglePause = () => {
    if (paused) recorderRef.current.resume();
    else recorderRef.current.pause();
    setPaused((p) => !p);
  };

  const stop = async () => {
    clearInterval(timerRef.current);
    transcriberRef.current?.stop();
    if (recorderRef.current) {
      const blob = await recorderRef.current.stop();
      setAudioBlob(blob);
    }
    setRecording(false);
    setPaused(false);
  };

  const discard = () => {
    setAudioBlob(null);
    setSeconds(0);
    setTranscript("");
  };

  const save = async () => {
    if (!audioBlob || !draftId) return;
    setSaving(true);
    try {
      const file = new File([audioBlob], `voice_${Date.now()}.webm`, { type: "audio/webm" });
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const rec = await getEmergency(draftId);
      const evidence = [
        ...(rec.evidence || []),
        { type: "audio", url: file_uri, name: "Voice recording", size_kb: Math.round(audioBlob.size / 1024), text: transcript },
      ];
      await updateEmergency(draftId, { evidence });
      navigate("/emergency/evidence");
    } finally {
      setSaving(false);
    }
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <AppShell>
      <div className="px-5 pt-4 rq-content-bottom">
        <ScreenHeader />
        <h1 className="text-2xl font-extrabold text-rq-navy">
          Voice <span className="text-rq-primary">Recording</span>
        </h1>
        <p className="text-sm text-rq-muted mt-1 mb-5">
          Describe what happened in your own words. This helps responders understand the situation faster.
        </p>

        <GlassCard className="mb-3">
          <p className="font-semibold text-rq-navy mb-1">Transcription Language</p>
          <p className="text-xs text-rq-muted mb-3">Used for live transcription</p>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map((l) => (
              <SelectableBox
                key={l.id}
                label={l.label}
                selected={lang === l.id}
                onClick={() => setLang(l.id)}
              />
            ))}
          </div>
        </GlassCard>

        {permState === "requesting" || permState === "denied" || permState === "unavailable" ? (
          <GlassCard>
            <PermissionState
              state={permState}
              onRequest={start}
              icon={Mic}
              deniedHint="Allow microphone access in your browser settings to record voice evidence."
            />
          </GlassCard>
        ) : (
          <GlassCard className={recording ? "!bg-rq-red/5 border border-rq-red/15" : ""}>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-sm font-semibold ${recording ? "text-rq-red" : "text-rq-navy"}`}>
                {recording ? (paused ? "Paused" : "Recording…") : audioBlob ? "Recording ready" : "Ready to record"}
              </span>
              <span className="text-sm font-mono text-rq-muted">{mm}:{ss} / 05:00</span>
            </div>

            <div className="flex items-center justify-center gap-1.5 h-16 mb-4">
              {Array.from({ length: 14 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-full ${recording && !paused ? "bg-rq-red rq-wave-bar" : "bg-rq-red/30"}`}
                  style={{ height: "60%", animationDelay: `${i * 0.07}s` }}
                />
              ))}
            </div>

            {!recording && !audioBlob && (
              <button
                onClick={start}
                className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-rq-red to-rq-redDark text-white flex items-center justify-center shadow-lg shadow-rq-red/30 active:scale-95 transition-transform"
                aria-label="Start recording"
              >
                <Mic className="w-8 h-8" />
              </button>
            )}

            {recording && (
              <div className="flex gap-3">
                <SecondaryButton icon={paused ? Play : Pause} onClick={togglePause}>{paused ? "Resume" : "Pause"}</SecondaryButton>
                <DangerButton icon={Square} onClick={stop}>Stop</DangerButton>
              </div>
            )}

            {!recording && audioBlob && (
              <div className="space-y-2">
                <audio controls src={URL.createObjectURL(audioBlob)} className="w-full" />
              </div>
            )}
          </GlassCard>
        )}

        {(transcript || (recording && isLiveTranscriptionSupported())) && (
          <GlassCard className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-rq-navy text-sm">Live Transcription</p>
              {recording && (
                <span className="text-xs text-rq-success flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rq-success" /> Live · {LANG_LABEL[lang]}
                </span>
              )}
            </div>
            <p className="text-sm text-rq-muted">{transcript || "Listening…"}</p>
          </GlassCard>
        )}

        {!recording && !audioBlob && !isLiveTranscriptionSupported() && permState === "idle" && (
          <p className="text-xs text-rq-muted text-center mt-3">Live transcription isn't supported in this browser.</p>
        )}

        {audioBlob && !recording && (
          <div className="flex gap-3 mt-5">
            <SecondaryButton icon={Trash2} onClick={discard}>Discard</SecondaryButton>
            <PrimaryButton onClick={save} loading={saving}>Save Recording</PrimaryButton>
          </div>
        )}
      </div>
    </AppShell>
  );
}