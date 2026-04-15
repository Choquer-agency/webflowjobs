"use client";

import { useMemo, useState, useTransition } from "react";
import {
  approveSubmission,
  rejectSubmission,
  deleteSubmission,
} from "./actions";

export type Submission = {
  _id: string;
  title: string;
  jobDescription: string;
  jobType: string;
  category: string;
  location: string;
  postingEmail: string;
  postingUrl?: string;
  companyName: string;
  companyLogoUrl?: string;
  companyWebsite: string;
  aboutCompany: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: string;
  comments?: string;
  wantsEmailBlast?: boolean;
  wants4WeekSpotlight?: boolean;
  wants1WeekSpotlight?: boolean;
  status: string;
  submittedAt: string;
  reviewedAt?: string;
  publishedJobId?: string;
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

export function SubmissionsView({
  submissions,
}: {
  submissions: Submission[];
}) {
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0, all: submissions.length };
    for (const s of submissions) {
      if (s.status === "pending") c.pending++;
      else if (s.status === "approved") c.approved++;
      else if (s.status === "rejected") c.rejected++;
    }
    return c;
  }, [submissions]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return submissions;
    return submissions.filter((s) => s.status === statusFilter);
  }, [submissions, statusFilter]);

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

  if (submissions.length === 0) {
    return (
      <div
        style={{
          padding: 48,
          textAlign: "center",
          color: "#999",
          fontSize: 14,
          border: "1px solid #eee",
          borderRadius: 8,
        }}
      >
        No job submissions yet. When a business posts a free job via the Post A
        Job form, it&apos;ll appear here for review.
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
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
        <div
          style={{
            padding: 40,
            textAlign: "center",
            color: "#999",
            fontSize: 14,
            border: "1px solid #eee",
            borderRadius: 8,
          }}
        >
          No submissions with status &ldquo;{statusFilter}&rdquo;.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((s) => {
          const isOpen = expanded.has(s._id);
          const busy = pendingId === s._id;
          return (
            <div
              key={s._id}
              style={{
                border: "1px solid #eee",
                borderRadius: 8,
                background: "#fff",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: 16,
                  display: "flex",
                  gap: 16,
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                }}
              >
                {s.companyLogoUrl ? (
                  <img
                    src={s.companyLogoUrl}
                    alt=""
                    width={48}
                    height={48}
                    style={{
                      borderRadius: 6,
                      objectFit: "cover",
                      background: "#f5f5f5",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 6,
                      background: "#f5f5f5",
                      flexShrink: 0,
                    }}
                  />
                )}

                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <strong style={{ fontSize: 15 }}>{s.title}</strong>
                    <StatusBadge status={s.status} />
                  </div>
                  <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>
                    {s.companyName} · {s.jobType} · {s.category} · {s.location}
                  </div>
                  <div style={{ color: "#999", fontSize: 12, marginTop: 4 }}>
                    Submitted {formatDate(s.submittedAt)} ·{" "}
                    <a
                      href={`mailto:${s.postingEmail}`}
                      style={{ color: "#ff5a1f", textDecoration: "none" }}
                    >
                      {s.postingEmail}
                    </a>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button
                    onClick={() => toggle(s._id)}
                    style={btnSmall}
                    disabled={busy}
                  >
                    {isOpen ? "Hide" : "View"}
                  </button>
                  {s.status === "pending" && (
                    <>
                      <button
                        onClick={() => act(s._id, approveSubmission)}
                        style={btnApprove}
                        disabled={busy || isPending}
                      >
                        {busy ? "..." : "Approve"}
                      </button>
                      <button
                        onClick={() => act(s._id, rejectSubmission)}
                        style={btnReject}
                        disabled={busy || isPending}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {s.status !== "pending" && (
                    <button
                      onClick={() => {
                        if (confirm("Delete this submission?")) {
                          act(s._id, deleteSubmission);
                        }
                      }}
                      style={btnReject}
                      disabled={busy || isPending}
                    >
                      Delete
                    </button>
                  )}
                  {s.status === "approved" && s.publishedJobId && (
                    <a
                      href={`/jobs/${s.publishedJobId}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ ...btnSmall, textDecoration: "none" }}
                    >
                      View live
                    </a>
                  )}
                </div>
              </div>

              {isOpen && (
                <div
                  style={{
                    padding: "16px 20px",
                    borderTop: "1px solid #eee",
                    background: "#fafafa",
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  <Detail label="Job Description">
                    <div
                      style={{
                        background: "#fff",
                        padding: 12,
                        borderRadius: 6,
                        border: "1px solid #eee",
                      }}
                      dangerouslySetInnerHTML={{ __html: s.jobDescription }}
                    />
                  </Detail>
                  <Detail label="About the company">{s.aboutCompany}</Detail>
                  <Detail label="Company website">
                    <a
                      href={s.companyWebsite}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#ff5a1f" }}
                    >
                      {s.companyWebsite}
                    </a>
                  </Detail>
                  {s.postingUrl && (
                    <Detail label="Posting URL">
                      <a
                        href={s.postingUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#ff5a1f" }}
                      >
                        {s.postingUrl}
                      </a>
                    </Detail>
                  )}
                  {(s.salaryMin || s.salaryMax) && (
                    <Detail label="Salary">
                      {s.salaryCurrency} {s.salaryMin ?? "—"}–{s.salaryMax ?? "—"}{" "}
                      {s.salaryPeriod ? `/ ${s.salaryPeriod}` : ""}
                    </Detail>
                  )}
                  {(s.wantsEmailBlast ||
                    s.wants4WeekSpotlight ||
                    s.wants1WeekSpotlight) && (
                    <Detail label="Promotions requested">
                      {[
                        s.wantsEmailBlast && "Email blast (free)",
                        s.wants4WeekSpotlight && "4-week spotlight ($175)",
                        s.wants1WeekSpotlight && "1-week spotlight ($75)",
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </Detail>
                  )}
                  {s.comments && (
                    <Detail label="Comments">{s.comments}</Detail>
                  )}
                  {s.reviewedAt && (
                    <Detail label="Reviewed">{formatDate(s.reviewedAt)}</Detail>
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
    <span
      style={{
        padding: "3px 10px",
        borderRadius: 999,
        background: c.bg,
        color: c.fg,
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 0.5,
      }}
    >
      {status}
    </span>
  );
}

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          color: "#888",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          fontWeight: 600,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ color: "#222", whiteSpace: "pre-wrap" }}>{children}</div>
    </div>
  );
}

const btnSmall: React.CSSProperties = {
  padding: "8px 12px",
  background: "#fff",
  color: "#333",
  border: "1px solid #ddd",
  borderRadius: 6,
  fontSize: 12,
  cursor: "pointer",
  fontFamily: "inherit",
  fontWeight: 600,
};

const btnApprove: React.CSSProperties = {
  ...btnSmall,
  background: "#1f7a3a",
  color: "#fff",
  borderColor: "#1f7a3a",
};

const btnReject: React.CSSProperties = {
  ...btnSmall,
  background: "#fff",
  color: "#b11a1a",
  borderColor: "#e8b6b6",
};
