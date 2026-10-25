import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

interface ServerToken {
  id: number;
  color: PlayerColor;
  step: number;
}

interface RoomPlayer {
  id: string;
  name: string;
  color: PlayerColor;
  isReady: boolean;
  isConnected: boolean;
  ws?: WebSocket;
}

interface ServerRoom {
  roomId: string;
  hostId: string;
  maxPlayers: 2 | 3 | 4;
  isTeamMode?: boolean;
  players: Record<string, RoomPlayer>;
  status: 'waiting' | 'in_game' | 'finished';
  currentTurnColor: PlayerColor;
  turnOrder: PlayerColor[];
  diceValue: number | null;
  hasRolled: boolean;
  consecutiveSixes: number;
  movableTokenIds: number[];
  tokens: Record<PlayerColor, ServerToken[]>;
  winners: PlayerColor[];
  turnDeadline: number;
}

const COLOR_START_INDEX: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

const SAFE_TRACK_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];

function isSameTeam(c1: PlayerColor, c2: PlayerColor): boolean {
  const getTeam = (c: PlayerColor) => (c === 'red' || c === 'yellow' ? 1 : 2);
  return getTeam(c1) === getTeam(c2);
}

const rooms = new Map<string, ServerRoom>();

function createInitialTokens(): Record<PlayerColor, ServerToken[]> {
  const colors: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];
  const map = {} as Record<PlayerColor, ServerToken[]>;
  colors.forEach((c) => {
    map[c] = [0, 1, 2, 3].map((id) => ({ id, color: c, step: -1 }));
  });
  return map;
}

function broadcastToRoom(roomId: string, message: object) {
  const room = rooms.get(roomId);
  if (!room) return;
  const payload = JSON.stringify(message);
  Object.values(room.players).forEach((p) => {
    if (p.ws && p.ws.readyState === WebSocket.OPEN) {
      p.ws.send(payload);
    }
  });
}

function sanitizeRoom(room: ServerRoom) {
  const sanitizedPlayers: Record<string, Omit<RoomPlayer, 'ws'>> = {};
  Object.entries(room.players).forEach(([k, v]) => {
    sanitizedPlayers[k] = {
      id: v.id,
      name: v.name,
      color: v.color,
      isReady: v.isReady,
      isConnected: v.isConnected,
    };
  });

  return {
    roomId: room.roomId,
    hostId: room.hostId,
    maxPlayers: room.maxPlayers,
    isTeamMode: room.isTeamMode,
    players: sanitizedPlayers,
    status: room.status,
    currentTurnColor: room.currentTurnColor,
    turnOrder: room.turnOrder,
    diceValue: room.diceValue,
    hasRolled: room.hasRolled,
    consecutiveSixes: room.consecutiveSixes,
    movableTokenIds: room.movableTokenIds,
    tokens: room.tokens,
    winners: room.winners,
    turnDeadline: room.turnDeadline,
  };
}

function getMovableTokens(tokens: ServerToken[], dice: number): number[] {
  const movable: number[] = [];
  tokens.forEach((t) => {
    if (t.step === -1) {
      if (dice === 6) movable.push(t.id);
    } else if (t.step < 56 && t.step + dice <= 56) {
      movable.push(t.id);
    }
  });
  return movable;
}

