import type { Guess } from "../types";

export function getShareText(gameId: number, guesses: Guess[], hadHardMode: boolean) {
  const rows = guesses.map((guess) =>
    guess
      .map((item) => (item.status === 1 ? "🟥" : item.status === 2 ? "🟨" : "⬛"))
      .join("")
  );

  return `Antiwordle #${gameId}\n ${guesses.length} ${
    guesses.length === 1 ? "guess" : "guesses"
  }${hadHardMode ? "*" : ""}\n\n${rows.join("\n")}\n`;
}

export function isMobileShareAvailable() {
  const userAgentData = navigator as Navigator & { userAgentData?: { mobile?: boolean } };

  return (
    userAgentData.userAgentData?.mobile ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  );
}
