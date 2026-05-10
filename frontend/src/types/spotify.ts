export interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
}

export interface UserData {
  display_name: string;
  email: string;
  id: string;
  images?: { url: string }[];
}

export interface TopArtist {
  id: string;
  name: string;
  genres: string[];
  images: { url: string }[];
  external_urls: { spotify: string };
}

export interface TopTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  external_urls: { spotify: string };
}
