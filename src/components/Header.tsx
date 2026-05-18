type HeaderProps = {
  isDisabled: boolean;
  onHelpClick: () => void;
  onMenuClick: () => void;
};

export function Header({ isDisabled, onHelpClick, onMenuClick }: HeaderProps) {
  return (
    <div className="header">
      <button
        type="button"
        title="Menu"
        aria-label="Menu"
        className="menuButton"
        disabled={isDisabled}
        onClick={onMenuClick}
      >
        <svg viewBox="-5 0 10 7" xmlns="http://www.w3.org/2000/svg">
          <line y2="7" stroke="#888" strokeWidth="10" strokeDasharray="1 2" />
        </svg>
      </button>
      <h1 className="title">Antiwordle</h1>
      <button
        type="button"
        title="How to Play"
        aria-label="How to Play"
        className="help"
        disabled={isDisabled}
        onClick={onHelpClick}
      >
        ?
      </button>
    </div>
  );
}
