import { Language } from '../types';

// Currently focused on German, but structure allows easy expansion
export const languages: Language[] = [
  { code: 'de', name: 'German', flag: '🇩🇪' },
  // Future languages can be added here:
  // { code: 'fr', name: 'French', flag: '🇫🇷' },
  // { code: 'it', name: 'Italian', flag: '🇮🇹' },
  // { code: 'es', name: 'Spanish', flag: '🇪🇸' },
];

// Default to German for now
export const defaultLanguage = languages[0];