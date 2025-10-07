interface SpotifyLoginButtonProps {
  onLogin: () => void;
}

function SpotifyLoginButton({ onLogin }: SpotifyLoginButtonProps) {
  return (
    <div>
      <p className="mb-4 text-gray-700">You are not logged in.</p>
      <button onClick={onLogin} className="px-5 py-2.5 text-base bg-green-500 text-white rounded hover:bg-green-600 transition">
        Login with Spotify
      </button>
    </div>
  );
}

export default SpotifyLoginButton;
