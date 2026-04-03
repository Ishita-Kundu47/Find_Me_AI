// "use client";

// import { useRef, useState, useCallback, useEffect } from "react";
// import AppNavbar from "@/components/AppNavbar";

// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

// interface MatchResult {
//   missing_id: number;
//   name: string;
//   age: string;
//   gender: string;
//   last_seen_location: string;
//   image_path: string;
//   similarity: number;
// }

// export default function CameraPage() {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);

//   const [streaming, setStreaming] = useState(false);
//   const [autoScan, setAutoScan] = useState(false);
//   const [matches, setMatches] = useState<MatchResult[]>([]);
//   const [capturedImage, setCapturedImage] = useState<string | null>(null);
//   const [scanning, setScanning] = useState(false);
//   const [scanCount, setScanCount] = useState(0);
//   const [lastScanTime, setLastScanTime] = useState<string>("");
//   const [error, setError] = useState("");

//   // Start camera
//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { width: 640, height: 480 }
//       });
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         setStreaming(true);
//         setError("");
//       }
//     } catch {
//       setError("Camera access denied. Please allow camera permission.");
//     }
//   };

//   // Stop camera
//   const stopCamera = () => {
//     if (videoRef.current?.srcObject) {
//       const stream = videoRef.current.srcObject as MediaStream;
//       stream.getTracks().forEach(track => track.stop());
//       videoRef.current.srcObject = null;
//     }
//     setStreaming(false);
//     setAutoScan(false);
//     if (intervalRef.current) clearInterval(intervalRef.current);
//   };

//   // Capture and match
//   const captureAndMatch = useCallback(async () => {
//     if (!videoRef.current || !canvasRef.current || scanning) return;

//     const canvas = canvasRef.current;
//     const video = videoRef.current;
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;

//     ctx.drawImage(video, 0, 0);
//     setCapturedImage(canvas.toDataURL("image/jpeg"));

//     canvas.toBlob(async (blob) => {
//       if (!blob) return;
//       setScanning(true);

//       const formData = new FormData();
//       formData.append("image", blob, "capture.jpg");

//       try {
//         const res = await fetch(`${API_BASE_URL}/camera/match`, {
//           method: "POST",
//           body: formData,
//         });
//         const data = await res.json();
//         setMatches(data.matches ?? []);
//         setScanCount(prev => prev + 1);
//         setLastScanTime(new Date().toLocaleTimeString());
//       } catch {
//         setError("Failed to connect to backend.");
//       } finally {
//         setScanning(false);
//       }
//     }, "image/jpeg", 0.8);
//   }, [scanning]);

//   // Auto scan every 10 seconds
//   useEffect(() => {
//     if (autoScan && streaming) {
//       intervalRef.current = setInterval(() => {
//         void captureAndMatch();
//       }, 10000);
//     } else {
//       if (intervalRef.current) clearInterval(intervalRef.current);
//     }
//     return () => {
//       if (intervalRef.current) clearInterval(intervalRef.current);
//     };
//   }, [autoScan, streaming, captureAndMatch]);

//   function resolveImage(path: string) {
//     if (!path) return "";
//     if (path.startsWith("http")) return path;
//     return `${API_BASE_URL}/${path.replace(/\\/g, "/")}`;
//   }

//   return (
//     <div className="min-h-screen bg-slate-50">
//       <AppNavbar />
//       <main className="mx-auto max-w-7xl px-4 py-10 md:px-8">

//         {/* Header */}
//         <div className="mb-8">
//           <p className="mb-2 inline-flex items-center rounded-full border border-slate-300/70 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-700 shadow-sm">
//             Live Surveillance
//           </p>
//           <h1 className="text-3xl font-extrabold text-slate-900">
//             Camera Match System
//           </h1>
//           <p className="mt-2 text-slate-600">
//             Use your laptop camera as CCTV to scan and match faces against the
//             missing persons database in real time.
//           </p>
//         </div>

//         <div className="grid gap-8 lg:grid-cols-2">

//           {/* Camera Feed */}
//           <div className="space-y-4">
//             <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
//               <h2 className="mb-4 text-lg font-extrabold text-slate-900">
//                 Live Feed
//               </h2>

//               {/* Video */}
//               <div className="relative overflow-hidden rounded-2xl bg-slate-900">
//                 <video
//                   ref={videoRef}
//                   autoPlay
//                   playsInline
//                   muted
//                   className="w-full rounded-2xl"
//                   style={{ minHeight: "300px" }}
//                 />
//                 {!streaming && (
//                   <div className="absolute inset-0 flex items-center justify-center">
//                     <p className="text-slate-400 text-sm">Camera is off</p>
//                   </div>
//                 )}
//                 {streaming && (
//                   <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-red-600 px-3 py-1">
//                     <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
//                     <span className="text-xs font-bold text-white">LIVE</span>
//                   </div>
//                 )}
//                 {scanning && (
//                   <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl">
//                     <p className="text-white font-semibold text-sm">
//                       Scanning...
//                     </p>
//                   </div>
//                 )}
//               </div>

