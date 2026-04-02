"use client";

import { useState } from "react";
import AppNavbar from "@/components/AppNavbar";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // TODO: connect to your backend or email service
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#dff4ff_0%,_#f6fbff_42%,_#fff9ef_100%)] text-slate-900">
      <AppNavbar />

      <main className="mx-auto max-w-7xl px-6 pt-32 pb-20 md:px-10">

        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-3 inline-flex items-center rounded-full border border-slate-300/70 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-700 shadow-sm">
            Contact Us
          </p>
          <h1 className="text-4xl font-extrabold md:text-5xl">
            Get in{" "}
            <span className="bg-gradient-to-r from-cyan-700 via-sky-600 to-amber-500 bg-clip-text text-transparent">
              Touch
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-slate-600">
            Have a question, want to report an issue, or need help with the
            platform? We are here to help.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">

          {/* Contact Info Cards */}
          <div className="space-y-6">
            {[
              {
                label: "Email Us",
                value: "team@findme.ai",
                desc: "We reply within 24 hours on business days.",
                icon: "✉",
                color: "bg-cyan-100 text-cyan-700",
              },
              {
                label: "Emergency Hotline",
                value: "+91 99999 99999",
                desc: "For urgent missing person cases only.",
                icon: "📞",
                color: "bg-amber-100 text-amber-700",
              },
              {
                label: "Office Location",
                value: "Kolkata, West Bengal, India",
                desc: "Available for in-person meetings by appointment.",
                icon: "📍",
                color: "bg-emerald-100 text-emerald-700",
              },
              {
                label: "Response Time",
                value: "Under 24 Hours",
                desc: "Average first response time for all inquiries.",
                icon: "⏱",
                color: "bg-violet-100 text-violet-700",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm"
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl ${item.color}`}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-slate-900">
                    {item.value}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm">
            {submitted ? (
              <div className="flex h-full flex-col items-center justify-center text-center py-10">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
                  ✓
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900">
                  Message Sent!
                </h3>
                <p className="mt-3 text-slate-600">
                  Thank you for reaching out. We will get back to you within 24
                  hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", subject: "", message: "" }); }}
                  className="mt-6 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Send a Message
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@email.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    title="Subject"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100">
                    <option value="">Select a subject</option>
                    <option value="missing">Report a Missing Person</option>
                    <option value="found">Report a Found Person</option>
                    <option value="technical">Technical Support</option>
                    <option value="partnership">Partnership Inquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Describe your inquiry in detail..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 resize-none"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full rounded-full bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 hover:-translate-y-0.5"
                >
                  Send Message
                </button>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}