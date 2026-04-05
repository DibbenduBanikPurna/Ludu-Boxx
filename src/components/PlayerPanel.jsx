import { FINAL_STEP, PLAYER_META } from '../game/constants'

function PlayerPanel({ players, activePlayers, currentColor, winner, mode }) {
  const active = activePlayers.map((color) => players[color]).filter(Boolean)

  return (
    <section className="panel players-panel">
      <h2>Players</h2>
      <div className="player-list">
        {active.map((player) => {
          const homeCount = player.tokens.filter((token) => token.steps === FINAL_STEP).length
          const inBaseCount = player.tokens.filter((token) => token.steps === -1).length
          const isCurrent = player.color === currentColor

          return (
            <article
              key={player.color}
              className={`player-card ${isCurrent ? 'active' : ''} ${player.isBot ? 'bot' : ''}`}
            >
              <div className="player-title">
                <span
                  className="swatch"
                  style={{ backgroundColor: PLAYER_META[player.color].color }}
                />
                <strong>{player.name}</strong>
                {player.isBot && <em>BOT</em>}
              </div>
              <p>Base: {inBaseCount}</p>
              <p>Home: {homeCount}</p>
              {mode === 'team' && <p>Team: {player.team}</p>}
              {winner && winner.key === player.color && <p className="winner-tag">Winner</p>}
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default PlayerPanel
