"use client";
import { useEffect, useState } from "react";

export default function TestSyncPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    fetch("/api/library/sync")
      .then((res) => res.json().then(json => ({ status: res.status, ok: res.ok, json })))
      .then((res) => setData(res))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div style={{ padding: 50, color: "white" }}>
      <h1>Sync API Test</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <pre style={{ background: "#111", padding: 20 }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
