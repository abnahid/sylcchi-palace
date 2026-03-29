export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  image?: string | null;
  bio?: string;
  location?: string;
  website?: string;
  nationality?: string;
  emailVerified: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  image?: string;
  bio?: string;
  location?: string;
  website?: string;
  nationality?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export type UserResponse = ApiResponse<UserProfile>;
export type UpdateProfileResponse = ApiResponse<UserProfile>;
