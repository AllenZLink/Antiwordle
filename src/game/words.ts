import { allowedWords } from "../data/allowedWords";
import { solutions } from "../data/solutions";

const wordSet = new Set<string>([...allowedWords, ...solutions]);

export function isValidWord(word: string) {
  return wordSet.has(word);
}