//               <canvas ref={canvasRef} className="hidden" />

//               {error && (
//                 <p className="mt-3 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">
//                   {error}
//                 </p>
//               )}

//               {/* Controls */}
//               <div className="mt-4 flex flex-wrap gap-3">
//                 {!streaming ? (
//                   <button
//                     onClick={startCamera}
//                     className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
//                   >
//                     Start Camera
//                   </button>
//                 ) : (
//                   <button
//                     onClick={stopCamera}
//                     className="rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
//                   >
//                     Stop Camera
//                   </button>
//                 )}

//                 <button
//                   onClick={captureAndMatch}
//                   disabled={!streaming || scanning}
//                   className="rounded-full bg-cyan-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:opacity-50"
//                 >
//                   {scanning ? "Scanning..." : "Scan Now"}
//                 </button>

//                 <button
//                   onClick={() => setAutoScan(prev => !prev)}
//                   disabled={!streaming}
//                   className={`rounded-full px-6 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
//                     autoScan
//                       ? "bg-amber-500 text-white hover:bg-amber-600"
//                       : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
//                   }`}
//                 >
//                   {autoScan ? "Auto Scan ON" : "Auto Scan OFF"}
//                 </button>
//               </div>

//               {/* Stats */}
//               <div className="mt-4 grid grid-cols-3 gap-3">
//                 <div className="rounded-xl bg-slate-50 p-3 text-center">
//                   <p className="text-lg font-extrabold text-slate-900">
//                     {scanCount}
//                   </p>
//                   <p className="text-xs text-slate-500">Total Scans</p>
//                 </div>
//                 <div className="rounded-xl bg-slate-50 p-3 text-center">
//                   <p className="text-lg font-extrabold text-slate-900">
//                     {matches.length}
//                   </p>
//                   <p className="text-xs text-slate-500">Matches Found</p>
//                 </div>
//                 <div className="rounded-xl bg-slate-50 p-3 text-center">
//                   <p className="text-lg font-extrabold text-slate-900">
//                     {lastScanTime || "--"}
//                   </p>
//                   <p className="text-xs text-slate-500">Last Scan</p>
//                 </div>
//               </div>
//             </div>

//             {/* Captured frame */}
//             {capturedImage && (
//               <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
//                 <h3 className="mb-3 text-sm font-extrabold text-slate-900">
//                   Last Captured Frame
//                 </h3>
//                 <img
//                   src={capturedImage}
//                   alt="Captured"
//                   className="w-full rounded-2xl object-cover"
//                 />
//               </div>
//             )}
//           </div>

//           {/* Match Results */}
//           <div className="space-y-4">
//             <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
//               <div className="mb-4 flex items-center justify-between">
//                 <h2 className="text-lg font-extrabold text-slate-900">
//                   Match Results
//                 </h2>
//                 {matches.length > 0 && (
//                   <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
//                     {matches.length} match{matches.length > 1 ? "es" : ""} found
//                   </span>
//                 )}
//               </div>

//               {matches.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center py-12 text-center">
//                   <p className="text-slate-400 text-sm">
//                     No matches found yet. Start the camera and scan.
//                   </p>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {matches.map((match) => (
//                     <div
//                       key={match.missing_id}
//                       className="rounded-2xl border border-slate-200 p-4"
//                     >
//                       <div className="flex gap-4">
//                         <img
//                           src={resolveImage(match.image_path)}
//                           alt={match.name}
//                           className="h-20 w-20 rounded-xl object-cover"
//                         />
//                         <div className="flex-1 space-y-1">
//                           <div className="flex items-center justify-between">
//                             <p className="font-extrabold text-slate-900">
//                               {match.name}
//                             </p>
//                             <span
//                               className={`rounded-full px-2 py-1 text-xs font-bold ${
//                                 match.similarity >= 80
//                                   ? "bg-emerald-100 text-emerald-700"
//                                   : match.similarity >= 60
//                                     ? "bg-amber-100 text-amber-700"
//                                     : "bg-red-100 text-red-700"
//                               }`}
//                             >
//                               {match.similarity}%
//                             </span>
//                           </div>
//                           <p className="text-sm text-slate-600">
//                             Age: {match.age} | Gender: {match.gender}
//                           </p>
//                           <p className="text-sm text-slate-600">
//                             Last seen: {match.last_seen_location || "Unknown"}
//                           </p>
//                           <p className="text-xs text-slate-400">
//                             Missing ID: {match.missing_id}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }


"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import AppNavbar from "@/components/AppNavbar";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