function advanceTurn(room: ServerRoom) {
  room.diceValue = null;
  room.hasRolled = false;
  room.consecutiveSixes = 0;
  room.movableTokenIds = [];

  // Find next active player in turnOrder who hasn't already won all 4 tokens
  const currentIdx = room.turnOrder.indexOf(room.currentTurnColor);
  let nextIdx = (currentIdx + 1) % room.turnOrder.length;
  let attempts = 0;

  while (attempts < room.turnOrder.length) {
    const candidateColor = room.turnOrder[nextIdx];
    if (!room.winners.includes(candidateColor)) {
      room.currentTurnColor = candidateColor;
      room.turnDeadline = Date.now() + 30000;
      return;
    }
    nextIdx = (nextIdx + 1) % room.turnOrder.length;
    attempts++;
  }

  // All finished
  room.status = 'finished';
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', activeRooms: rooms.size, timestamp: Date.now() });
  });

  wss.on('connection', (ws) => {
    let currentRoomId: string | null = null;
    let currentPlayerId: string | null = null;

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());

        switch (msg.type) {
          case 'create_room': {
            const { roomId, playerId, playerName, maxPlayers, preferredColor, isTeamMode } = msg;
            currentRoomId = roomId;
            currentPlayerId = playerId;

            const room: ServerRoom = {
              roomId,
              hostId: playerId,
              maxPlayers: maxPlayers || 4,
              isTeamMode: isTeamMode ?? (maxPlayers === 4),
              players: {
                [playerId]: {
                  id: playerId,
                  name: playerName || 'Player 1',
                  color: preferredColor || 'red',
                  isReady: true,
                  isConnected: true,
                  ws,
                },
              },
              status: 'waiting',
              currentTurnColor: preferredColor || 'red',
              turnOrder: [preferredColor || 'red'],
              diceValue: null,
              hasRolled: false,
              consecutiveSixes: 0,
              movableTokenIds: [],
              tokens: createInitialTokens(),
              winners: [],
              turnDeadline: 0,
            };

            rooms.set(roomId, room);
            ws.send(JSON.stringify({ type: 'room_state', room: sanitizeRoom(room) }));
            break;
          }

          case 'join_room': {
            const { roomId, playerId, playerName, preferredColor } = msg;
            const room = rooms.get(roomId);
            if (!room) {
              ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
              return;
            }

            currentRoomId = roomId;
            currentPlayerId = playerId;

            // Reconnecting player
            if (room.players[playerId]) {
              room.players[playerId].isConnected = true;
              room.players[playerId].ws = ws;
              if (playerName) room.players[playerId].name = playerName;
              broadcastToRoom(roomId, { type: 'room_state', room: sanitizeRoom(room) });
              return;
            }

            if (Object.keys(room.players).length >= room.maxPlayers) {
              ws.send(JSON.stringify({ type: 'error', message: 'Room is full' }));
              return;
            }

            // Assign unique color
            const usedColors = Object.values(room.players).map((p) => p.color);
            const allColors: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];
            let color = preferredColor && !usedColors.includes(preferredColor)
              ? preferredColor
              : allColors.find((c) => !usedColors.includes(c)) || 'red';

            room.players[playerId] = {
              id: playerId,
              name: playerName || `Player ${Object.keys(room.players).length + 1}`,
              color,
              isReady: false,
              isConnected: true,
              ws,
            };

            broadcastToRoom(roomId, { type: 'room_state', room: sanitizeRoom(room) });
            break;
          }

          case 'set_color': {
            if (!currentRoomId || !currentPlayerId) return;
            const room = rooms.get(currentRoomId);
            if (!room || room.status !== 'waiting') return;

            const { color } = msg;
            const usedColors = Object.entries(room.players)
              .filter(([id]) => id !== currentPlayerId)
              .map(([, p]) => p.color);

            if (!usedColors.includes(color)) {
              room.players[currentPlayerId].color = color;
              broadcastToRoom(currentRoomId, { type: 'room_state', room: sanitizeRoom(room) });
            }
            break;
          }

          case 'start_game': {
            if (!currentRoomId || !currentPlayerId) return;
            const room = rooms.get(currentRoomId);
            if (!room || room.hostId !== currentPlayerId) return;

            // Configure turn order
            const colors = Object.values(room.players).map((p) => p.color);
            const standardOrder: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];
            room.turnOrder = standardOrder.filter((c) => colors.includes(c));
            if (room.turnOrder.length === 0) room.turnOrder = colors;

            room.status = 'in_game';
            room.currentTurnColor = room.turnOrder[0];
            room.tokens = createInitialTokens();
            room.winners = [];
            room.hasRolled = false;
            room.diceValue = null;
            room.consecutiveSixes = 0;
            room.movableTokenIds = [];
            room.turnDeadline = Date.now() + 30000;

            broadcastToRoom(currentRoomId, {
              type: 'game_started',
              room: sanitizeRoom(room),
            });
            break;
          }

          case 'roll_dice': {
            if (!currentRoomId || !currentPlayerId) return;
            const room = rooms.get(currentRoomId);
            if (!room || room.status !== 'in_game') return;

            const player = room.players[currentPlayerId];
            if (!player || player.color !== room.currentTurnColor) return;
            if (room.hasRolled) return;

            // Roll 1 to 6
            const dice = Math.floor(Math.random() * 6) + 1;
            room.diceValue = dice;
            room.hasRolled = true;

            if (dice === 6) {
              room.consecutiveSixes++;
            } else {
              room.consecutiveSixes = 0;
            }

            // Check 3 consecutive sixes rule
            if (room.consecutiveSixes === 3) {
              broadcastToRoom(currentRoomId, {
                type: 'consecutive_sixes_forfeit',
                playerColor: room.currentTurnColor,
                dice,
              });
              advanceTurn(room);
              broadcastToRoom(currentRoomId, { type: 'room_state', room: sanitizeRoom(room) });
              return;
            }

            const currentTokens = room.tokens[room.currentTurnColor];
            const movableIds = getMovableTokens(currentTokens, dice);
            room.movableTokenIds = movableIds;

            broadcastToRoom(currentRoomId, {
              type: 'dice_rolled',
              dice,
              color: room.currentTurnColor,
              movableTokenIds: movableIds,
              consecutiveSixes: room.consecutiveSixes,
              room: sanitizeRoom(room),
            });

            // If no movable tokens, advance turn after short delay
            if (movableIds.length === 0) {
              setTimeout(() => {
                const currentRoom = rooms.get(currentRoomId!);
                if (currentRoom && currentRoom.hasRolled && currentRoom.movableTokenIds.length === 0) {
                  advanceTurn(currentRoom);
                  broadcastToRoom(currentRoomId!, { type: 'room_state', room: sanitizeRoom(currentRoom) });
                }
              }, 1200);
            }
            break;
          }

          case 'move_token': {
            if (!currentRoomId || !currentPlayerId) return;
            const room = rooms.get(currentRoomId);
            if (!room || room.status !== 'in_game') return;

            const player = room.players[currentPlayerId];
            if (!player || player.color !== room.currentTurnColor) return;
            if (!room.hasRolled || room.diceValue === null) return;

            const { tokenId } = msg;
            if (!room.movableTokenIds.includes(tokenId)) return;

            const color = room.currentTurnColor;
            const dice = room.diceValue;
            const token = room.tokens[color].find((t) => t.id === tokenId);
            if (!token) return;

            let capturedInfo: { color: PlayerColor; tokenId: number } | null = null;
            let reachedHome = false;

            if (token.step === -1) {
              token.step = 0; // Brought out to start square
            } else {
              token.step += dice;
              if (token.step === 56) {
                reachedHome = true;
              }
            }

            // Check for capture if on perimeter track (step 0..50)
            if (token.step >= 0 && token.step <= 50) {
              const myTrackIdx = (COLOR_START_INDEX[color] + token.step) % 52;
              const isSafe = SAFE_TRACK_INDICES.includes(myTrackIdx);

              if (!isSafe) {
                // Check all opponent tokens
                Object.entries(room.tokens).forEach(([oppColorStr, oppTokens]) => {
                  const oppColor = oppColorStr as PlayerColor;
                  if (oppColor === color) return;
                  if (room.isTeamMode && isSameTeam(oppColor, color)) return; // Friendly teammate: safe!

                  oppTokens.forEach((oppToken) => {
                    if (oppToken.step >= 0 && oppToken.step <= 50) {
                      const oppTrackIdx = (COLOR_START_INDEX[oppColor] + oppToken.step) % 52;
                      if (oppTrackIdx === myTrackIdx) {
                        // Capture!
                        oppToken.step = -1;
                        capturedInfo = { color: oppColor, tokenId: oppToken.id };
                      }
                    }
                  });
                });
              }
            }

            // Check win condition for this player
            const allHome = room.tokens[color].every((t) => t.step === 56);
            if (allHome && !room.winners.includes(color)) {
              room.winners.push(color);
            }

            // Check bonus roll: rolled a 6, captured an opponent, or reached home!
            const getsBonusRoll = (dice === 6 || capturedInfo !== null || reachedHome) && !room.winners.includes(color);

            broadcastToRoom(currentRoomId, {
              type: 'token_moved',
              color,
              tokenId,
              newStep: token.step,
              dice,
              capturedInfo,
              reachedHome,
              getsBonusRoll,
              room: sanitizeRoom(room),
            });

            if (getsBonusRoll) {
              room.diceValue = null;
              room.hasRolled = false;
              room.movableTokenIds = [];
              room.turnDeadline = Date.now() + 30000;
              broadcastToRoom(currentRoomId, { type: 'room_state', room: sanitizeRoom(room) });
            } else {
              advanceTurn(room);
              broadcastToRoom(currentRoomId, { type: 'room_state', room: sanitizeRoom(room) });
            }
            break;
          }

          case 'quick_reaction': {
            if (!currentRoomId) return;
            const { text, emoji, senderName, senderColor } = msg;
            broadcastToRoom(currentRoomId, {
              type: 'reaction_received',
              reaction: {
                id: Math.random().toString(36).substring(2, 9),
                senderName,
                senderColor,
                text,
                emoji,
                timestamp: Date.now(),
              },
            });
            break;
          }

          case 'rematch': {
            if (!currentRoomId || !currentPlayerId) return;
            const room = rooms.get(currentRoomId);
            if (!room) return;

            room.status = 'in_game';
            room.tokens = createInitialTokens();
            room.winners = [];
            room.hasRolled = false;
            room.diceValue = null;
            room.consecutiveSixes = 0;
            room.movableTokenIds = [];
            room.currentTurnColor = room.turnOrder[0];
            room.turnDeadline = Date.now() + 30000;

            broadcastToRoom(currentRoomId, { type: 'game_started', room: sanitizeRoom(room) });
            break;
          }
        }
      } catch (err) {
        console.error('Error handling WS message:', err);
      }
    });

    ws.on('close', () => {
      if (currentRoomId && currentPlayerId) {
        const room = rooms.get(currentRoomId);
        if (room && room.players[currentPlayerId]) {
          room.players[currentPlayerId].isConnected = false;
          broadcastToRoom(currentRoomId, { type: 'room_state', room: sanitizeRoom(room) });
        }
      }
    });
  });

  // Attach Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Ludo Master Pro server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
