"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Match {
  case_id: string;
  name: string;
  similarity: number;
  age?: number;
  photo_url?: string;
}

interface MatchResult {
  matches: Match[];
  total_matches: number;
  frame_age_s?: number;
  embedding_drift?: number;
}

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [lastResult, setLastResult] = useState<MatchResult | null>(null);
  const [alertLog, setAlertLog] = useState<{ time: string; msg: string; confidence: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [frameCount, setFrameCount] = useState(0);
  const [cameraId, setCameraId] = useState("CAM-01");

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
        setError(null);
      }
    } catch {
      setError("Camera access denied. Please allow camera permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsStreaming(false);
    setIsScanning(false);
  }, []);

  const captureAndSend = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append("frame", blob, "frame.jpg");

      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8000/camera/match", {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });

        if (!res.ok) {
          console.error("Match endpoint error:", res.status);
          return;
        }

        const data: MatchResult = await res.json();
        setLastResult(data);
        setFrameCount((c) => c + 1);

        if (data.total_matches > 0) {
          setMatches(data.matches);
          const topMatch = data.matches[0];
          setAlertLog((prev) => [
            {
              time: new Date().toLocaleTimeString(),
              msg: `Potential match: ${topMatch.name ?? topMatch.case_id}`,
              confidence: Math.round(topMatch.similarity * 100),
            },
            ...prev.slice(0, 19),
          ]);
        } else {
          setMatches([]);
        }
      } catch (e) {
        console.error("Frame send error:", e);
      }
    }, "image/jpeg", 0.85);
  }, []);

  const startScanning = useCallback(() => {
    if (!isStreaming) return;
    setIsScanning(true);
    intervalRef.current = setInterval(captureAndSend, 1500);
  }, [isStreaming, captureAndSend]);

  const stopScanning = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsScanning(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const topConfidence =
    matches.length > 0 ? Math.round(matches[0].similarity * 100) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">
              Live Surveillance
            </p>
            <h1 className="text-2xl font-bold text-gray-900">Camera Monitor</h1>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={cameraId}
              onChange={(e) => setCameraId(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="CAM-01">CAM-01 — Front Entrance</option>
              <option value="CAM-02">CAM-02 — Corridor</option>
              <option value="CAM-03">CAM-03 — Exit Gate</option>
            </select>
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                isScanning
                  ? "bg-green-50 text-green-700"
                  : isStreaming
                  ? "bg-yellow-50 text-yellow-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isScanning
                    ? "bg-green-500 animate-pulse"
                    : isStreaming
                    ? "bg-yellow-500"
                    : "bg-gray-400"
                }`}
              />
              {isScanning ? "LIVE SCAN" : isStreaming ? "STANDBY" : "OFFLINE"}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera Feed */}
        <div className="lg:col-span-2 space-y-4">
          {/* Video */}
          <div className="bg-black rounded-2xl overflow-hidden relative aspect-video">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              muted
              playsInline
            />
            <canvas ref={canvasRef} className="hidden" />

            {!isStreaming && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <div className="w-16 h-16 rounded-full border-2 border-white/30 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.277A1 1 0 0121 8.68v6.64a1 1 0 01-1.447.894L15 14M4 8h8a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2z" />
                  </svg>
                </div>
                <p className="text-sm opacity-50">Camera feed offline</p>
              </div>
            )}

            {/* Overlay HUD */}
            {isStreaming && (
              <>
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-white font-mono">
                  {cameraId} &nbsp;·&nbsp; {new Date().toLocaleTimeString()}
                </div>
                {topConfidence !== null && (
                  <div className="absolute top-3 right-3 bg-red-600/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-white font-semibold">
                    ⚠ MATCH {topConfidence}%
                  </div>
                )}
                {isScanning && (
                  <div className="absolute bottom-3 right-3 bg-green-600/80 rounded-lg px-3 py-1.5 text-xs text-white font-mono">
                    Frames: {frameCount}
                  </div>
                )}
              </>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-3">
            {!isStreaming ? (
              <button
                onClick={startCamera}
                className="flex-1 bg-gray-900 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                Start Camera
              </button>
            ) : (
              <>
                {!isScanning ? (
                  <button
                    onClick={startScanning}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                  >
                    ▶ Start Scanning
                  </button>
                ) : (
                  <button
                    onClick={stopScanning}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                  >
                    ⏸ Pause Scanning
                  </button>
                )}
                <button
                  onClick={stopCamera}
                  className="px-6 bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  Stop
                </button>
              </>
            )}
          </div>

          {/* Stats Bar */}
          {lastResult && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
                <p className="text-xs text-gray-400 mb-1">Frame Age</p>
                <p className="text-lg font-bold text-gray-800">
                  {lastResult.frame_age_s?.toFixed(1) ?? "—"}s
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
                <p className="text-xs text-gray-400 mb-1">Embedding Drift</p>
                <p className="text-lg font-bold text-gray-800">
                  {lastResult.embedding_drift?.toFixed(2) ?? "—"}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
                <p className="text-xs text-gray-400 mb-1">Matches Found</p>
                <p className="text-lg font-bold text-gray-800">
                  {lastResult.total_matches}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Live Matches */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Live Matches
            </h2>
            {matches.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                  </svg>
                </div>
                <p className="text-sm">No matches detected</p>
              </div>
            ) : (
              <div className="space-y-3">
                {matches.map((m, i) => {
                  const conf = Math.round(m.similarity * 100);
                  return (
                    <div
                      key={i}
                      className={`rounded-xl p-3 border ${
                        conf >= 80
                          ? "bg-red-50 border-red-200"
                          : conf >= 60
                          ? "bg-yellow-50 border-yellow-200"
                          : "bg-gray-50 border-gray-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-800">
                          {m.name ?? m.case_id}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            conf >= 80
                              ? "bg-red-600 text-white"
                              : conf >= 60
                              ? "bg-yellow-500 text-white"
                              : "bg-gray-400 text-white"
                          }`}
                        >
                          {conf}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">Case: {m.case_id}</p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            conf >= 80 ? "bg-red-500" : conf >= 60 ? "bg-yellow-500" : "bg-blue-400"
                          }`}
                          style={{ width: `${conf}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Alert Log */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Alert Log
            </h2>
            {alertLog.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No alerts yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {alertLog.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-xs border-b border-gray-50 pb-2"
                  >
                    <span className="text-gray-400 shrink-0 font-mono">{a.time}</span>
                    <span className="text-gray-700 flex-1">{a.msg}</span>
                    <span className="text-red-600 font-bold shrink-0">{a.confidence}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}