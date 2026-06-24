"use client";

import { useEffect, useMemo, useState } from "react";
import { getOutreachEmailDetails, type EmailDetail } from "./actions";

export type OutreachEmail = {
  _id: string;
  companyDomain: string;
  companyName: string;
  contactEmail: string;
  jobSlug: string;
  sentAt: string;
  status: string;
  resendMessageId?: string;
  estimatedHours: number;
  quotedPackage: string;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span style={{ color: "#bbb", fontSize: 12 }}>…</span>;
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    delivered: { bg: "#e6f7eb", fg: "#1f7a3a", label: "Delivered" },
    opened: { bg: "#e7f0ff", fg: "#1a56db", label: "Opened ✓" },
    clicked: { bg: "#e7f0ff", fg: "#1a56db", label: "Clicked ✓" },
    bounced: { bg: "#fde7e7", fg: "#b11a1a", label: "Bounced" },
    complained: { bg: "#fde7e7", fg: "#b11a1a", label: "Spam" },
    delivery_delayed: { bg: "#fff3e0", fg: "#c95b00", label: "Delayed" },
    sent: { bg: "#f0f0f0", fg: "#666", label: "Sent" },
    unknown: { bg: "#f0f0f0", fg: "#999", label: "Unknown" },
  };
  const c = map[status] || { bg: "#f0f0f0", fg: "#666", label: status };
  return (
    <span style={{ padding: "3px 9px", borderRadius: 999, background: c.bg, color: c.fg, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
      {c.label}
    </span>
  );
}

export function EmailsView({ emails }: { emails: OutreachEmail[] }) {
  const [details, setDetails] = useState<Record<string, EmailDetail>>({});
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  function copy(text: string, key: string) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
    });
  }

  useEffect(() => {
    let cancelled = false;
    const ids = emails.map((e) => e.resendMessageId).filter(Boolean) as string[];
    if (ids.length === 0) {
      setLoadingDetails(false);
      return;
    }
    getOutreachEmailDetails(ids)
      .then((res) => {
        if (!cancelled) setDetails(res);
      })
      .finally(() => {
        if (!cancelled) setLoadingDetails(false);
      });
    return () => {
      cancelled = true;
    };
  }, [emails]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return emails;
    return emails.filter(
      (e) =>
        e.companyDomain.toLowerCase().includes(s) ||
        e.companyName.toLowerCase().includes(s) ||
        e.contactEmail.toLowerCase().includes(s),
    );
  }, [emails, q]);

  const stats = useMemo(() => {
    const vals = Object.values(details);
    const delivered = vals.filter((d) => ["delivered", "opened", "clicked"].includes(d.status)).length;
    const opened = vals.filter((d) => ["opened", "clicked"].includes(d.status)).length;
    const bounced = vals.filter((d) => ["bounced", "complained"].includes(d.status)).length;
    return { delivered, opened, bounced };
  }, [details]);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (emails.length === 0) {
    return <div style={emptyBox}>No agency outreach emails logged yet.</div>;
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search website, company, or email…"
          style={{ flex: 1, minWidth: 220, padding: "9px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, fontFamily: "inherit" }}
        />
        <div style={{ fontSize: 12, color: "#666", display: "flex", gap: 12 }}>
          <span>{emails.length} sent</span>
          {loadingDetails ? (
            <span style={{ color: "#bbb" }}>loading delivery…</span>
          ) : (
            <>
              <span style={{ color: "#1f7a3a" }}>{stats.delivered} delivered</span>
              <span style={{ color: "#1a56db" }}>{stats.opened} opened</span>
              {stats.bounced > 0 && <span style={{ color: "#b11a1a" }}>{stats.bounced} bounced</span>}
            </>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((e) => {
          const det = e.resendMessageId ? details[e.resendMessageId] : undefined;
          const isOpen = expanded.has(e._id);
          return (
            <div key={e._id} style={card}>
              <div
                style={{ padding: "12px 16px", display: "grid", gridTemplateColumns: "1.3fr 1.5fr 0.7fr 0.9fr auto auto", gap: 12, alignItems: "center" }}
                className="emails-row"
              >
                <a href={`https://${e.companyDomain}`} target="_blank" rel="noreferrer" title="Open website in new tab" style={{ color: "#111", fontWeight: 600, fontSize: 13, textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {e.companyDomain}
                </a>
                <button
                  type="button"
                  onClick={() => copy(e.contactEmail, `${e._id}:email`)}
                  title="Click to copy email"
                  style={{ background: "none", border: "none", padding: 0, textAlign: "left", color: copied === `${e._id}:email` ? "#1f7a3a" : "#ff5a1f", fontSize: 13, cursor: "pointer", fontFamily: "inherit", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                >
                  {copied === `${e._id}:email` ? "Copied! ✓" : e.contactEmail}
                </button>
                <span style={{ fontSize: 12, color: "#666" }}>{e.quotedPackage}</span>
                <span style={{ fontSize: 12, color: "#999" }}>{formatDate(e.sentAt)}</span>
                <StatusBadge status={det?.status} />
                <button
                  type="button"
                  onClick={() => toggle(e._id)}
                  style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 6, padding: "6px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", color: "#333" }}
                >
                  {isOpen ? "Hide ▲" : "Read email ▾"}
                </button>
              </div>

              {isOpen && (
                <div style={{ padding: "14px 18px", borderTop: "1px solid #eee", background: "#fafafa" }}>
                  <Detail label="Company">{e.companyName}</Detail>
                  {det?.subject && <Detail label="Subject">{det.subject}</Detail>}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ color: "#888", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>Message sent</span>
                      {det?.text && (
                        <button
                          type="button"
                          onClick={() => copy(det.text!, `${e._id}:msg`)}
                          style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 6, padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: copied === `${e._id}:msg` ? "#1f7a3a" : "#333" }}
                        >
                          {copied === `${e._id}:msg` ? "Copied! ✓" : "Copy message"}
                        </button>
                      )}
                    </div>
                    {det?.text ? (
                      <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 6, padding: 12, whiteSpace: "pre-wrap", fontSize: 13, maxHeight: 320, overflow: "auto" }}>
                        {det.text}
                      </div>
                    ) : loadingDetails ? (
                      <span style={{ color: "#bbb" }}>Loading message from Resend…</span>
                    ) : (
                      <span style={{ color: "#999" }}>Message body unavailable.</span>
                    )}
                  </div>
                  <Detail label="Job referenced">
                    <a href={`/jobs/${e.jobSlug}`} target="_blank" rel="noreferrer" style={{ color: "#ff5a1f" }}>{e.jobSlug}</a>
                  </Detail>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <div style={emptyBox}>No emails match &ldquo;{q}&rdquo;.</div>}
      </div>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ color: "#888", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ color: "#222" }}>{children}</div>
    </div>
  );
}

const emptyBox: React.CSSProperties = { padding: 40, textAlign: "center", color: "#999", fontSize: 14, border: "1px solid #eee", borderRadius: 8 };
const card: React.CSSProperties = { border: "1px solid #eee", borderRadius: 8, background: "#fff", overflow: "hidden" };
