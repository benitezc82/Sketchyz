export enum AppState {
  WELCOME = 'WELCOME',
  CAMERA = 'CAMERA',
  LIVE_CAMERA = 'LIVE_CAMERA',
  CONTEXT_INPUT = 'CONTEXT_INPUT',
  ANALYZING = 'ANALYZING',
  STYLE_SELECT = 'STYLE_SELECT',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
  GALLERY = 'GALLERY',
  ERROR = 'ERROR'
}

export interface StyleOption {
  id: string;
  name: string;
  icon: string; // Emoji or simple representation
  color: string;
  description: string;
}

export interface BrainResponse {
  style_prompt?: string;
  kid_message?: string;
  loading_message?: string;
}

export interface GeneratedResult {
  originalImage: string;
  styledImage: string;
  styleId: string;
  message: string;
}

export interface GalleryItem {
  id: string;
  timestamp: number;
  originalImage: string;
  styledImage: string;
  styleId: string;
  message: string;
}

export type BrainMode = "style_description" | "kid_message";
export type BrainContext = "after_generation" | "loading" | "stats" | "encourage_new";

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}