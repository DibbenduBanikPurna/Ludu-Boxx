export const PLAYER_ORDER = ['red', 'blue', 'green', 'yellow']

export const PLAYER_META = {
  red: { name: 'Red', color: '#d64545', accent: '#f8d7d7', isBotDefault: false },
  blue: {
    name: 'Blue',
    color: '#18aee9',
    accent: '#d8e6ff',
    isBotDefault: false,
  },
  green: {
    name: 'Green',
    color: '#2e9e54',
    accent: '#d9f2e2',
    isBotDefault: false,
  },
  yellow: {
    name: 'Yellow',
    color: '#d4a627',
    accent: '#f8edc9',
    isBotDefault: false,
  },
}

export const GAME_MODES = {
  TWO_PLAYERS: '2p',
  FOUR_PLAYERS: '4p',
  TEAM: 'team',
  BOT: 'bot',
}

export const BOT_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
}

export const BOARD_SIZE = 15

export const PATH_COORDS = [
  [1, 6],
  [2, 6],
  [3, 6],
  [4, 6],
  [5, 6],
  [6, 5],
  [6, 4],
  [6, 3],
  [6, 2],
  [6, 1],
  [6, 0],
  [7, 0],
  [8, 0],
  [8, 1],
  [8, 2],
  [8, 3],
  [8, 4],
  [8, 5],
  [9, 6],
  [10, 6],
  [11, 6],
  [12, 6],
  [13, 6],
  [14, 6],
  [14, 7],
  [14, 8],
  [13, 8],
  [12, 8],
  [11, 8],
  [10, 8],
  [9, 8],
  [8, 9],
  [8, 10],
  [8, 11],
  [8, 12],
  [8, 13],
  [8, 14],
  [7, 14],
  [6, 14],
  [6, 13],
  [6, 12],
  [6, 11],
  [6, 10],
  [6, 9],
  [5, 8],
  [4, 8],
  [3, 8],
  [2, 8],
  [1, 8],
  [0, 8],
  [0, 7],
  [0, 6],
]

export const PATH_LENGTH = PATH_COORDS.length
export const FINAL_STEP = 57
export const HOME_LANE_START_STEP = 52

export const START_INDEX = {
  red: 0,
  blue: 13,
  green: 26,
  yellow: 39,
}

export const SAFE_INDICES = [0, 8, 13, 21, 26, 34, 39, 47]

export const HOME_LANES = {
  red: [
    [1, 7],
    [2, 7],
    [3, 7],
    [4, 7],
    [5, 7],
  ],
  blue: [
    [7, 1],
    [7, 2],
    [7, 3],
    [7, 4],
    [7, 5],
  ],
  green: [
    [13, 7],
    [12, 7],
    [11, 7],
    [10, 7],
    [9, 7],
  ],
  yellow: [
    [7, 13],
    [7, 12],
    [7, 11],
    [7, 10],
    [7, 9],
  ],
}

export const BASE_SLOTS = {
  red: [
    [2.2, 2.2],
    [3.8, 2.2],
    [2.2, 3.8],
    [3.8, 3.8],
  ],
  blue: [
    [10.2, 2.2],
    [11.8, 2.2],
    [10.2, 3.8],
    [11.8, 3.8],
  ],
  green: [
    [10.2, 10.2],
    [11.8, 10.2],
    [10.2, 11.8],
    [11.8, 11.8],
  ],
  yellow: [
    [2.2, 10.2],
    [3.8, 10.2],
    [2.2, 11.8],
    [3.8, 11.8],
  ],
}

export const HOME_SLOTS = {
  red: [
    [6.55, 6.55],
    [7.45, 6.55],
    [6.55, 7.45],
    [7.45, 7.45],
  ],
  blue: [
    [6.55, 6.55],
    [7.45, 6.55],
    [6.55, 7.45],
    [7.45, 7.45],
  ],
  green: [
    [6.55, 6.55],
    [7.45, 6.55],
    [6.55, 7.45],
    [7.45, 7.45],
  ],
  yellow: [
    [6.55, 6.55],
    [7.45, 6.55],
    [6.55, 7.45],
    [7.45, 7.45],
  ],
}
