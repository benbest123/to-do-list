import { useEffect, useState } from "react";
import { TopArtist, TopTrack, UserData } from "../../types/spotify";
import { API_URL } from "../../utils/constants";

type TimeRange = "short_term" | "medium_term" | "long_term";

interface TabData {
  artists: TopArtist[];
  tracks: TopTrack[];
}

interface SpotifyUserProfileProps {
  userData: UserData | null;
  accessToken: string | null;
  onLogout: () => void;
}

const TABS: { label: string; value: TimeRange }[] = [
  { label: "4 Weeks", value: "short_term" },
  { label: "6 Months", value: "medium_term" },
  { label: "1 Year", value: "long_term" },
];

function SpotifyUserProfile({ userData, accessToken, onLogout }: SpotifyUserProfileProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("short_term");
  const [cache, setCache] = useState<Partial<Record<TimeRange, TabData>>>({});
  const [tabLoading, setTabLoading] = useState(false);

  useEffect(() => {
    if (!accessToken || cache[timeRange]) return;

    const fetchItems = async () => {
      setTabLoading(true);
      const headers = { Authorization: `Bearer ${accessToken}` };
      try {
        const [artistsRes, tracksRes] = await Promise.all([
          fetch(`${API_URL}/spotify/top/artists?limit=10&time_range=${timeRange}`, { headers }),
          fetch(`${API_URL}/spotify/top/tracks?limit=10&time_range=${timeRange}`, { headers }),
        ]);
        const artists = artistsRes.ok ? ((await artistsRes.json()).items ?? []) : [];
        const tracks = tracksRes.ok ? ((await tracksRes.json()).items ?? []) : [];
        setCache(prev => ({ ...prev, [timeRange]: { artists, tracks } }));
      } catch (error) {
        console.error("Error fetching top items:", error);
      } finally {
        setTabLoading(false);
      }
    };

    fetchItems();
  }, [accessToken, timeRange, cache]);

  const current = cache[timeRange];

  return (
    <div>
      {/* User header */}
      <div className='flex items-center justify-between mb-2 px-1'>
        <div className='flex items-center gap-2'>
          {userData?.images?.[0] && <img src={userData.images[0].url} alt='Profile' className='w-8 h-8 object-cover' />}
          <span className='text-sm'>{userData?.display_name || "User"}</span>
        </div>
        <button onClick={onLogout} className='px-3 py-0.5 text-sm bg-[#C0C0C0] shadow-w95Button'>
          Disconnect
        </button>
      </div>

      {/* Tabs */}
      <div className='flex gap-1 mb-2'>
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setTimeRange(tab.value)}
            className={`px-4 py-1 text-sm bg-[#C0C0C0] ${
              timeRange === tab.value ? "shadow-w95InnerContainer" : "shadow-w95Button"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content panel */}
      <div className='shadow-w95InnerContainer p-3'>
        {tabLoading ? (
          <p className='text-sm p-2'>Loading...</p>
        ) : (
          <div className='grid grid-cols-2 gap-4'>
            {/* Top Artists */}
            <div>
              <p className='text-sm mb-2 px-1'>Top Artists</p>
              <ol className='space-y-1'>
                {(current?.artists ?? []).map((artist, i) => (
                  <li key={artist.id} className='flex items-center gap-2 p-1.5 shadow-w95InnerContainer bg-[#C0C0C0]'>
                    <span className='text-xs text-gray-600 w-4 text-right shrink-0'>{i + 1}</span>
                    {artist.images[0] && (
                      <img src={artist.images[0].url} alt={artist.name} className='w-8 h-8 shrink-0 object-cover' />
                    )}
                    <div className='min-w-0'>
                      <a
                        href={artist.external_urls.spotify}
                        target='_blank'
                        rel='noreferrer'
                        className='text-xs hover:underline truncate block'
                      >
                        {artist.name}
                      </a>
                      {artist.genres.length > 0 && (
                        <p className='text-xs text-gray-600 truncate'>{artist.genres.slice(0, 2).join(", ")}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Top Tracks */}
            <div>
              <p className='text-sm mb-2 px-1'>Top Tracks</p>
              <ol className='space-y-1'>
                {(current?.tracks ?? []).map((track, i) => (
                  <li key={track.id} className='flex items-center gap-2 p-1.5 shadow-w95InnerContainer bg-[#C0C0C0]'>
                    <span className='text-xs text-gray-600 w-4 text-right shrink-0'>{i + 1}</span>
                    {track.album.images[0] && (
                      <img
                        src={track.album.images[0].url}
                        alt={track.album.name}
                        className='w-8 h-8 shrink-0 object-cover'
                      />
                    )}
                    <div className='min-w-0'>
                      <a
                        href={track.external_urls.spotify}
                        target='_blank'
                        rel='noreferrer'
                        className='text-xs hover:underline truncate block'
                      >
                        {track.name}
                      </a>
                      <p className='text-xs text-gray-600 truncate'>{track.artists.map(a => a.name).join(", ")}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SpotifyUserProfile;
