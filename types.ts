export interface SlideData {
  id: number;
  title: string;
  subtitle?: string;
  content: string[]; // Bullet points
  imageUrl?: string;
  speechText: string; // Text for AI to read
  themeColor: string;
}

export interface AudioContextState {
  context: AudioContext | null;
  gainNode: GainNode | null;
}

export enum SpeakingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SPEAKING = 'SPEAKING',
}