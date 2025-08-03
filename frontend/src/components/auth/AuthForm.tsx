import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../utils/constants";

export default function AuthForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!username.trim() || !password.trim()) return;

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username, password: password }),
      });

      const authResponse = await response.json();

      if (response.ok) {
        // Success! User is either logged in or registered
        localStorage.setItem("token", authResponse.token);
        console.log(authResponse.message);
        navigate("/todos");
      } else {
        console.error(authResponse.error);
      }

      setUsername("");
      setPassword("");
    } catch (err) {
      console.error("error authenticating user:", err);
    }
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="rounded-md grow border bg-white border-gray-400 p-2" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="rounded-md grow border bg-white border-gray-400 p-2" />
      <button type="submit" className="w-40 h-10 rounded-md bg-slate-900 text-white hover:bg-slate-800">
        Register or Login
      </button>
    </form>
  );
}
