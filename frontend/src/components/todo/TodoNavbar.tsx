import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function TodoNavbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header>
      <nav className="h-10 bg-black">
        <div className="flex items-center h-full justify-end px-4">
          <button type="button" className="text-white hover:underline" onClick={handleLogout}>
            logout
          </button>
        </div>
      </nav>
    </header>
  );
}
