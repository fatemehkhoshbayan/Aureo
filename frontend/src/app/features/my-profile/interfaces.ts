export interface ProfileDraft {
  name: string;
  email: string;
  phone: string;
  location: string;
  avatar: string | null;
}

export interface ProfileSavePayload {
  draft: ProfileDraft;
  avatarFile: File | null;
}
