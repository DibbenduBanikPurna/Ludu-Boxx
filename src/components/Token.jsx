function Token({ token, color, isHighlighted, onClick, disabled }) {
  return (
    <button
      className={`token token-${color} ${isHighlighted ? 'is-highlighted' : ''}`}
      onClick={onClick}
      disabled={disabled}
      title={token.id}
      type="button"
    >
      <span className="token-core" />
    </button>
  )
}

export default Token
