export type LetterStatus = 1 | 2 | null;

export type GuessLetter = {
  letter: string;
  status: LetterStatus;
};

export type Guess = GuessLetter[];
