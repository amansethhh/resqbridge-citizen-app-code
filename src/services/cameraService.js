// Real mobile camera abstraction using the device's native camera app via a
// capture input (works across iOS/Android browsers without extra permissions
// UI of our own). Swap for a native camera SDK later without touching screens.

export function capturePhoto() {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) resolve(file);
      else reject({ code: "cancelled", message: "No photo was captured." });
    };
    input.click();
  });
}

export function pickFromGallery() {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) resolve(file);
      else reject({ code: "cancelled", message: "No photo was selected." });
    };
    input.click();
  });
}

// In-screen live camera preview via getUserMedia (mobile browsers). Falls back
// to the native camera-app file input above where a live stream is unavailable.

export function isCameraStreamSupported() {
  return typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
}

export async function startStream(facingMode = "environment") {
  return navigator.mediaDevices.getUserMedia({
    video: { facingMode: { ideal: facingMode } },
    audio: false,
  });
}

export function stopStream(stream) {
  if (!stream) return;
  stream.getTracks().forEach((t) => t.stop());
}

export function captureFromStream(videoEl, name = `photo_${Date.now()}.jpg`) {
  const canvas = document.createElement("canvas");
  canvas.width = videoEl.videoWidth || 720;
  canvas.height = videoEl.videoHeight || 960;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject({ code: "capture_failed", message: "Could not capture photo." });
        resolve(new File([blob], name, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92
    );
  });
}