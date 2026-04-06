import {
  BASE_SLOTS,
  BOT_LEVELS,
  FINAL_STEP,
  GAME_MODES,
  HOME_LANE_START_STEP,
  HOME_LANES,
  HOME_SLOTS,
  PATH_COORDS,
  PATH_LENGTH,
  PLAYER_META,
  PLAYER_ORDER,
  SAFE_INDICES,
  START_INDEX,
} from './constants'

const TOKENS_PER_PLAYER = 4
const TRACK_LAST_STEP = PATH_LENGTH - 1

export function getModePlayers(mode) {
  switch (mode) {
    case GAME_MODES.TWO_PLAYERS:
      return ['red', 'blue']
    case GAME_MODES.THREE_PLAYERS:
      return ['red', 'blue', 'green']
    case GAME_MODES.BOT:
      return ['red', 'blue']
    case GAME_MODES.TEAM:
    case GAME_MODES.FOUR_PLAYERS:
    default:
      return [...PLAYER_ORDER]
  }
}

export function getTeam(color, mode) {
  if (mode !== GAME_MODES.TEAM) {
    return color
  }

  return color === 'red' || color === 'green' ? 'team-a' : 'team-b'
}

export function createInitialState(mode, botLevel = BOT_LEVELS.MEDIUM) {
  const activePlayers = getModePlayers(mode)
  const players = {}

  activePlayers.forEach((color, index) => {
    players[color] = {
      color,
      name: PLAYER_META[color].name,
      tokens: Array.from({ length: TOKENS_PER_PLAYER }, (_, tokenId) => ({
        id: `${color}-${tokenId}`,
        steps: -1,
      })),
      isBot: mode === GAME_MODES.BOT && color === 'blue',
      team: getTeam(color, mode),
      turnOrder: index,
    }
  })

  return {
    mode,
    botLevel,
    players,
    activePlayers,
    currentPlayerIndex: 0,
    diceValue: null,
    diceRolling: false,
    consecutiveSixes: 0,
    mustMoveToken: false,
    highlightedTokenIds: [],
    pendingAutoPass: false,
    winner: null,
    status: 'Playing',
    lastMove: null,
  }
}

export function getCurrentPlayer(state) {
  return state.activePlayers[state.currentPlayerIndex]
}

export function advanceTurn(state) {
  const nextIndex = (state.currentPlayerIndex + 1) % state.activePlayers.length
  return {
    ...state,
    currentPlayerIndex: nextIndex,
    diceValue: null,
    diceRolling: false,
    consecutiveSixes: 0,
    mustMoveToken: false,
    highlightedTokenIds: [],
    pendingAutoPass: false,
    lastMove: null,
  }
}

export function canTokenMove(token, diceValue) {
  if (token.steps === FINAL_STEP) {
    return false
  }

  if (token.steps === -1) {
    return diceValue === 6
  }

  return token.steps + diceValue <= FINAL_STEP
}

export function getMovableTokens(state, color, diceValue) {
  const player = state.players[color]
  if (!player || !Number.isInteger(diceValue)) {
    return []
  }

  return player.tokens.filter((token) => canTokenMove(token, diceValue))
}

function getPathIndex(color, token) {
  if (token.steps < 0 || token.steps > TRACK_LAST_STEP) {
    return null
  }

  return (START_INDEX[color] + token.steps) % PATH_LENGTH
}

function isTokenInSafeZone(color, token) {
  const pathIndex = getPathIndex(color, token)
  if (pathIndex === null) {
    return false
  }

  return SAFE_INDICES.includes(pathIndex)
}

export function moveTokenInState(state, color, tokenId, diceValue) {
  const player = state.players[color]
  const token = player.tokens.find((item) => item.id === tokenId)

  if (!token || !canTokenMove(token, diceValue)) {
    return state
  }

  const nextSteps = token.steps === -1 ? 0 : token.steps + diceValue

  const updatedPlayers = {
    ...state.players,
    [color]: {
      ...player,
      tokens: player.tokens.map((item) =>
        item.id === tokenId ? { ...item, steps: nextSteps } : item,
      ),
    },
  }

  const updatedState = {
    ...state,
    players: updatedPlayers,
    lastMove: {
      color,
      tokenId,
      diceValue,
      captured: [],
    },
  }

  const captureResult = captureTokens(updatedState, color, tokenId)
  const winner = getWinner(captureResult)

  return {
    ...captureResult,
    winner,
    status: winner ? `Winner: ${winner.label}` : 'Playing',
  }
}

