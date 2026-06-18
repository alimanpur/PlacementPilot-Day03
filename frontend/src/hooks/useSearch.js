import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

export function useSearch() {
  const [query, setQuery]   = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const [apps, dsa, interview] = await Promise.all([
        api.get(`/applications?search=${encodeURIComponent(q)}`),
        api.get("/dsa"),
        api.get("/interview"),
      ]);
      const appResults = apps.data
        .filter((a) => a.company.toLowerCase().includes(q.toLowerCase()) || a.role.toLowerCase().includes(q.toLowerCase()))
        .slice(0, 4)
        .map((a) => ({ type: "application", label: `${a.company} — ${a.role}`, sub: a.status, id: a.id, to: "/applications" }));
      const dsaResults = dsa.data
        .filter((p) => p.title.toLowerCase().includes(q.toLowerCase()))
        .slice(0, 4)
        .map((p) => ({ type: "dsa", label: p.title, sub: `${p.topic} · ${p.difficulty}`, id: p.id, to: "/dsa" }));
      const iqResults = interview.data
        .filter((i) => i.question.toLowerCase().includes(q.toLowerCase()))
        .slice(0, 3)
        .map((i) => ({ type: "interview", label: i.question, sub: i.category, id: i.id, to: "/interview" }));
      setResults([...appResults, ...dsaResults, ...iqResults]);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  return { query, setQuery, results, loading };
}
