import type { Guess } from "../types";

function countLetters(letters: string[]) {
  return letters.reduce<Record<string, number>>((counts, letter) => {
    counts[letter] = (counts[letter] || 0) + 1;
    return counts;
  }, {});
}

export function validateHardMode(nextGuess: Guess, previousGuesses: Guess[], solution: string) {
  const wrongExactIndex = nextGuess.findIndex((item, index) => {
    return item.status !== 1 && previousGuesses.some((guess) => guess[index].letter === item.letter);
  });

  if (wrongExactIndex > -1) {
    return `Position ${wrongExactIndex + 1} can't be ${nextGuess[wrongExactIndex].letter} in hard mode`;
  }

  const extraIncluded = nextGuess
    .filter((item) => item.status === null && solution.includes(item.letter))
    .map((item) => item.letter);

  if (extraIncluded.length > 0) {
    const repeatedExtra = extraIncluded.find((letter) =>
      previousGuesses.some((guess) =>
        guess.some((item) => item.status === null && item.letter === letter)
      )
    );
    if (repeatedExtra) return `Extra ${repeatedExtra} is not allowed in hard mode`;
  }

  const solutionCounts = countLetters(solution.split(""));
  const repeatedLetters = Object.keys(solutionCounts).filter((letter) => solutionCounts[letter] > 1);

  if (repeatedLetters.length > 0) {
    const requiredCounts = repeatedLetters.reduce<Record<string, number>>((counts, letter) => {
      counts[letter] = Math.max(
        ...previousGuesses.map(
          (guess) => guess.filter((item) => item.letter === letter && item.status != null).length
        )
      );
      return counts;
    }, {});

    const nextCounts = countLetters(nextGuess.map((item) => item.letter));
    const missingLetter = Object.keys(requiredCounts).find(
      (letter) => nextCounts[letter] < requiredCounts[letter]
    );

    if (missingLetter) {
      return `Needs at least ${requiredCounts[missingLetter]} ${missingLetter}'s in hard mode`;
    }
  }

  return null;
}
