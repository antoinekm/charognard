export interface InstagramUser {
  pk: string;
  username: string;
  full_name: string;
  profile_pic_url: string;
  is_verified: boolean;
  is_private: boolean;
}

export interface Suggestion {
  user: InstagramUser;
  social_context: string;
  caption: string;
}

export interface AymlResponse {
  more_available: boolean;
  max_id: string;
  suggested_users: {
    suggestions: Suggestion[];
  };
}

export interface FriendshipStatus {
  following: boolean;
  followed_by: boolean;
  blocking: boolean;
  muting: boolean;
  is_private: boolean;
  incoming_request: boolean;
  outgoing_request: boolean;
}
