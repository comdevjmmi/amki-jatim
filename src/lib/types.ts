export type RegistrationType = "invited" | "representative";
export type ParticipantKategori = "peserta_penuh" | "peninjau";
export type ParticipantStatus = "pending" | "approved" | "rejected";

export interface VotingSettings {
  isVotingVisible: boolean;
  isVotingOpen: boolean;
  revealLiveCount: boolean;
}

export interface InvitedGuestOption {
  id: string;
  fullName: string;
  campusName: string;
  title: string;
}
