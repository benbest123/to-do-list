import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface DesktopIcon {
  label: string;
  icon: string;
  path: string;
}

const icons: DesktopIcon[] = [
  { label: "To-Do List", icon: "📋", path: "/todos" },
  { label: "Spotify", icon: "🎵", path: "/spotify" },
];

export default function Desktop() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/auth");
  }

  return (
    <div className='flex flex-col h-screen bg-[#008080]'>
      {/* Desktop area */}
      <div className='flex-1 p-4 flex flex-wrap content-start gap-6'>
        {icons.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className='flex flex-col items-center gap-1 w-20 p-2 text-white cursor-pointer hover:bg-white/20 focus:bg-white/30 focus:outline-none'
          >
            <span className='text-4xl'>{item.icon}</span>
            <span className='text-xs text-center leading-tight'>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Taskbar */}
      <div className='h-10 bg-[#C0C0C0] shadow-w95Container flex items-center justify-between px-2 gap-2'>
        <div className='flex items-center gap-2'>
          <button
            onClick={handleLogout}
            className='h-7 px-3 bg-[#C0C0C0] text-black text-sm shadow-w95Button flex items-center gap-1'
          >
            <span>⊘</span> Log Out
          </button>
        </div>
        <div className='text-sm px-2 shadow-w95InnerContainer h-7 flex items-center'>{username}</div>
      </div>
    </div>
  );
}
