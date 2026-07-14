import type { RoleKey } from "@/lib/permissions/roles";

export type ProfileStatus = "active" | "suspended" | "deleted";

export type Profile = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  email: string | null;
  phone: string | null;
  countryCode: string | null;
  city: string | null;
  avatarUrl: string | null;
  status: ProfileStatus;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Role = {
  id: string;
  key: RoleKey;
  name: string;
  description: string | null;
};

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
  };
};
