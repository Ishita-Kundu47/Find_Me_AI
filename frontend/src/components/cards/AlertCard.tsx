// import type { AlertRecord } from "@/types";

// interface AlertCardProps {
//   alert: AlertRecord;
// }

// export default function AlertCard({ alert }: AlertCardProps) {
//   return (
//     <article className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm sm:flex-row">
//       <img
//         src={alert.personImage}
//         alt="Alert person"
//         className="h-24 w-24 rounded-xl object-cover"
//       />
//       <div className="space-y-1">
//         <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
//           Potential Match
//         </p>
//         <p className="text-sm font-semibold text-slate-800">
//           Confidence:{" "}
//           <span className="text-amber-700">{alert.confidence.toFixed(1)}%</span>
//         </p>
//         <p className="text-sm text-slate-700">Location: {alert.location}</p>
//         <p className="text-sm text-slate-700">Contact: {alert.contactInfo}</p>
//       </div>
//     </article>
//   );
// }


import type { AlertRecord } from "@/types";

interface AlertCardProps {
  alert: AlertRecord;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

function resolveImage(path: string | undefined): string {
  if (!path) return "https://via.placeholder.com/100";
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}/${path.replace(/\\/g, "/")}`;
}

export default function AlertCard({ alert }: AlertCardProps) {
  const confidence = alert.confidence ?? 0;
  const confidenceColor =
    confidence >= 80
      ? "text-emerald-700 bg-emerald-100"
      : confidence >= 50
        ? "text-amber-700 bg-amber-100"
        : "text-red-700 bg-red-100";

  return (
    <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
          Potential Match
        </p>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${confidenceColor}`}>
          {confidence.toFixed(1)}% Match
        </span>
      </div>

      {/* Images side by side */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 text-center">
          <img
            src={resolveImage(alert.missingImage)}
            alt="Missing person"
            className="h-32 w-full rounded-xl object-cover border border-slate-200"
          />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Missing
          </p>
        </div>
        <div className="space-y-2 text-center">
          <img
            src={resolveImage(alert.foundImage)}
            alt="Found person"
            className="h-32 w-full rounded-xl object-cover border border-slate-200"
          />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Found
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-1">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Missing Person
          </p>
          <p className="font-semibold text-slate-800">
            {alert.missingName ?? "Unknown"}
          </p>
          <p className="text-slate-600">
            Age: {alert.missingAge ?? "Unknown"}
          </p>
          <p className="text-slate-600">
            Gender: {alert.missingGender ?? "Unknown"}
          </p>
          <p className="text-slate-600">
            Last seen: {alert.missingLocation ?? "Unknown"}
          </p>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-1">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Found Person
          </p>
          <p className="font-semibold text-slate-800">
            Location: {alert.foundLocation ?? "Unknown"}
          </p>
          <p className="text-slate-600">
            Contact: {alert.foundContact ?? "Unknown"}
          </p>
          <p className="text-slate-600">
            Case: Missing ID {alert.missingId} | Found ID {alert.foundId}
          </p>
        </div>
      </div>

    </article>
  );
}
