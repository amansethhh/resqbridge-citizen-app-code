// Real microphone recording abstraction (MediaRecorder). Backend transcription
// can later replace the optional live Web Speech transcription below.

export async function requestMicAccess() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw { code: "unavailable", message: "Microphone is not supported on this device." };
  }
  try {
    return await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    throw { code: "denied", message: "Microphone permission was denied." };
  }
}

export function createRecorder(stream) {
  const recorder = new MediaRecorder(stream);
  const chunks = [];
  recorder.ondataavailable = (e) => chunks.push(e.data);
  return {
    recorder,
    start: () => recorder.start(),
    pause: () => recorder.pause(),
    resume: () => recorder.resume(),
    stop: () =>
      new Promise((resolve) => {
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: "audio/webm" });
          resolve(blob);
        };
        recorder.stop();
        stream.getTracks().forEach((t) => t.stop());
      }),
  };
}

export function isLiveTranscriptionSupported() {
  return "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
}

export function createLiveTranscriber(onText, lang = "en-US") {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = lang;
  let finalText = "";
  recognition.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalText += transcript + " ";
      else interim += transcript;
    }
    onText((finalText + interim).trim());
  };
  return {
    start: () => recognition.start(),
    stop: () => recognition.stop(),
  };
}