type InstructionsProps = {
  onPlayClick: () => void;
};

export function Instructions({ onPlayClick }: InstructionsProps) {
  return (
    <div className="instructions">
      <p>
        Avoid guessing the hidden word in as <em>many</em> tries as possible. Sounds easy, but
        there's a catch!
      </p>
      <ul>
        <li>
          If you guess a letter that's not in the word, it's <span className="gray">grayed</span>{" "}
          out and you can't use it again.
        </li>
        <li>
          If you guess a letter that is in the word, it turns{" "}
          <span className="yellow">yellow</span> and you must include it.
        </li>
        <li>
          If you guess a letter in the exact position, it turns <span className="red">red</span>{" "}
          and is locked in place.
        </li>
        <li>There's a new game every day!</li>
      </ul>
      <div className="center">
        <button type="button" onClick={onPlayClick}>
          Play
        </button>
      </div>
    </div>
  );
}