function captureTokens(state, movingColor, movingTokenId) {
  const movingToken = state.players[movingColor].tokens.find(
    (token) => token.id === movingTokenId,
  )

  if (!movingToken || movingToken.steps < 0 || movingToken.steps > TRACK_LAST_STEP) {
    return state
  }

  if (isTokenInSafeZone(movingColor, movingToken)) {
    return state
  }

  const movingPathIndex = getPathIndex(movingColor, movingToken)
  if (movingPathIndex === null) {
    return state
  }

  const captured = []
  const players = { ...state.players }

  state.activePlayers.forEach((color) => {
    if (color === movingColor) {
      return
    }

    const updatedTokens = players[color].tokens.map((token) => {
      if (token.steps < 0 || token.steps > TRACK_LAST_STEP) {
        return token
      }

      if (isTokenInSafeZone(color, token)) {
        return token
      }

      const tokenPathIndex = getPathIndex(color, token)
      if (tokenPathIndex === movingPathIndex) {
        captured.push(token.id)
        return { ...token, steps: -1 }
      }

      return token
    })

    players[color] = {
      ...players[color],
      tokens: updatedTokens,
    }
  })

  return {
    ...state,
    players,
    lastMove: {
      ...state.lastMove,
      captured,
    },
  }
}

export function getWinner(state) {
  const hasAllHome = (color) =>
    state.players[color].tokens.every((token) => token.steps === FINAL_STEP)

  if (state.mode === GAME_MODES.TEAM) {
    const teamAPlayers = state.activePlayers.filter(
      (color) => getTeam(color, state.mode) === 'team-a',
    )
    const teamBPlayers = state.activePlayers.filter(
      (color) => getTeam(color, state.mode) === 'team-b',
    )

    const teamAWins = teamAPlayers.every((color) => hasAllHome(color))
    const teamBWins = teamBPlayers.every((color) => hasAllHome(color))

    if (teamAWins) {
      return { type: 'team', key: 'team-a', label: 'Team Red + Green' }
    }

    if (teamBWins) {
      return { type: 'team', key: 'team-b', label: 'Team Blue + Yellow' }
    }

    return null
  }

  const winnerColor = state.activePlayers.find((color) => hasAllHome(color))
  if (!winnerColor) {
    return null
  }

  return {
    type: 'player',
    key: winnerColor,
    label: PLAYER_META[winnerColor].name,
  }
}

export function resolveTurnAfterMove(state, rolledValue, movedTokenId) {
  const currentColor = getCurrentPlayer(state)
  const movedToken = state.players[currentColor]?.tokens.find(
    (token) => token.id === movedTokenId,
  )
  const capturedCount = state.lastMove?.captured?.length ?? 0
  const reachedFinal = movedToken?.steps === FINAL_STEP
  const hasBonusTurn = rolledValue === 6 || capturedCount > 0 || reachedFinal

  if (hasBonusTurn) {
    let bonusReason = 'extra turn'

    if (rolledValue === 6) {
      bonusReason = 'rolled 6: extra turn'
    } else if (capturedCount > 0 && reachedFinal) {
      bonusReason = 'captured and reached home: extra turn'
    } else if (capturedCount > 0) {
      bonusReason = 'capture bonus: extra turn'
    } else if (reachedFinal) {
      bonusReason = 'home bonus: extra turn'
    }

    return {
      ...state,
      diceValue: null,
      diceRolling: false,
      highlightedTokenIds: [],
      mustMoveToken: false,
      status: movedTokenId
        ? `${state.players[currentColor].name} ${bonusReason}`
        : state.status,
    }
  }

  return advanceTurn({
    ...state,
    highlightedTokenIds: [],
    mustMoveToken: false,
  })
}

