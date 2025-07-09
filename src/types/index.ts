export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface Situation {
  id: string;
  title: string;
  description: string;
}

export interface Character {
  name: string;
  role: string;
  avatar: string;
}

export interface DialogueLine {
  id: string;
  character: Character;
  text: string;
  translation: string;
  words: Word[];
}

export interface Word {
  text: string;
  translation: string;
  emoji: string;
}

export interface Story {
  id: string;
  title: string;
  language: Language;
  situation: Situation;
  dialogue: DialogueLine[];
  createdAt: Date;
  isSaved: boolean;
}</action>