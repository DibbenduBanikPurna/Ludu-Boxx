import {
  HOME_LANES,
  PATH_COORDS,
  SAFE_INDICES,
  START_INDEX,
} from '../game/constants'
import { getTokenPixelPosition } from '../game/logic'
import Token from './Token'

function Board({
  players,
  activePlayers,
  highlightedTokenIds,
  currentColor,
  onTokenClick,
  canInteract,
  diceColor,
  diceSlot,
}) {
  const cornerZones = [
    { color: 'red', gridColumn: '1 / span 6', gridRow: '1 / span 6' },
    { color: 'blue', gridColumn: '10 / span 6', gridRow: '1 / span 6' },
    { color: 'yellow', gridColumn: '1 / span 6', gridRow: '10 / span 6' },
    { color: 'green', gridColumn: '10 / span 6', gridRow: '10 / span 6' },
  ]

  const safeCells = SAFE_INDICES.map((index) => PATH_COORDS[index])
  const startCells = activePlayers.map((color) => PATH_COORDS[START_INDEX[color]])
  const [diceX, diceY] = PATH_COORDS[START_INDEX[diceColor]]
  const laneCells = activePlayers.flatMap((color) =>
    HOME_LANES[color].map(([x, y], index) => ({ x, y, color, index })),
  )

  const tokenEntries = activePlayers.flatMap((color) => {
    const player = players[color]

    return player.tokens.map((token, tokenIndex) => {
      const position = getTokenPixelPosition(color, token, tokenIndex)
      const isHighlighted = highlightedTokenIds.includes(token.id)
      const isDisabled = !canInteract || !isHighlighted || currentColor !== color

      return {
        color,
        token,
        tokenIndex,
        position,
        isHighlighted,
        isDisabled,
      }
    })
  })

  const groupedTokens = tokenEntries.reduce((acc, entry) => {
    const key = `${entry.position.x}|${entry.position.y}`
    if (!acc.has(key)) {
      acc.set(key, [])
    }
    acc.get(key).push(entry)
    return acc
  }, new Map())

  const diceCellKey = `${diceX}|${diceY}`
  const diceCellTokenCount = groupedTokens.get(diceCellKey)?.length ?? 0

  const stackOffsets = [
    [0, 0],
    [-0.16, -0.16],
    [0.16, -0.16],
    [-0.16, 0.16],
    [0.16, 0.16],
    [0, -0.22],
    [0, 0.22],
    [-0.22, 0],
    [0.22, 0],
  ]

  const laneStackOffsets = [
    [0, 0],
    [-0.05, -0.05],
    [0.05, -0.05],
    [-0.05, 0.05],
    [0.05, 0.05],
    [0, -0.06],
    [0, 0.06],
    [-0.06, 0],
    [0.06, 0],
  ]

  const tokenEntriesWithStacks = tokenEntries.map((entry) => {
    const key = `${entry.position.x}|${entry.position.y}`
    const stack = groupedTokens.get(key)
    const stackIndex = stack.findIndex((item) => item.token.id === entry.token.id)
    const offsets = entry.position.place === 'lane' ? laneStackOffsets : stackOffsets
    const [offsetX, offsetY] = offsets[stackIndex] ?? [0, 0]

    return {
      ...entry,
      stackSize: stack.length,
      offsetX,
      offsetY,
    }
  })

  const stackBadges = Array.from(groupedTokens.entries())
    .filter(([, stack]) => stack.length > 1)
    .map(([key, stack]) => {
      const [x, y] = key.split('|').map(Number)
      const ownerCounts = activePlayers
        .map((color) => ({
          color,
          count: stack.filter((tokenEntry) => tokenEntry.color === color).length,
        }))
        .filter((item) => item.count > 0)

      return { x, y, count: stack.length, key, ownerCounts }
    })

  return (
    <section className="board-shell">
      <div className="board-stage">
        <div className="board-grid">
          <div
            className={`board-dice-slot ${diceCellTokenCount > 0 ? 'is-crowded' : ''} ${canInteract ? 'is-passive' : ''}`}
            style={{
              gridColumn: diceX + 1,
              gridRow: diceY + 1,
            }}
          >
            {diceSlot}
          </div>

          {cornerZones.map((zone) => (
            <div
              key={`zone-${zone.color}`}
              className={`quadrant quadrant-${zone.color}`}
              style={{ gridColumn: zone.gridColumn, gridRow: zone.gridRow }}
            >
              <div className="base-home-box">
                <span className={`base-slot base-slot-${zone.color}`} />
                <span className={`base-slot base-slot-${zone.color}`} />
                <span className={`base-slot base-slot-${zone.color}`} />
                <span className={`base-slot base-slot-${zone.color}`} />
              </div>
            </div>
          ))}

          {PATH_COORDS.map(([x, y], index) => (
            <div
              key={`path-${index}`}
              className="path-cell"
              style={{ gridColumn: x + 1, gridRow: y + 1 }}
            />
          ))}

          {laneCells.map((cell) => (
            <div
              key={`lane-${cell.color}-${cell.index}`}
              className={`lane-cell lane-${cell.color}`}
              style={{ gridColumn: cell.x + 1, gridRow: cell.y + 1 }}
            />
          ))}

          <div
            className="center-home"
            style={{ gridColumn: '7 / span 3', gridRow: '7 / span 3' }}
          />

          {safeCells.map(([x, y], index) => (
            <div
              key={`safe-${index}`}
              className="marker safe-marker"
              style={{ gridColumn: x + 1, gridRow: y + 1 }}
              title="Safe zone"
            />
          ))}

          {startCells.map(([x, y], index) => (
            <div
              key={`start-${index}`}
              className="marker start-marker"
              style={{ gridColumn: x + 1, gridRow: y + 1 }}
              title={`${activePlayers[index]} start`}
            />
          ))}

          {tokenEntriesWithStacks.map((entry) => (
            <div
              key={entry.token.id}
              className={`token-slot ${entry.stackSize > 1 ? 'is-stacked' : ''}`}
              style={{
                left: `calc((${entry.position.x} + 0.5 + ${entry.offsetX}) * var(--cell))`,
                top: `calc((${entry.position.y} + 0.5 + ${entry.offsetY}) * var(--cell))`,
              }}
            >
              <Token
                token={entry.token}
                color={entry.color}
                isHighlighted={entry.isHighlighted}
                disabled={entry.isDisabled}
                onClick={() => onTokenClick(entry.color, entry.token.id)}
              />
            </div>
          ))}

          {stackBadges.map((badge) => (
            <div
              key={`stack-${badge.key}`}
              className="stack-badge stack-owner-badge"
              style={{
                left: `calc(${badge.x} * var(--cell))`,
                top: `calc(${badge.y} * var(--cell))`,
              }}
            >
              {badge.ownerCounts.map((owner) => (
                <span
                  key={`${badge.key}-${owner.color}`}
                  className={`owner-chip owner-${owner.color}`}
                  title={`${owner.color}: ${owner.count}`}
                >
                  {owner.count}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

    </section>
  )
}

export default Board
