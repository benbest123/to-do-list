import SpotifyLoginButton from "../components/spotify/SpotifyLoginButton";
import SpotifyUserProfile from "../components/spotify/SpotifyUserProfile";
import Taskbar from "../components/shared/Taskbar";
import { useSpotify } from "../hooks/useSpotify";

function SpotifyAuth() {
  const { token, userData, loading, login, logout } = useSpotify();

  return (
    <div className='flex flex-col h-screen'>
      <main className='flex-1 overflow-y-auto bg-[#008080] p-6'>
        <div className='max-w-3xl mx-auto bg-[#C0C0C0] shadow-w95Container p-1 space-y-1'>
          {/* Title bar */}
          <div className='bg-[#000080] text-white px-2 py-1 flex items-center gap-2'>
            <span>Spotify Stats</span>
          </div>
          {/* Content */}
          <div className='p-2'>
            {loading ? (
              <p className='p-4 text-sm'>Loading...</p>
            ) : !token ? (
              <SpotifyLoginButton onLogin={login} />
            ) : (
              <SpotifyUserProfile userData={userData} accessToken={token.access_token} onLogout={logout} />
            )}
          </div>
        </div>
      </main>
      <Taskbar />
    </div>
  );
}

export default SpotifyAuth;
