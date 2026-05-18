import { solutions } from "../data/solutions";

const START_DATE = new Date(2022, 1, 6);
const DAY_MS = 86400000;

export function getGameId(date: number | Date) {
  const today = new Date(date).setHours(0, 0, 0, 0);
  return Math.round((today - START_DATE.getTime()) / DAY_MS);
}

export function getSolution(gameId: number) {
  return solutions[gameId % solutions.length];
}

export function getPreviousSolution(gameId: number) {
  return solutions[(gameId - 1) % solutions.length];
}

export function timeUntilNextGame(now: number) {
  const next = new Date(now);
  next.setDate(next.getDate() + 1);
  next.setHours(0, 0, 0, 0);

  const minutes = Math.ceil((next.getTime() - now) / 60000);
  if (minutes === 1) return "1 minute";
  if (minutes < 1) return "Less than a minute";
  if (minutes < 60) return `${minutes} minutes`;

  const hours = Math.ceil(minutes / 60);
  return hours === 1 ? "1 hour" : `${hours} hours`;
}
