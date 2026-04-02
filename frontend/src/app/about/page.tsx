"use client";

import AppNavbar from "@/components/AppNavbar";

const team = [
  {
    name: "Nilabha Das",
    role: "AI & ML Lead",
    desc: "Designs the face embedding pipeline and match confidence models.",
    initials: "ND",
    color: "bg-cyan-100 text-cyan-700",
  },
  {
    name: "Juhi Das",
    role: "Frontend - Backend Engineer",
    desc: "Designs the dashboard, builds Flask APIs, database models, and alert workflows.",
    initials: "JD",
    color: "bg-amber-100 text-amber-700",
  },
  {
    name: "Ipsita Kundu",
    role: "Frontend Developer",
    desc: "Crafts the operator dashboards and real-time case interfaces.",
    initials: "IK",
    color: "bg-violet-100 text-violet-700",
  },
  {
    name: "Ishita Kundu",
    role: "Backend Developer",
    desc: "Implements the camera ingestion system and embedding storage architecture.",
    initials: "IK2",
    color: "bg-pink-100 text-pink-700",
  },
  {
    name: "Soheli Mondal",
    role: "Public Safety Advisor",
    desc: "Ensures the platform aligns with field operations and legal standards.",
    initials: "SM",
    color: "bg-emerald-100 text-emerald-700",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#dff4ff_0%,_#f6fbff_42%,_#fff9ef_100%)] text-slate-900">
      <AppNavbar />

      <main className="mx-auto max-w-7xl px-6 pt-32 pb-20 md:px-10">

        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-3 inline-flex items-center rounded-full border border-slate-300/70 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-700 shadow-sm">
            About Us
          </p>
          <h1 className="text-4xl font-extrabold md:text-5xl">
            The Team Behind{" "}
            <span className="bg-gradient-to-r from-cyan-700 via-sky-600 to-amber-500 bg-clip-text text-transparent">
              FindMe AI
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-slate-600">
            We are a multidisciplinary team of engineers, researchers, and
            public safety advocates building technology that helps reunite
            families faster.
          </p>
        </div>

        {/* Mission + Why It Matters */}
        <div className="mb-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-900">Our Mission</h2>
            <p className="mt-4 leading-relaxed text-slate-700">
              FindMe AI focuses on reducing time-to-response in missing person
              investigations. The platform combines a Flask backend, operational
              dashboards, and model-assisted face matching into one streamlined
              decision system.
            </p>
            <p className="mt-4 leading-relaxed text-slate-700">
              Our goal is simple: convert fragmented surveillance data into
              reliable leads that teams can act on quickly and confidently.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-900 p-8 text-slate-100 shadow-sm">
            <h2 className="text-2xl font-extrabold">Why It Matters</h2>
            <ul className="mt-5 space-y-4 text-sm leading-relaxed text-slate-200">
              {[
                "Every second counts — faster detection saves lives.",
                "Prioritizes high-confidence matches to avoid alert fatigue.",
                "Preserves searchable evidence trails for audit and review.",
                "Supports coordination between field teams and control rooms.",
              ].map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-300">
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Team Cards */}
        <h2 className="mb-8 text-center text-2xl font-extrabold text-slate-900">
          Meet the Team
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {team.map((member) => (
            <article
              key={member.name}
              className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm text-center"
            >
              <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-xl font-extrabold ${member.color}`}>
                {member.initials}
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">{member.name}</h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
                {member.role}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{member.desc}</p>
            </article>
          ))}
        </div>

      </main>
    </div>
  );
}