import { tileClass } from "../game/evaluateGuess";
import type { Guess } from "../types";

type GuessGridProps = {
  currentGuess: string;
  guesses: Guess[];
  isOver: boolean;
};

export function GuessGrid({ currentGuess, guesses, isOver }: GuessGridProps) {
  return (
    <div className="guesses">
      {guesses.map((guess, guessIndex) => (
        <div key={guessIndex}>
          {guess.map(({ letter, status }, letterIndex) => (
            <span key={letterIndex} className={tileClass(status)}>
              {letter}
            </span>
          ))}
        </div>
      ))}
      {currentGuess.split("").map((letter, index) => (
        <span key={index} className="tile blank">
          {letter}
        </span>
      ))}
      {!isOver &&
        Array(5 - currentGuess.length)
          .fill(null)
          .map((_, index) => (
            <span key={index} className="tile blank">
              &nbsp;
            </span>
          ))}
    </div>
  );
}
