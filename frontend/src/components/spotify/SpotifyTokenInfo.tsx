import { TokenData } from "../../pages/SpotifyAuth";

interface SpotifyTokenInfoProps {
  token: TokenData;
  onRefresh: () => void;
  onLogout: () => void;
}

function SpotifyTokenInfo({ token, onRefresh, onLogout }: SpotifyTokenInfoProps) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-3">Token Info</h3>
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="mb-2 text-sm">
          <strong className="font-semibold">Access Token:</strong> <code className="bg-gray-200 px-2 py-1 rounded text-xs">{token.access_token.substring(0, 20)}...</code>
        </p>
        <p className="mb-2 text-sm">
          <strong className="font-semibold">Expires in:</strong> {token.expires_in} seconds
        </p>
        {token.expires_at && (
          <p className="text-sm">
            <strong className="font-semibold">Expires at:</strong> {new Date(token.expires_at).toLocaleString()}
          </p>
        )}
      </div>

      <div className="mt-5 flex gap-3">
        <button onClick={onRefresh} className="px-5 py-2.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
          Refresh Token
        </button>
        <button onClick={onLogout} className="px-5 py-2.5 bg-red-500 text-white rounded hover:bg-red-600 transition">
          Logout
        </button>
      </div>
    </div>
  );
}

export default SpotifyTokenInfo;
