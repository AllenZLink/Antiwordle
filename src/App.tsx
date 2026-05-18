import { useLayoutEffect, useState } from "react";
import { Game } from "./components/Game";
import { Header } from "./components/Header";
import { Instructions } from "./components/Instructions";
import { useLocalStorage } from "./hooks/useLocalStorage";

export function App() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasPlayed, setHasPlayed] = useLocalStorage(false, "played");
  const [darkSetting, setDarkSetting] = useLocalStorage<boolean | null>(null, "dark");
  const hasDarkTheme =
    darkSetting !== null
      ? darkSetting
      : window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  useLayoutEffect(() => {
    document.body.classList?.toggle("darkTheme", hasDarkTheme);
  }, [hasDarkTheme]);

  return (
    <div className="container">
      <Header
        onHelpClick={() => setIsHelpOpen((value) => !value)}
        onMenuClick={() => {
          setIsMenuOpen((value) => !value);
          setIsHelpOpen(false);
        }}
        isDisabled={!hasPlayed}
      />
      {!hasPlayed || isHelpOpen ? (
        <Instructions
          onPlayClick={() => {
            setHasPlayed(true);
            setIsHelpOpen(false);
          }}
        />
      ) : (
        <Game
          isMenuOpen={isMenuOpen}
          onMenuClose={() => setIsMenuOpen(false)}
          hasDarkTheme={hasDarkTheme}
          onChangeDarkTheme={() => setDarkSetting(!hasDarkTheme)}
        />
      )}
    </div>
  );
}
