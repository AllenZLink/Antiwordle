type KeyboardProps = {
  getKeyClass: (letter: string) => string;
  onBackspace: () => void;
  onKeyPress: (letter: string) => void;
  onSubmit: () => void;
};

export function Keyboard({ getKeyClass, onBackspace, onKeyPress, onSubmit }: KeyboardProps) {
  return (
    <>
      <div className="keyboardRow">
        {"QWERTYUIOP".split("").map((letter) => (
          <button
            key={letter}
            type="button"
            className={getKeyClass(letter)}
            onClick={() => onKeyPress(letter)}
          >
            {letter}
          </button>
        ))}
      </div>
      <div className="keyboardRow">
        <div className="spacer" />
        {"ASDFGHJKL".split("").map((letter) => (
          <button
            key={letter}
            type="button"
            className={getKeyClass(letter)}
            onClick={() => onKeyPress(letter)}
          >
            {letter}
          </button>
        ))}
        <div className="spacer" />
      </div>
      <div className="keyboardRow">
        <button type="button" className="key enter" onClick={onSubmit}>
          ENTER
        </button>
        {"ZXCVBNM".split("").map((letter) => (
          <button
            key={letter}
            type="button"
            className={getKeyClass(letter)}
            onClick={() => onKeyPress(letter)}
          >
            {letter}
          </button>
        ))}
        <button type="button" aria-label="Backspace" className="key back" onClick={onBackspace}>
          ⌫
        </button>
      </div>
    </>
  );
}
