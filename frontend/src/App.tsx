import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Auth from "./pages/Auth";
import SpotifyAuth from "./pages/SpotifyAuth";
import Todo from "./pages/Todo";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/todos" element={<Todo />} />
          <Route path="/spotify" element={<SpotifyAuth />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
