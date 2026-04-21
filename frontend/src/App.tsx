import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Auth from "./pages/Auth";
import Desktop from "./pages/Desktop";
import SpotifyAuth from "./pages/SpotifyAuth";
import Todo from "./pages/Todo";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Auth />} />
          <Route path='/auth' element={<Auth />} />
          <Route
            path='/desktop'
            element={
              <ProtectedRoute>
                <Desktop />
              </ProtectedRoute>
            }
          />
          <Route
            path='/todos'
            element={
              <ProtectedRoute>
                <Todo />
              </ProtectedRoute>
            }
          />
          <Route
            path='/spotify'
            element={
              <ProtectedRoute>
                <SpotifyAuth />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
