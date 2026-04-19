import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Taskbar() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/auth");
  }

  return (
    <div className='h-10 bg-[#C0C0C0] shadow-w95Container flex items-center justify-between px-2 gap-2'>
      <div className='flex items-center gap-2'>
        <button
          onClick={() => navigate("/desktop")}
          className='h-7 px-3 bg-[#C0C0C0] text-black text-sm shadow-w95Button flex items-center gap-1'
        >
          Home
        </button>
        <button
          onClick={handleLogout}
          className='h-7 px-3 bg-[#C0C0C0] text-black text-sm shadow-w95Button flex items-center gap-1'
        >
          Log Out
        </button>
      </div>
      <div className='text-sm px-2 shadow-w95InnerContainer h-7 flex items-center'>{username}</div>
    </div>
  );
}
