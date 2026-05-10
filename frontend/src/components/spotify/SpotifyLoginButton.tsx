interface SpotifyLoginButtonProps {
  onLogin: () => void;
}

function SpotifyLoginButton({ onLogin }: SpotifyLoginButtonProps) {
  return (
    <div className='p-4'>
      <p className='mb-4 text-sm'>You are not connected to Spotify.</p>
      <button onClick={onLogin} className='px-4 py-1 bg-[#C0C0C0] text-black text-sm shadow-w95Button'>
        Login with Spotify
      </button>
    </div>
  );
}

export default SpotifyLoginButton;
