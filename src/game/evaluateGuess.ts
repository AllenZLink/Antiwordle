import type { Guess } from "../types";

export function evaluateGuess(guess: string, solution: string): Guess {
  const result: Guess = guess.split("").map((letter, index) => ({
    letter,
    status: letter === solution[index] ? 1 : null
  }));

  solution
    .split("")
    .filter((_, index) => !result[index].status)
    .forEach((letter) => {
      const index = result.findIndex((item) => item.letter === letter && !item.status);
      if (index > -1) result[index].status = 2;
    });

  return result;
}

export function tileClass(status: Guess[number]["status"]) {
  return status === 1 ? "tile exact" : status === 2 ? "tile included" : "tile excluded";
}
