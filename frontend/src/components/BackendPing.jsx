import { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../Contexts/AuthContext";

export default function BackendPing() {
  const { user } = useAuth();
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!user) return;
    client.get("/hello")
      .then((r) => setMsg(r.data.msg))
      .catch(console.error);
  }, [user]);

  return <p className="mt-6 text-xl">{msg || "Sign in to ping backend…"}</p>;
}