export function processDiceResult(state, diceValue) {
  if (state.winner) {
    return state
  }

  const color = getCurrentPlayer(state)
  const movable = getMovableTokens(state, color, diceValue)

  if (diceValue === 6) {
    const nextSixCount = state.consecutiveSixes + 1

    if (nextSixCount === 3) {
      return {
        ...advanceTurn(state),
        diceValue,
        status: `${state.players[color].name} rolled three 6s: turn canceled`,
      }
    }

    return {
      ...state,
      diceValue,
      diceRolling: false,
      consecutiveSixes: nextSixCount,
      highlightedTokenIds: movable.map((token) => token.id),
      mustMoveToken: movable.length > 0,
      status:
        movable.length > 0
          ? `${state.players[color].name} rolled 6: choose a token`
          : `${state.players[color].name} rolled 6: no movable tokens`,
    }
  }

  return {
    ...state,
    diceValue,
    diceRolling: false,
    consecutiveSixes: 0,
    highlightedTokenIds: movable.map((token) => token.id),
    mustMoveToken: movable.length > 0,
    status:
      movable.length > 0
        ? `${state.players[color].name} rolled ${diceValue}`
        : `${state.players[color].name} cannot move`,
  }
}

export function finishNoMoveTurn(state, rolledValue) {
  if (rolledValue === 6) {
    return {
      ...state,
      diceValue: null,
      highlightedTokenIds: [],
      mustMoveToken: false,
      status: `${state.players[getCurrentPlayer(state)].name} gets extra roll`,
    }
  }

  return advanceTurn(state)
}

export function getTokenPixelPosition(color, token, tokenIndex) {
  if (token.steps === -1) {
    const [x, y] = BASE_SLOTS[color][tokenIndex]
    return { x, y, place: 'base' }
  }

  if (token.steps === FINAL_STEP) {
    const [x, y] = HOME_SLOTS[color][tokenIndex]
    return { x, y, place: 'home' }
  }

  if (token.steps >= HOME_LANE_START_STEP) {
    const laneIndex = token.steps - HOME_LANE_START_STEP
    const [x, y] = HOME_LANES[color][laneIndex]
    return { x, y, place: 'lane' }
  }

  const index = (START_INDEX[color] + token.steps) % PATH_LENGTH
  const [x, y] = PATH_COORDS[index]
  return { x, y, place: 'track' }
}

function scoreMove(state, color, tokenId, diceValue) {
  const simulation = moveTokenInState(state, color, tokenId, diceValue)
  const token = simulation.players[color].tokens.find((item) => item.id === tokenId)
  const capturedCount = simulation.lastMove?.captured?.length ?? 0

  let score = 0

  if (capturedCount > 0) {
    score += capturedCount * 100
  }

  if (token.steps === FINAL_STEP) {
    score += 80
  }

  score += Math.max(token.steps, 0)

  if (diceValue === 6 && token.steps === 0) {
    score += 15
  }

  if (token.steps >= 0 && token.steps <= TRACK_LAST_STEP) {
    const isSafe = SAFE_INDICES.includes((START_INDEX[color] + token.steps) % PATH_LENGTH)
    if (isSafe) {
      score += 8
    }
  }

  return score
}

export function chooseBotMove(state, color, diceValue, level = BOT_LEVELS.MEDIUM) {
  const movable = getMovableTokens(state, color, diceValue)
  if (movable.length === 0) {
    return null
  }

  if (level === BOT_LEVELS.EASY) {
    const randomIndex = Math.floor(Math.random() * movable.length)
    return movable[randomIndex].id
  }

  const scoredMoves = movable.map((token) => ({
    tokenId: token.id,
    score: scoreMove(state, color, token.id, diceValue),
  }))

  scoredMoves.sort((a, b) => b.score - a.score)

  if (level === BOT_LEVELS.MEDIUM) {
    return scoredMoves[0].tokenId
  }

  const topScore = scoredMoves[0].score
  const topMoves = scoredMoves.filter((move) => move.score >= topScore - 8)
  const choice = topMoves[Math.floor(Math.random() * topMoves.length)]
  return choice.tokenId
}