interface MatchResult {
  missing_id: number;
  name: string;
  age: string;
  gender: string;
  last_seen_location: string;
  image_path: string;
  similarity: number;
}

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [streaming, setStreaming] = useState(false);
  const [autoScan, setAutoScan] = useState(false);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [lastScanTime, setLastScanTime] = useState<string>("");
  const [error, setError] = useState("");

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
        setError("");
      }
    } catch {
      setError("Camera access denied. Please allow camera permission.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreaming(false);
    setAutoScan(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const captureAndMatch = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || scanning) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    setCapturedImage(canvas.toDataURL("image/jpeg"));

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      setScanning(true);

      const formData = new FormData();
      formData.append("image", blob, "capture.jpg");

      try {
        const res = await fetch(`${API_BASE_URL}/camera/match`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        setMatches(data.matches ?? []);
        setScanCount(prev => prev + 1);
        setLastScanTime(new Date().toLocaleTimeString());
      } catch {
        setError("Failed to connect to backend.");
      } finally {
        setScanning(false);
      }
    }, "image/jpeg", 0.8);
  }, [scanning]);

  useEffect(() => {
    if (autoScan && streaming) {
      intervalRef.current = setInterval(() => {
        void captureAndMatch();
      }, 10000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoScan, streaming, captureAndMatch]);

  function resolveImage(path: string) {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_BASE_URL}/${path.replace(/\\/g, "/")}`;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar />
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-8">

        <div className="mb-8">
          <p className="mb-2 inline-flex items-center rounded-full border border-slate-300/70 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-700 shadow-sm">
            Live Surveillance
          </p>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Camera Match System
          </h1>
          <p className="mt-2 text-slate-600">
            Use your laptop camera as CCTV to scan and match faces against
            the missing persons database in real time.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">

          {/* Camera Feed */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-extrabold text-slate-900">
                Live Feed
              </h2>

              <div className="relative overflow-hidden rounded-2xl bg-slate-900">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-2xl"
                  style={{ minHeight: "300px" }}
                />
                {!streaming && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-slate-400 text-sm">Camera is off</p>
                  </div>
                )}
                {streaming && (
                  <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-red-600 px-3 py-1">
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
                    <span className="text-xs font-bold text-white">LIVE</span>
                  </div>
                )}
                {scanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl">
                    <p className="text-white font-semibold text-sm">Scanning...</p>
                  </div>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden" />

              {error && (
                <p className="mt-3 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                {!streaming ? (
                  <button
                    onClick={startCamera}
                    className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    Start Camera
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
                  >
                    Stop Camera
                  </button>
                )}

                <button
                  onClick={captureAndMatch}
                  disabled={!streaming || scanning}
                  className="rounded-full bg-cyan-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:opacity-50"
                >
                  {scanning ? "Scanning..." : "Scan Now"}
                </button>

                <button
                  onClick={() => setAutoScan(prev => !prev)}
                  disabled={!streaming}
                  className={`rounded-full px-6 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
                    autoScan
                      ? "bg-amber-500 text-white hover:bg-amber-600"
                      : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  {autoScan ? "Auto Scan ON" : "Auto Scan OFF"}
                </button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-lg font-extrabold text-slate-900">{scanCount}</p>
                  <p className="text-xs text-slate-500">Total Scans</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-lg font-extrabold text-slate-900">{matches.length}</p>
                  <p className="text-xs text-slate-500">Matches Found</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-lg font-extrabold text-slate-900">{lastScanTime || "--"}</p>
                  <p className="text-xs text-slate-500">Last Scan</p>
                </div>
              </div>
            </div>

            {capturedImage && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-3 text-sm font-extrabold text-slate-900">
                  Last Captured Frame
                </h3>
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full rounded-2xl object-cover"
                />
              </div>
            )}
          </div>

          {/* Match Results */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-slate-900">
                  Match Results
                </h2>
                {matches.length > 0 && (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    {matches.length} match{matches.length > 1 ? "es" : ""} found
                  </span>
                )}
              </div>

              {matches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-slate-400 text-sm">
                    No matches found yet. Start the camera and scan.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {matches.map((match) => (
                    <div
                      key={match.missing_id}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="flex gap-4">
                        <img
                          src={resolveImage(match.image_path)}
                          alt={match.name}
                          className="h-20 w-20 rounded-xl object-cover"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-extrabold text-slate-900">
                              {match.name}
                            </p>
                            <span className={`rounded-full px-2 py-1 text-xs font-bold ${
                              match.similarity >= 80
                                ? "bg-emerald-100 text-emerald-700"
                                : match.similarity >= 60
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700"
                            }`}>
                              {match.similarity}%
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">
                            Age: {match.age} | Gender: {match.gender}
                          </p>
                          <p className="text-sm text-slate-600">
                            Last seen: {match.last_seen_location || "Unknown"}
                          </p>
                          <p className="text-xs text-slate-400">
                            Missing ID: {match.missing_id}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
// ```

// **Step 3 — Save the file and the page will work at:**
// ```
// http://localhost:3000/camera