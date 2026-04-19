import { useNavigate } from "react-router-dom";
import Taskbar from "../components/shared/Taskbar";

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
  const navigate = useNavigate();

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

      <Taskbar />
    </div>
  );
}
