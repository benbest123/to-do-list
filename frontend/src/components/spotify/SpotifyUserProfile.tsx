import { UserData } from "../../pages/SpotifyAuth";

interface SpotifyUserProfileProps {
  userData: UserData | null;
}

function SpotifyUserProfile({ userData }: SpotifyUserProfileProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Welcome, {userData?.display_name || "User"}!</h2>

      {userData && (
        <div className="mt-5 p-4 bg-gray-50 rounded-lg">
          <p className="mb-2">
            <strong className="font-semibold">Email:</strong> {userData.email}
          </p>
          <p className="mb-2">
            <strong className="font-semibold">User ID:</strong> {userData.id}
          </p>
          {userData.images && userData.images[0] && <img src={userData.images[0].url} alt="Profile" className="w-24 h-24 rounded-full mt-3" />}
        </div>
      )}
    </div>
  );
}

export default SpotifyUserProfile;
