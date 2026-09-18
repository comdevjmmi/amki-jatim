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

export interface Candidate {
  id: string;
  nama: string;
  asal_kampus: string | null;
  nomor_urut: number | null;
  foto_url: string | null;
  visi_misi: string | null;
  updated_at: string;
}
