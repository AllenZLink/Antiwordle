import { useEffect, useMemo, useState } from "react";
import { getGameId, getPreviousSolution, getSolution, timeUntilNextGame } from "../game/dailyWord";
import { evaluateGuess } from "../game/evaluateGuess";
import { validateHardMode } from "../game/hardMode";
import { getShareText, isMobileShareAvailable } from "../game/share";
import { isValidWord } from "../game/words";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { Guess } from "../types";
import { GuessGrid } from "./GuessGrid";
import { Keyboard } from "./Keyboard";
import { SettingsModal } from "./SettingsModal";

type GameProps = {
  hasDarkTheme: boolean;
  isMenuOpen: boolean;
  onChangeDarkTheme: () => void;
  onMenuClose: () => void;
};

let toastTimeout: number | null = null;

export function Game({ hasDarkTheme, isMenuOpen, onChangeDarkTheme, onMenuClose }: GameProps) {
  const [currentGuess, setCurrentGuess] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [guesses, setGuesses] = useLocalStorage<Guess[]>([], "guesses");
  const [isHardMode, setIsHardMode] = useLocalStorage(false, "isHardMode");
  const [hadHardMode, setHadHardMode] = useLocalStorage(false, "hadHardMode");
  const [personalBest, setPersonalBest] = useLocalStorage(0, "pb");
  const [streak, setStreak] = useLocalStorage(0, "streak");
  const [lastGameId, setLastGameId] = useLocalStorage<number | null>(null, "lg");
  const [gameId, setGameId] = useLocalStorage(getGameId(now), "gameId");
  const solution = getSolution(gameId);
  const isOver =
    guesses.length > 0 && guesses[guesses.length - 1].map((item) => item.letter).join("") === solution;
  const hasStarted = guesses.length > 0 && !isOver;

  const guessedLetters = useMemo(
    () => Array.from(new Set(guesses.flatMap((guess) => guess.map((item) => item.letter)))),
    [guesses]
  );

  useEffect(() => {
    const checkDate = () => {
      const nextNow = Date.now();
      const nextGameId = getGameId(nextNow);

      setNow(nextNow);
      if (nextGameId !== gameId) {
        if (!lastGameId || nextGameId > lastGameId + 1) setStreak(0);
        setGameId(nextGameId);
        setGuesses([]);
        setCurrentGuess("");
      }
    };

    checkDate();
    const timer = window.setInterval(checkDate, 10000);
    return () => window.clearInterval(timer);
  }, [gameId, lastGameId, setGameId, setGuesses, setStreak]);

  function showToast(message: string) {
    setToast(message);
    if (toastTimeout) window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => setToast(null), 2000);
  }

  function excludedLetters() {
    return guessedLetters.filter((letter) => !solution.includes(letter));
  }

  function exactPositions() {
    return solution.split("").map((_, index) => guesses.some((guess) => guess[index].status === 1));
  }

  function requiredLetters() {
    return guessedLetters.filter((letter) => solution.includes(letter));
  }

  function scrollToGame() {
    const root = document.getElementById("root");
    if (!root || window.innerHeight >= root.offsetHeight) return;
    window.scrollTo({ top: root.offsetHeight - window.innerHeight, behavior: "smooth" });
  }

  function markWin() {
    if (currentGuess === solution) {
      const nextLength = guesses.length + 1;
      if (nextLength > personalBest) setPersonalBest(nextLength);
      setHadHardMode(isHardMode);
      setStreak(lastGameId && gameId === lastGameId + 1 ? streak + 1 : 1);
      setLastGameId(gameId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function submitGuess() {
    if (isOver || currentGuess.length === 0) return;
    if (currentGuess.length < 5) {
      showToast("Too short");
      return;
    }

    if (!isValidWord(currentGuess)) {
      showToast("Not in dictionary");
      return;
    }

    const lockedPosition = exactPositions().findIndex(
      (isExact, index) => isExact && currentGuess[index] !== solution[index]
    );
    if (lockedPosition > -1) {
      showToast(`Needs ${solution[lockedPosition]} in position ${lockedPosition + 1}`);
      return;
    }

    const missingRequired = requiredLetters().find((letter) => !currentGuess.includes(letter));
    if (missingRequired) {
      showToast(`Needs to include ${missingRequired}`);
      return;
    }

    if (guesses.some((guess) => guess.map((item) => item.letter).join("") === currentGuess)) {
      showToast("Already guessed");
      return;
    }

    const nextGuess = evaluateGuess(currentGuess, solution);

    if (isHardMode && guesses.length > 0) {
      const hardModeMessage = validateHardMode(nextGuess, guesses, solution);
      if (hardModeMessage) {
        showToast(hardModeMessage);
        return;
      }
    }

    scrollToGame();
    markWin();
    setGuesses((previous) => [...previous, nextGuess]);
    setCurrentGuess("");
  }

  function pressKey(letter: string) {
    if (isOver || currentGuess.length >= 5 || excludedLetters().includes(letter)) return;
    setCurrentGuess((value) => (value.length < 5 ? `${value}${letter}` : value));
  }

  function backspace() {
    setCurrentGuess((value) => value.slice(0, -1));
  }

  function shareText() {
    return getShareText(gameId, guesses, hadHardMode);
  }

  function copyShareText() {
    navigator.clipboard?.writeText?.(shareText()).then(() => showToast("Copied to clipboard"));
  }

  function share() {
    const text = shareText();
    if (
      navigator.share &&
      isMobileShareAvailable() &&
      !/firefox/i.test(navigator.userAgent) &&
      navigator.canShare?.({ text })
    ) {
      navigator.share({ text }).catch(() => copyShareText());
      return;
    }

    copyShareText();
  }

  function getKeyClass(letter: string) {
    if (excludedLetters().includes(letter)) return "key excluded";
    if (exactPositions().some((isExact, index) => isExact && solution[index] === letter)) {
      return "key exact";
    }
    if (requiredLetters().includes(letter)) return "key included";
    return "key";
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Backspace") {
        backspace();
        return;
      }

      if (event.repeat) return;
      if (event.code === "Enter") {
        submitGuess();
        return;
      }

      const letter = event.key?.toUpperCase();
      if (letter && /^[A-Z]$/.test(letter)) pressKey(letter);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });

  return (
    <>
      {toast && <div className="toast">{toast}</div>}
      {isOver && (
        <>
          <p className="success">
            You lasted {guesses.length === 1 ? "1 guess" : `${guesses.length} guesses`}
            {guesses.length >= personalBest && ", a personal best"}!
          </p>
          <p>{timeUntilNextGame(now)} until the next game.</p>
          <button type="button" onClick={share}>
            Share
          </button>
        </>
      )}
      <div className={isOver ? "over" : undefined}>
        <GuessGrid guesses={guesses} currentGuess={currentGuess} isOver={isOver} />
        <Keyboard
          getKeyClass={getKeyClass}
          onKeyPress={pressKey}
          onSubmit={submitGuess}
          onBackspace={backspace}
        />
      </div>
      <SettingsModal
        isOpen={isMenuOpen}
        onClose={onMenuClose}
        isHardMode={isHardMode}
        onChangeHardMode={() => {
          if (!hasStarted || isHardMode) {
            setIsHardMode((value) => !value);
          } else {
            showToast("Can only be enabled at the start of a game");
          }
        }}
        hasDarkTheme={hasDarkTheme}
        onChangeDarkTheme={onChangeDarkTheme}
        previousSolution={getPreviousSolution(gameId)}
        personalBest={personalBest}
        streak={streak}
      />
    </>
  );
}
