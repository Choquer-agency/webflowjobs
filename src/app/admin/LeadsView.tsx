"use client";

import { useMemo, useState } from "react";

export type Applicant = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobSlug: string;
  jobTitle: string;
  companyName: string;
  submittedAt: string;
};

type Lead = {
  email: string;
  name: string;
  firstSeen: string;
  lastSeen: string;
  applications: Applicant[];
};

function groupByEmail(rows: Applicant[]): Lead[] {
  const map = new Map<string, Lead>();
  for (const r of rows) {
    const key = r.email.toLowerCase();
    const name = `${r.firstName} ${r.lastName}`.trim();
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        email: key,
        name,
        firstSeen: r.submittedAt,
        lastSeen: r.submittedAt,
        applications: [r],
      });
    } else {
      existing.applications.push(r);
      if (r.submittedAt < existing.firstSeen) existing.firstSeen = r.submittedAt;
      if (r.submittedAt > existing.lastSeen) existing.lastSeen = r.submittedAt;
      if (!existing.name && name) existing.name = name;
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    a.lastSeen < b.lastSeen ? 1 : -1,
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function LeadsView({ applicants }: { applicants: Applicant[] }) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [onlyRepeat, setOnlyRepeat] = useState(false);

  const leads = useMemo(() => groupByEmail(applicants), [applicants]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (onlyRepeat && l.applications.length < 2) return false;
      if (!q) return true;
      if (l.email.includes(q) || l.name.toLowerCase().includes(q)) return true;
      return l.applications.some(
        (a) =>
          a.jobTitle.toLowerCase().includes(q) ||
          a.companyName.toLowerCase().includes(q),
      );
    });
  }, [leads, query, onlyRepeat]);

  const repeatCount = leads.filter((l) => l.applications.length >= 2).length;

  function toggle(email: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  }

  function expandAll() {
    setExpanded(new Set(filtered.map((l) => l.email)));
  }
  function collapseAll() {
    setExpanded(new Set());
  }

  function exportCsv() {
    const header = [
      "email",
      "firstName",
      "lastName",
      "jobTitle",
      "companyName",
      "jobSlug",
      "submittedAt",
    ];
    const rows = applicants.map((a) =>
      [
        a.email,
        a.firstName,
        a.lastName,
        a.jobTitle,
        a.companyName,
        a.jobSlug,
        a.submittedAt,
      ]
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `applicants-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <p style={{ margin: 0, color: "#666", fontSize: 13 }}>
          {leads.length} unique applicants · {applicants.length} total
          applications · {repeatCount} repeat applicants
        </p>
        <button onClick={exportCsv} style={btnSecondary}>
          Export CSV
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, job, or company..."
          style={{
            flex: 1,
            minWidth: 260,
            padding: "10px 14px",
            border: "1px solid #ddd",
            borderRadius: 6,
            fontSize: 14,
            fontFamily: "inherit",
          }}
        />
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <input
            type="checkbox"
            checked={onlyRepeat}
            onChange={(e) => setOnlyRepeat(e.target.checked)}
          />
          Repeat applicants only
        </label>
        <button onClick={expandAll} style={btnSmall}>
          Expand all
        </button>
        <button onClick={collapseAll} style={btnSmall}>
          Collapse all
        </button>
      </div>

      <div
        style={{
          border: "1px solid #eee",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "40px 1.5fr 2fr 80px 1.5fr 1.5fr",
            padding: "12px 16px",
            background: "#fafafa",
            borderBottom: "1px solid #eee",
            fontSize: 12,
            fontWeight: 600,
            color: "#666",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          <div></div>
          <div>Name</div>
          <div>Email</div>
          <div style={{ textAlign: "center" }}>Apps</div>
          <div>Last Applied</div>
          <div>Last Job</div>
        </div>

        {filtered.length === 0 && (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "#999",
              fontSize: 14,
            }}
          >
            No leads match your filters.
          </div>
        )}

        {filtered.map((lead) => {
          const isOpen = expanded.has(lead.email);
          const sorted = [...lead.applications].sort((a, b) =>
            a.submittedAt < b.submittedAt ? 1 : -1,
          );
          const last = sorted[0];
          const isRepeat = lead.applications.length >= 2;
          return (
            <div key={lead.email} style={{ borderBottom: "1px solid #eee" }}>
              <button
                onClick={() => toggle(lead.email)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "40px 1.5fr 2fr 80px 1.5fr 1.5fr",
                  padding: "14px 16px",
                  width: "100%",
                  background: isOpen ? "#fff8f3" : "#fff",
                  border: "none",
                  borderBottom: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: 14,
                  fontFamily: "inherit",
                  alignItems: "center",
                }}
              >
                <div style={{ color: "#999", fontSize: 12 }}>
                  {isOpen ? "▾" : "▸"}
                </div>
                <div style={{ fontWeight: 600 }}>
                  {lead.name || <span style={{ color: "#999" }}>—</span>}
                </div>
                <div style={{ color: "#555", wordBreak: "break-all" }}>
                  {lead.email}
                </div>
                <div style={{ textAlign: "center" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "3px 10px",
                      borderRadius: 999,
                      background: isRepeat ? "#ff5a1f" : "#eee",
                      color: isRepeat ? "#fff" : "#666",
                      fontSize: 12,
                      fontWeight: 600,
                      minWidth: 24,
                    }}
                  >
                    {lead.applications.length}
                  </span>
                </div>
                <div style={{ color: "#666", fontSize: 13 }}>
                  {formatDate(last.submittedAt)}
                </div>
                <div
                  style={{
                    color: "#666",
                    fontSize: 13,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {last.jobTitle} <span style={{ color: "#aaa" }}>·</span>{" "}
                  {last.companyName}
                </div>
              </button>

              {isOpen && (
                <div
                  style={{
                    padding: "0 16px 16px 56px",
                    background: "#fff8f3",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 13,
                    }}
                  >
                    <thead>
                      <tr style={{ color: "#888", textAlign: "left" }}>
                        <th style={th}>#</th>
                        <th style={th}>Job Title</th>
                        <th style={th}>Company</th>
                        <th style={th}>Submitted</th>
                        <th style={th}>Slug</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((a, i) => (
                        <tr
                          key={a._id}
                          style={{ borderTop: "1px solid #f0e6df" }}
                        >
                          <td style={td}>{sorted.length - i}</td>
                          <td style={{ ...td, fontWeight: 500 }}>
                            {a.jobTitle}
                          </td>
                          <td style={td}>{a.companyName}</td>
                          <td style={{ ...td, color: "#666" }}>
                            {formatDate(a.submittedAt)}
                          </td>
                          <td style={{ ...td, color: "#999" }}>
                            <a
                              href={`/jobs/${a.jobSlug}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: "#ff5a1f", textDecoration: "none" }}
                            >
                              /{a.jobSlug}
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const btnSecondary: React.CSSProperties = {
  padding: "8px 14px",
  background: "#fff",
  color: "#111",
  border: "1px solid #ddd",
  borderRadius: 6,
  fontSize: 13,
  cursor: "pointer",
  fontFamily: "inherit",
};

const btnSmall: React.CSSProperties = {
  padding: "6px 10px",
  background: "#fff",
  color: "#555",
  border: "1px solid #ddd",
  borderRadius: 6,
  fontSize: 12,
  cursor: "pointer",
  fontFamily: "inherit",
};

const th: React.CSSProperties = {
  padding: "8px 8px",
  fontWeight: 600,
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: 0.4,
};

const td: React.CSSProperties = {
  padding: "8px 8px",
  verticalAlign: "top",
};
