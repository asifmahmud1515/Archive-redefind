export interface ArchiveItem {
  identifier: string;
  title: string;
  description?: string;
  mediatype: string;
  date?: string;
  creator?: string | string[];
  downloads?: number;
  subject?: string[];
  collection?: string[];
}

export type ViewType = 'dossier' | 'explore' | 'vault' | 'profile' | 'detail';

export interface AppState {
  currentView: ViewType;
  selectedItem: ArchiveItem | null;
  vault: ArchiveItem[];
  isHandshakeComplete: boolean;
  isBiometricVerified: boolean;
}
