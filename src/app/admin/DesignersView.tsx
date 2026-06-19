"use client";

import { useMemo, useState, useTransition } from "react";
import { approveDesigner, rejectDesigner } from "./actions";

export type DesignerRow = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  slug: string;
  bio: string;
  profilePhotoUrl?: string;
  portfolioUrl: string;
  country: string;
  yearsExperience: string;
  specialties: string[];
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  projectRateMin?: number;
  projectRateMax?: number;
  currency: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  dribbbleUrl?: string;
  githubUrl?: string;
  status: string;
  submittedAt: string;
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

function rateLabel(d: DesignerRow): string {
  if (d.hourlyRateMin || d.hourlyRateMax)
    return `${d.currency} ${d.hourlyRateMin ?? "?"}–${d.hourlyRateMax ?? "?"}/hr`;
  if (d.projectRateMin || d.projectRateMax)
    return `${d.currency} ${d.projectRateMin ?? "?"}${d.projectRateMax ? `–${d.projectRateMax}` : "+"}/project`;
  return "Rates on request";
}

export function DesignersView({ designers }: { designers: DesignerRow[] }) {
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0, all: designers.length };
    for (const d of designers) {
      if (d.status === "pending") c.pending++;
      else if (d.status === "approved") c.approved++;
      else if (d.status === "rejected") c.rejected++;
    }
    return c;
  }, [designers]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return designers;
    return designers.filter((d) => d.status === statusFilter);
  }, [designers, statusFilter]);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function act(id: string, fn: (id: string) => Promise<void>) {
    setPendingId(id);
    startTransition(async () => {
      try {
        await fn(id);
      } finally {
        setPendingId(null);
      }
    });
  }

  if (designers.length === 0) {
    return (
      <div style={emptyBox}>
        No designer submissions yet. When someone submits a profile via the
        Designers page, it&apos;ll appear here for review.
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          { key: "pending", label: "Pending", count: counts.pending },
          { key: "approved", label: "Approved", count: counts.approved },
          { key: "rejected", label: "Rejected", count: counts.rejected },
          { key: "all", label: "All", count: counts.all },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setStatusFilter(t.key)}
            style={{
              padding: "8px 14px",
              background: statusFilter === t.key ? "#ff5a1f" : "#fff",
              color: statusFilter === t.key ? "#fff" : "#444",
              border: "1px solid",
              borderColor: statusFilter === t.key ? "#ff5a1f" : "#ddd",
              borderRadius: 6,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: 600,
            }}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={emptyBox}>No designers with status &ldquo;{statusFilter}&rdquo;.</div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((d) => {
          const isOpen = expanded.has(d._id);
          const busy = pendingId === d._id;
          const name = `${d.firstName} ${d.lastName}`;
          return (
            <div key={d._id} style={card}>
              <div style={{ padding: 16, display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                {d.profilePhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={d.profilePhotoUrl} alt="" width={48} height={48} style={{ borderRadius: "50%", objectFit: "cover", background: "#f5f5f5", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#f5f5f5", flexShrink: 0 }} />
                )}

                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <strong style={{ fontSize: 15 }}>{name}</strong>
                    <StatusBadge status={d.status} />
                  </div>
                  <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>
                    {d.country} · {d.yearsExperience} · {rateLabel(d)}
                  </div>
                  <div style={{ color: "#999", fontSize: 12, marginTop: 4 }}>
                    Submitted {formatDate(d.submittedAt)} ·{" "}
                    <a href={`mailto:${d.email}`} style={{ color: "#ff5a1f", textDecoration: "none" }}>{d.email}</a>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button onClick={() => toggle(d._id)} style={btnSmall} disabled={busy}>
                    {isOpen ? "Hide" : "View"}
                  </button>
                  {d.status === "approved" && (
                    <a href={`/designers/${d.slug}`} target="_blank" rel="noreferrer" style={{ ...btnSmall, textDecoration: "none" }}>
                      View live
                    </a>
                  )}
                  {d.status !== "approved" && (
                    <button onClick={() => act(d._id, approveDesigner)} style={btnApprove} disabled={busy || isPending}>
                      {busy ? "..." : "Approve & email"}
                    </button>
                  )}
                  {d.status !== "rejected" && (
                    <button onClick={() => act(d._id, rejectDesigner)} style={btnReject} disabled={busy || isPending}>
                      Reject
                    </button>
                  )}
                </div>
              </div>

              {isOpen && (
                <div style={{ padding: "16px 20px", borderTop: "1px solid #eee", background: "#fafafa", fontSize: 13, lineHeight: 1.6 }}>
                  <Detail label="Bio">{d.bio}</Detail>
                  <Detail label="Specialties">{d.specialties.join(" · ")}</Detail>
                  <Detail label="Portfolio">
                    <a href={d.portfolioUrl} target="_blank" rel="noreferrer" style={{ color: "#ff5a1f" }}>{d.portfolioUrl}</a>
                  </Detail>
                  {(d.linkedinUrl || d.twitterUrl || d.dribbbleUrl || d.githubUrl) && (
                    <Detail label="Links">
                      {[
                        d.linkedinUrl && ["LinkedIn", d.linkedinUrl],
                        d.twitterUrl && ["Twitter/X", d.twitterUrl],
                        d.dribbbleUrl && ["Dribbble", d.dribbbleUrl],
                        d.githubUrl && ["GitHub", d.githubUrl],
                      ]
                        .filter(Boolean)
                        .map((pair) => {
                          const [label, url] = pair as [string, string];
                          return (
                            <a key={label} href={url} target="_blank" rel="noreferrer" style={{ color: "#ff5a1f", marginRight: 12 }}>
                              {label}
                            </a>
                          );
                        })}
                    </Detail>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; fg: string }> = {
    pending: { bg: "#fff3e0", fg: "#c95b00" },
    approved: { bg: "#e6f7eb", fg: "#1f7a3a" },
    rejected: { bg: "#fde7e7", fg: "#b11a1a" },
  };
  const c = colors[status] || { bg: "#eee", fg: "#555" };
  return (
    <span style={{ padding: "3px 10px", borderRadius: 999, background: c.bg, color: c.fg, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
      {status}
    </span>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ color: "#888", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ color: "#222", whiteSpace: "pre-wrap" }}>{children}</div>
    </div>
  );
}

const emptyBox: React.CSSProperties = {
  padding: 40,
  textAlign: "center",
  color: "#999",
  fontSize: 14,
  border: "1px solid #eee",
  borderRadius: 8,
};
const card: React.CSSProperties = { border: "1px solid #eee", borderRadius: 8, background: "#fff", overflow: "hidden" };
const btnSmall: React.CSSProperties = { padding: "8px 12px", background: "#fff", color: "#333", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 };
const btnApprove: React.CSSProperties = { ...btnSmall, background: "#1f7a3a", color: "#fff", borderColor: "#1f7a3a" };
const btnReject: React.CSSProperties = { ...btnSmall, background: "#fff", color: "#b11a1a", borderColor: "#e8b6b6" };
