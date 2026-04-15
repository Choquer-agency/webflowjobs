"use client";

import { useState } from "react";
import { logout } from "./actions";
import { LeadsView, type Applicant } from "./LeadsView";
import { SubmissionsView, type Submission } from "./SubmissionsView";

export function AdminDashboard({
  applicants,
  submissions,
}: {
  applicants: Applicant[];
  submissions: Submission[];
}) {
  const pendingCount = submissions.filter((s) => s.status === "pending").length;
  const [tab, setTab] = useState<"leads" | "submissions">(
    pendingCount > 0 ? "submissions" : "leads",
  );

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "140px 24px 60px",
        fontFamily: "Roboto Mono, monospace",
        color: "#111",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 24 }}>Admin</h1>
        <form action={logout}>
          <button
            type="submit"
            style={{
              padding: "8px 14px",
              background: "#fff",
              color: "#111",
              border: "1px solid #ddd",
              borderRadius: 6,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Sign out
          </button>
        </form>
      </div>

      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 24,
          borderBottom: "1px solid #eee",
        }}
      >
        <TabButton
          active={tab === "leads"}
          onClick={() => setTab("leads")}
          label="Leads"
          count={applicants.length}
        />
        <TabButton
          active={tab === "submissions"}
          onClick={() => setTab("submissions")}
          label="Job Submissions"
          count={submissions.length}
          badge={pendingCount > 0 ? pendingCount : undefined}
        />
      </div>

      {tab === "leads" ? (
        <LeadsView applicants={applicants} />
      ) : (
        <SubmissionsView submissions={submissions} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  count,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 16px",
        background: "transparent",
        color: active ? "#ff5a1f" : "#666",
        border: "none",
        borderBottom: active ? "2px solid #ff5a1f" : "2px solid transparent",
        marginBottom: -1,
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {label}
      <span style={{ color: "#999", fontSize: 12 }}>({count})</span>
      {badge !== undefined && (
        <span
          style={{
            background: "#ff5a1f",
            color: "#fff",
            borderRadius: 999,
            padding: "2px 8px",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
