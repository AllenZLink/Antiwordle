type SettingsModalProps = {
  hasDarkTheme: boolean;
  isHardMode: boolean;
  isOpen: boolean;
  onChangeDarkTheme: () => void;
  onChangeHardMode: () => void;
  onClose: () => void;
  personalBest: number;
  previousSolution: string;
  streak: number;
};

export function SettingsModal({
  hasDarkTheme,
  isHardMode,
  isOpen,
  onChangeDarkTheme,
  onChangeHardMode,
  onClose,
  personalBest,
  previousSolution,
  streak
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="react-responsive-modal-root">
      <div className="react-responsive-modal-overlay" onClick={onClose} />
      <div className="react-responsive-modal-container react-responsive-modal-containerCenter">
        <div
          className="react-responsive-modal-modal"
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          <button
            type="button"
            className="react-responsive-modal-closeButton"
            aria-label="Close modal"
            onClick={onClose}
          >
            <svg width="28" height="28" viewBox="0 0 36 36">
              <path d="M28.5 9.6 26.4 7.5 18 15.9 9.6 7.5 7.5 9.6l8.4 8.4-8.4 8.4 2.1 2.1 8.4-8.4 8.4 8.4 2.1-2.1-8.4-8.4z" />
            </svg>
          </button>
          <div className="settingsMenu">
            <p className="subheader">Settings</p>
            <label className="checkboxLabel">
              <input
                type="checkbox"
                className="checkbox"
                checked={isHardMode}
                onChange={onChangeHardMode}
              />
              Hard Mode
            </label>
            <p className="checkboxDescription">
              Letters marked yellow must change positions. Repeated letters marked gray can't be
              reused.
            </p>
            <label className="checkboxLabel">
              <input
                type="checkbox"
                className="checkbox"
                checked={hasDarkTheme}
                onChange={onChangeDarkTheme}
              />
              Dark Theme
            </label>
            <p className="menuItem seperator">
              <span className="subheader">Yesterday's Word:</span>
              <span className="yesterdaysWord">{previousSolution}</span>
            </p>
            {personalBest > 1 && (
              <p className="menuItem">
                <span className="subheader">Personal Best:</span>
                <span>{personalBest} guesses</span>
              </p>
            )}
            <p className="menuItem">
              <span className="subheader">Current Streak:</span>
              <span>
                {streak} {streak === 1 ? "game" : "games"}
              </span>
            </p>
            <p className="menuItem">
              <span className="subheader">Contact:</span>
              <a
                className="contact"
                href="mailto:info@antiwordle.com"
                target="_blank"
                rel="noreferrer"
                title="Email Antiwordle support"
              >
                info@antiwordle.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
