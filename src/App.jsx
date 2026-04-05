import { useEffect, useMemo, useReducer } from 'react'
import './App.css'
import Board from './components/Board'
import Dice from './components/Dice'
import { BOT_LEVELS, GAME_MODES } from './game/constants'
import {
  advanceTurn,
  chooseBotMove,
  createInitialState,
  finishNoMoveTurn,
  getCurrentPlayer,
  getMovableTokens,
  moveTokenInState,
  processDiceResult,
  resolveTurnAfterMove,
} from './game/logic'

const DEFAULT_MODE = GAME_MODES.BOT

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_MODE':
      return createInitialState(action.mode, state.botLevel)
    case 'SET_BOT_LEVEL':
      return {
        ...state,
        botLevel: action.level,
      }
    case 'RESTART':
      return createInitialState(state.mode, state.botLevel)
    case 'ROLL_START':
      if (state.winner || state.diceRolling || state.mustMoveToken) {
        return state
      }

      return {
        ...state,
        diceRolling: true,
        pendingAutoPass: false,
        status: `${state.players[getCurrentPlayer(state)].name} is rolling...`,
      }
    case 'ROLL_DONE': {
      if (state.winner) {
        return state
      }

      const didTripleSixCancel =
        action.value === 6 && state.consecutiveSixes === 2
      const processed = processDiceResult(state, action.value)

      if (didTripleSixCancel) {
        return processed
      }

      if (processed.highlightedTokenIds.length === 0) {
        if (action.value === 6) {
          return finishNoMoveTurn(processed, action.value)
        }

        return {
          ...processed,
          pendingAutoPass: true,
        }
      }

      return processed
    }
    case 'MOVE_TOKEN': {
      if (state.winner || !state.diceValue) {
        return state
      }

      const movable = getMovableTokens(state, action.color, state.diceValue)
      const isLegal = movable.some((token) => token.id === action.tokenId)
      if (!isLegal) {
        return state
      }

      const moved = moveTokenInState(
        state,
        action.color,
        action.tokenId,
        state.diceValue,
      )

      if (moved.winner) {
        return {
          ...moved,
          highlightedTokenIds: [],
          mustMoveToken: false,
          pendingAutoPass: false,
          diceValue: null,
          diceRolling: false,
        }
      }

      return resolveTurnAfterMove(moved, state.diceValue, action.tokenId)
    }
    case 'PASS_TURN':
      return advanceTurn({
        ...state,
        pendingAutoPass: false,
      })
    default:
      return state
  }
}

function App() {
  const [state, dispatch] = useReducer(
    gameReducer,
    createInitialState(DEFAULT_MODE, BOT_LEVELS.MEDIUM),
  )

  const currentColor = getCurrentPlayer(state)
  const currentPlayer = state.players[currentColor]
  const modeOptions = useMemo(
    () => [
      { value: GAME_MODES.TWO_PLAYERS, label: '2 Players (1 vs 1)' },
      { value: GAME_MODES.FOUR_PLAYERS, label: '4 Players (Solo)' },
      { value: GAME_MODES.TEAM, label: 'Team (2 vs 2)' },
      { value: GAME_MODES.BOT, label: 'Player vs Bot' },
    ],
    [],
  )

  const canRoll =
    !state.winner && !state.diceRolling && !state.mustMoveToken && !currentPlayer?.isBot

  const handleRoll = () => {
    if (!canRoll) {
      return
    }

    dispatch({ type: 'ROLL_START' })

    window.setTimeout(() => {
      const value = Math.floor(Math.random() * 6) + 1
      dispatch({ type: 'ROLL_DONE', value })
    }, 700)
  }

  const handleTokenClick = (color, tokenId) => {
    if (color !== currentColor || !state.mustMoveToken) {
      return
    }

    dispatch({ type: 'MOVE_TOKEN', color, tokenId })
  }

  useEffect(() => {
    if (!state.pendingAutoPass || state.winner) {
      return undefined
    }

    const passTimer = window.setTimeout(() => {
      dispatch({ type: 'PASS_TURN' })
    }, 850)

    return () => window.clearTimeout(passTimer)
  }, [state.pendingAutoPass, state.winner])

  useEffect(() => {
    if (state.winner || !currentPlayer?.isBot) {
      return undefined
    }

    if (!state.diceRolling && state.diceValue === null && !state.mustMoveToken) {
      const rollTimer = window.setTimeout(() => {
        dispatch({ type: 'ROLL_START' })
        window.setTimeout(() => {
          dispatch({ type: 'ROLL_DONE', value: Math.floor(Math.random() * 6) + 1 })
        }, 600)
      }, 700)

      return () => window.clearTimeout(rollTimer)
    }

    if (state.diceValue !== null && state.highlightedTokenIds.length > 0) {
      const moveTimer = window.setTimeout(() => {
        const tokenId = chooseBotMove(
          state,
          currentColor,
          state.diceValue,
          state.botLevel,
        )

        if (tokenId) {
          dispatch({ type: 'MOVE_TOKEN', color: currentColor, tokenId })
        } else {
          dispatch({ type: 'PASS_TURN' })
        }
      }, 850)

      return () => window.clearTimeout(moveTimer)
    }

    return undefined
  }, [state, currentColor, currentPlayer])

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <h1>Ludo Arena</h1>
          <p className="subtitle">Play local multiplayer, team mode, or challenge the bot.</p>
        </div>

        <div className="topbar-controls">
          <label>
            Mode
            <select
              value={state.mode}
              onChange={(event) =>
                dispatch({ type: 'SET_MODE', mode: event.target.value })
              }
            >
              {modeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {state.mode === GAME_MODES.BOT && (
            <label>
              Bot Difficulty
              <select
                value={state.botLevel}
                onChange={(event) =>
                  dispatch({ type: 'SET_BOT_LEVEL', level: event.target.value })
                }
              >
                <option value={BOT_LEVELS.EASY}>Easy</option>
                <option value={BOT_LEVELS.MEDIUM}>Medium</option>
                <option value={BOT_LEVELS.HARD}>Hard</option>
              </select>
            </label>
          )}

          <button type="button" className="btn" onClick={() => dispatch({ type: 'RESTART' })}>
            Restart
          </button>
        </div>
      </header>

      <section className="layout">
        <Board
          players={state.players}
          activePlayers={state.activePlayers}
          highlightedTokenIds={state.highlightedTokenIds}
          currentColor={currentColor}
          onTokenClick={handleTokenClick}
          canInteract={!currentPlayer?.isBot && state.mustMoveToken}
          diceColor={currentColor}
          diceSlot={(
            <Dice
              value={state.diceValue}
              isRolling={state.diceRolling}
              onRoll={handleRoll}
              disabled={!canRoll}
              variant="board"
              tone={currentColor}
            />
          )}
        />
      </section>
    </main>
  )
}

export default App
