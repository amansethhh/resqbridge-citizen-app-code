import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Images, RotateCcw, Check, MapPin, SwitchCamera, AlertTriangle } from "lucide-react";
import ScreenHeader from "@/components/resqbridge/ScreenHeader";
import GlassCard from "@/components/resqbridge/GlassCard";
import AppShell from "@/components/resqbridge/AppShell";
import { PrimaryButton, SecondaryButton } from "@/components/resqbridge/Buttons";
import { Switch } from "@/components/ui/switch";
import { base44 } from "@/api/base44Client";
import {
  capturePhoto,
  pickFromGallery,
  isCameraStreamSupported,
  startStream,
  stopStream,
  captureFromStream,
} from "@/services/cameraService";
import { getCurrentLocation } from "@/services/locationService";
import { getEmergency, updateEmergency } from "@/services/emergencyService";
import { useEmergency } from "@/state/EmergencyContext";

export default function ImageCapture() {
  const navigate = useNavigate();
  const { draftId } = useEmergency();
  const videoRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [streamError, setStreamError] = useState("");
  const [tagLocation, setTagLocation] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const streamSupported = isCameraStreamSupported();

  // Start / restart the live camera stream whenever facing mode changes or the
  // user clears a captured preview. Stops cleanly on unmount.
  useEffect(() => {
    if (preview || !streamSupported) return;
    let active = true;
    let stream;
    startStream(facingMode)
      .then((s) => {
        if (!active) {
          stopStream(s);
          return;
        }
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch((err) => {
        if (!active) return;
        setStreamError(err?.name === "NotAllowedError" ? "denied" : "unavailable");
      });
    return () => {
      active = false;
      stopStream(stream);
    };
  }, [facingMode, preview, streamSupported]);

  const applyFile = (f) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStreamError("");
  };

  const captureLive = async () => {
    setError("");
    try {
      if (streamSupported && videoRef.current && videoRef.current.srcObject) {
        const f = await captureFromStream(videoRef.current);
        applyFile(f);
        return;
      }
      const f = await capturePhoto();
      applyFile(f);
    } catch (err) {
      if (err.code !== "cancelled") setError(err.message || "Could not capture photo.");
    }
  };

  const fromGallery = async () => {
    setError("");
    try {
      const f = await pickFromGallery();
      applyFile(f);
    } catch (err) {
      if (err.code !== "cancelled") setError(err.message);
    }
  };

  const switchCamera = () => setFacingMode((m) => (m === "environment" ? "user" : "environment"));

  const retake = () => {
    setFile(null);
    setPreview(null);
  };

  const confirm = async () => {
    if (!file || !draftId) return;
    setUploading(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      let coords = null;
      if (tagLocation) {
        try {
          coords = await getCurrentLocation();
        } catch {
          coords = null;
        }
      }
      const rec = await getEmergency(draftId);
      const evidence = [
        ...(rec.evidence || []),
        {
          type: "image",
          url: file_uri,
          name: file.name || "photo.jpg",
          size_kb: Math.round(file.size / 1024),
        },
      ];
      await updateEmergency(draftId, {
        evidence,
        ...(coords ? { location_lat: coords.lat, location_lng: coords.lng, location_accuracy: coords.accuracy } : {}),
      });
      navigate("/emergency/evidence");
    } finally {
      setUploading(false);
    }
  };

  const showLiveVideo = streamSupported && !preview && !streamError;

  return (
    <AppShell>
      <div className="px-5 pt-4 rq-content-bottom">
        <ScreenHeader />
        <h1 className="text-2xl font-extrabold text-rq-navy">
          Image <span className="text-rq-primary">Capture</span>
        </h1>
        <p className="text-sm text-rq-muted mt-1 mb-5">
          Take clear photos of the situation to help responders understand better.
        </p>

        <div className="rounded-2xl overflow-hidden bg-slate-900 aspect-[4/5] flex items-center justify-center relative">
          {preview ? (
            <img src={preview} alt="Captured" className="w-full h-full object-cover" />
          ) : showLiveVideo ? (
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          ) : streamError === "denied" ? (
            <div className="text-center text-white/70 px-6">
              <AlertTriangle className="w-9 h-9 mx-auto mb-2 text-rq-red" />
              <p className="text-sm font-semibold">Camera permission denied</p>
              <p className="text-xs text-white/50 mt-1">Allow camera access or use Gallery / the capture button.</p>
            </div>
          ) : streamError === "unavailable" ? (
            <div className="text-center text-white/70 px-6">
              <Camera className="w-10 h-10 mx-auto mb-2" />
              <p className="text-sm">Live camera isn't available. Tap the camera button to use your device camera.</p>
            </div>
          ) : (
            <div className="text-center text-white/60 px-6">
              <Camera className="w-10 h-10 mx-auto mb-2" />
              <p className="text-sm">Tap the camera button below to capture a photo of the situation.</p>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-rq-red mt-2">{error}</p>}

        <GlassCard className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-4 h-4 text-rq-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-rq-navy">Location Tagging</p>
              <p className="text-xs text-rq-muted">Automatically add location to photos</p>
            </div>
          </div>
          <Switch checked={tagLocation} onCheckedChange={setTagLocation} />
        </GlassCard>

        <div className="flex gap-3 mt-5 items-center">
          {!preview ? (
            <>
              <SecondaryButton icon={Images} onClick={fromGallery} className="flex-1">Gallery</SecondaryButton>
              <button
                onClick={captureLive}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-rq-primary to-rq-cyan text-white flex items-center justify-center shadow-lg shadow-rq-primary/30 active:scale-95 transition-transform flex-shrink-0"
                aria-label="Capture photo"
              >
                <Camera className="w-7 h-7" />
              </button>
              {showLiveVideo ? (
                <button
                  onClick={switchCamera}
                  className="w-14 h-14 rounded-full rq-glass flex items-center justify-center text-rq-navy active:scale-95 transition-transform flex-shrink-0"
                  aria-label="Switch camera"
                >
                  <SwitchCamera className="w-6 h-6" />
                </button>
              ) : (
                <div className="flex-1" />
              )}
            </>
          ) : (
            <>
              <SecondaryButton icon={RotateCcw} onClick={retake}>Retake</SecondaryButton>
              <PrimaryButton icon={Check} onClick={confirm} loading={uploading}>Confirm</PrimaryButton>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}