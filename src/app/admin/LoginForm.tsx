import { login } from "./actions";

export function LoginForm({ error }: { error?: boolean }) {
  return (
    <div style={{ paddingTop: 140, paddingBottom: 80, minHeight: "70vh" }}>
    <div
      style={{
        maxWidth: 400,
        margin: "0 auto",
        padding: 32,
        border: "1px solid #222",
        borderRadius: 8,
        fontFamily: "Roboto Mono, monospace",
        background: "#fff",
      }}
    >
      <h1 style={{ marginTop: 0, fontSize: 22 }}>Admin Dashboard</h1>
      <p style={{ color: "#888", fontSize: 14 }}>
        Enter the owner password to continue.
      </p>
      <form action={login}>
        <input
          type="password"
          name="password"
          placeholder="Password"
          autoFocus
          required
          style={{
            width: "100%",
            padding: "12px 14px",
            border: "1px solid #333",
            borderRadius: 6,
            fontSize: 15,
            marginBottom: 12,
            boxSizing: "border-box",
            fontFamily: "inherit",
          }}
        />
        {error && (
          <div style={{ color: "#e11", fontSize: 13, marginBottom: 12 }}>
            Incorrect password.
          </div>
        )}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px 14px",
            background: "#ff5a1f",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Sign in
        </button>
      </form>
    </div>
    </div>
  );
}
