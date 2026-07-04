// app/page.jsx
"use client";

import { useState } from "react";

const PIPELINE = [
  { key: "receive", label: "webhook received" },
  { key: "score", label: "AI scoring lead" },
  { key: "log", label: "logging to sheet" },
  { key: "reply", label: "sending reply" },
  { key: "done", label: "owner alerted" },
];

export default function Home() {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [feedback, setFeedback] = useState("");
  const [stage, setStage] = useState(-1);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit() {
    if (status === "sending") return;
    if (!form.name || !form.email || !form.message) {
      setStatus("error");
      setFeedback("Name, email and message are required.");
      return;
    }

    setStatus("sending");
    setFeedback("");
    setStage(0);

    // Animate the pipeline strip while the real request runs
    const ticker = setInterval(() => {
      setStage((s) => (s < PIPELINE.length - 2 ? s + 1 : s));
    }, 700);

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      clearInterval(ticker);

      if (data.success) {
        setStage(PIPELINE.length - 1);
        setStatus("success");
        setFeedback(data.message);
        setForm({ name: "", email: "", company: "", message: "" });
      } else {
        setStage(-1);
        setStatus("error");
        setFeedback(data.error || "Something went wrong. Try again.");
      }
    } catch {
      clearInterval(ticker);
      setStage(-1);
      setStatus("error");
      setFeedback("Couldn't reach the server. Check your connection and try again.");
    }
  }

  return (
    <main className="wrap">
      <header className="masthead">
        <span className="brand">Lead Qualfier</span>
        <span className="tagline">automation studio</span>
      </header>

      <section className="hero">
        <p className="eyebrow">// every message below triggers a live n8n workflow</p>
        <h1>
          Your leads answered <em>in seconds,</em>
          <br />
          not in days.
        </h1>
        <p className="sub">
          This form is a working demo. Submit it and an AI qualifies your message, logs it,
          replies by email, and pings the owner — automatically. Watch it run.
        </p>
      </section>

      <section className="panel">
        <div className="form">
          <div className="row">
            <label>
              <span className="lbl">Name</span>
              <input
                value={form.name}
                onChange={set("name")}
                placeholder="Sara Ahmed"
                disabled={status === "sending"}
              />
            </label>
            <label>
              <span className="lbl">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="sara@company.com"
                disabled={status === "sending"}
              />
            </label>
          </div>

          <label>
            <span className="lbl">Company <i>(optional)</i></span>
            <input
              value={form.company}
              onChange={set("company")}
              placeholder="Company name"
              disabled={status === "sending"}
            />
          </label>

          <label>
            <span className="lbl">What do you want to automate?</span>
            <textarea
              rows={4}
              value={form.message}
              onChange={set("message")}
              placeholder="e.g. We spend hours copying orders into spreadsheets every week…"
              disabled={status === "sending"}
            />
          </label>

          <button onClick={handleSubmit} disabled={status === "sending"}>
            {status === "sending" ? "Running workflow…" : "Send message"}
          </button>

          {feedback && (
            <p className={status === "success" ? "note ok" : "note err"} role="status">
              {feedback}
            </p>
          )}
        </div>

        {/* Signature element: the live pipeline strip */}
        <ol className="pipeline" aria-label="Automation pipeline status">
          {PIPELINE.map((step, i) => {
            const state =
              stage === -1 ? "idle" : i < stage ? "done" : i === stage ? "active" : "idle";
            return (
              <li key={step.key} className={state}>
                <span className="dot" />
                <span className="step">{step.label}</span>
              </li>
            );
          })}
        </ol>
      </section>

      <footer className="foot">
        <span>built with n8n · Groq · Next.js — a project by Areeba Arif</span>
      </footer>
    </main>
  )
}
