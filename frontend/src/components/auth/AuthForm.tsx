import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { API_URL } from "../../utils/constants";

export default function AuthForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

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
        login(authResponse.user.username, authResponse.token);
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
    <form className="flex flex-col gap-2 bg-[#C0C0C0]" onSubmit={handleSubmit}>
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="grow border bg-white border-gray-400 shadow-w95Input p-2" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="grow border bg-white border-gray-400 shadow-w95Input p-2" />
      <button type="submit" className="w-35 h-10 font-w95 bg-[#C0C0C0] text-black shadow-w95Button">
        Register or Login
      </button>
    </form>
  );
}
