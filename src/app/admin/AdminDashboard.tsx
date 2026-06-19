"use client";

import { useState } from "react";
import { logout } from "./actions";
import { LeadsView, type Applicant } from "./LeadsView";
import { SubmissionsView, type Submission } from "./SubmissionsView";
import { DesignersView, type DesignerRow } from "./DesignersView";
import { MetricsView, type JobRow } from "./MetricsView";

type Tab = "dashboard" | "leads" | "submissions" | "designers";

export function AdminDashboard({
  applicants,
  submissions,
  jobs,
  designers,
}: {
  applicants: Applicant[];
  submissions: Submission[];
  jobs: JobRow[];
  designers: DesignerRow[];
}) {
  const pendingJobs = submissions.filter((s) => s.status === "pending").length;
  const pendingDesigners = designers.filter((d) => d.status === "pending").length;
  const [tab, setTab] = useState<Tab>("dashboard");

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
          active={tab === "dashboard"}
          onClick={() => setTab("dashboard")}
          label="Dashboard"
        />
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
          badge={pendingJobs > 0 ? pendingJobs : undefined}
        />
        <TabButton
          active={tab === "designers"}
          onClick={() => setTab("designers")}
          label="Designers"
          count={designers.length}
          badge={pendingDesigners > 0 ? pendingDesigners : undefined}
        />
      </div>

      {tab === "dashboard" && (
        <MetricsView
          jobs={jobs}
          applicants={applicants}
          designers={designers}
          submissions={submissions}
        />
      )}
      {tab === "leads" && <LeadsView applicants={applicants} />}
      {tab === "submissions" && <SubmissionsView submissions={submissions} />}
      {tab === "designers" && <DesignersView designers={designers} />}
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
  count?: number;
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
      {count !== undefined && <span style={{ color: "#999", fontSize: 12 }}>({count})</span>}
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
