"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type User = { id: number; name: string; email: string };

const headers = { Accept: "application/json" };

async function fail(res: Response): Promise<never> {
  const text = await res.text().catch(() => "");
  throw new Error(text || `Request failed (${res.status})`);
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [lookupId, setLookupId] = useState("");
  const [found, setFound] = useState<User | null>(null);

  const [form, setForm] = useState({ id: "", name: "", email: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/users", { headers, cache: "no-store" });
      if (!res.ok) await fail(res);
      setUsers(await res.json());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onLookup(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setFound(null);
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(lookupId)}`, { headers });
      if (!res.ok) await fail(res);
      setFound(await res.json());
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(form.id), name: form.name, email: form.email }),
      });
      if (!res.ok) await fail(res);
      setMessage("User saved.");
      setForm({ id: "", name: "", email: "" });
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <main>
      <h1>User Service</h1>
      {error && <p className="error">{error}</p>}
      {message && <p className="ok">{message}</p>}

      <section>
        <h2>Add user</h2>
        <form onSubmit={onCreate}>
          <input type="number" placeholder="ID" required value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })} />
          <input placeholder="Name" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input type="email" placeholder="Email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <button type="submit">Save</button>
        </form>
      </section>

      <section>
        <h2>Find by ID</h2>
        <form onSubmit={onLookup}>
          <input type="number" placeholder="ID" required value={lookupId}
            onChange={(e) => setLookupId(e.target.value)} />
          <button type="submit">Find</button>
        </form>
        {found && (
          <p>#{found.id} — {found.name} ({found.email})</p>
        )}
      </section>

      <section>
        <h2>All users <button onClick={load} disabled={loading}>Refresh</button></h2>
        <table>
          <thead>
            <tr><th>ID</th><th>Name</th><th>Email</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}><td>{u.id}</td><td>{u.name}</td><td>{u.email}</td></tr>
            ))}
            {!users.length && <tr><td colSpan={3}>{loading ? "Loading…" : "No users"}</td></tr>}
          </tbody>
        </table>
      </section>
    </main>
  );
}
