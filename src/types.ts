export interface QuizResult {
  archetype: string;
  title: string;
  description: string;
  quote: string;
  costume: string;
  color: string;
  icon: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  image: string;
  options: {
    text: string;
    archetype: string;
  }[];
}

export interface Character {
  id: string;
  result: QuizResult;
  name: string;
  outfit: string[];
  props: string[];
  createdAt: Date;
}

export interface Script {
  title: string;
  genre: 'tragedy' | 'comedy' | 'romance' | 'absurdism';
  content: string;
  character: string;
}

export interface SaveData {
  characters: Character[];
  currentCharacter?: Character;
  hasSeenIntro: boolean;
  seatNumber?: number;
  wiggleActivated: boolean;
  sessionStartTime: number;
}