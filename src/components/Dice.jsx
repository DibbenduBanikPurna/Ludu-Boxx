const PIP_MAP = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9],
}

function Dice({ value, isRolling, onRoll, disabled, variant = 'default', tone = 'red' }) {
  const shownValue = value ?? 1
  const pipIndexes = PIP_MAP[shownValue]

  return (
    <div className={`dice-wrap dice-wrap-${variant} tone-${tone}`}>
      <button
        type="button"
        className={`dice dice-${variant} tone-${tone} ${isRolling ? 'rolling' : ''}`}
        onClick={onRoll}
        disabled={disabled || isRolling}
      >
        {isRolling ? (
          <span className="dice-face dice-face-rolling" aria-hidden="true">
            {Array.from({ length: 9 }, (_, index) => index + 1).map((pip) => (
              <span key={pip} className="pip pip-roll" />
            ))}
          </span>
        ) : (
          <span className="dice-face" aria-hidden="true">
            {Array.from({ length: 9 }, (_, index) => index + 1).map((pip) => (
              <span
                key={pip}
                className={`pip ${pipIndexes.includes(pip) ? 'show' : ''}`}
              />
            ))}
          </span>
        )}
      </button>
      <div className="dice-caption">Tap To Roll</div>
    </div>
  )
}

export default Dice
