import { PlayerColor, Token, Player } from '../types/ludo';
import {
  COLOR_START_INDEX,
  SAFE_TRACK_INDICES,
  isSafePosition,
  isSameTeam,
} from './ludoConstants';

export function getMovableTokenIds(tokens: Token[], dice: number): number[] {
  const movable: number[] = [];
  tokens.forEach((token) => {
    // If in yard, only 6 can bring it out
    if (token.step === -1) {
      if (dice === 6) {
        movable.push(token.id);
      }
      return;
    }
    // Already in home goal
    if (token.step === 56) {
      return;
    }
    // Check if new step would exceed 56
    if (token.step + dice <= 56) {
      movable.push(token.id);
    }
  });
  return movable;
}

export function pickBestBotMove(
  botColor: PlayerColor,
  tokens: Token[],
  dice: number,
  allPlayers: Player[],
  isTeamMode?: boolean
): number | null {
  const movableIds = getMovableTokenIds(tokens, dice);
  if (movableIds.length === 0) return null;
  if (movableIds.length === 1) return movableIds[0];

  let bestTokenId = movableIds[0];
  let highestScore = -Infinity;

  movableIds.forEach((tokenId) => {
    const token = tokens.find((t) => t.id === tokenId)!;
    let score = 0;

    // Moving out of base
    if (token.step === -1) {
      // Count how many tokens are already active on the board
      const activeCount = tokens.filter((t) => t.step >= 0 && t.step < 56).length;
      if (activeCount === 0) {
        score += 350; // High priority to get first token out
      } else if (activeCount === 1) {
        score += 260;
      } else {
        score += 150;
      }
    } else {
      const nextStep = token.step + dice;

      // 1. Reaching home
      if (nextStep === 56) {
        score += 1000;
      }

      // 2. Entering safe home stretch
      if (token.step <= 50 && nextStep > 50) {
        score += 300;
      }

      // 3. Landing on safe square
      if (isSafePosition(botColor, nextStep)) {
        score += 120;
      }

      // 4. Knocking out an opponent's token
      if (nextStep <= 50) {
        const targetTrackIdx = (COLOR_START_INDEX[botColor] + nextStep) % 52;
        const isTargetSafe = SAFE_TRACK_INDICES.includes(targetTrackIdx);

        if (!isTargetSafe) {
          // Check if opposing team forms an immune fortress (2+ tokens on the cell)
          let oppTokensOnCell = 0;
          if (isTeamMode) {
            allPlayers.forEach((opp) => {
              if (opp.color === botColor || isSameTeam(botColor, opp.color)) return;
              opp.tokens.forEach((t) => {
                if (t.step >= 0 && t.step <= 50) {
                  const oppIdx = (COLOR_START_INDEX[opp.color] + t.step) % 52;
                  if (oppIdx === targetTrackIdx) oppTokensOnCell++;
                }
              });
            });
          }

          if (!isTeamMode || oppTokensOnCell < 2) {
            allPlayers.forEach((opp) => {
              if (opp.color === botColor) return;
              if (isTeamMode && isSameTeam(botColor, opp.color)) return; // Friendly teammate: don't capture

              opp.tokens.forEach((oppToken) => {
                if (oppToken.step >= 0 && oppToken.step <= 50) {
                  const oppTrackIdx = (COLOR_START_INDEX[opp.color] + oppToken.step) % 52;
                  if (oppTrackIdx === targetTrackIdx) {
                    score += 650; // Huge capture bonus!
                  }
                }
              });
            });
          }
        }
      }

      // 5. Threat evasion: check if currently in danger from opponent behind
      if (token.step <= 50) {
        const currentTrackIdx = (COLOR_START_INDEX[botColor] + token.step) % 52;
        if (!SAFE_TRACK_INDICES.includes(currentTrackIdx)) {
          allPlayers.forEach((opp) => {
            if (opp.color === botColor) return;
            if (isTeamMode && isSameTeam(botColor, opp.color)) return; // Friendly teammate behind: no threat

            opp.tokens.forEach((oppToken) => {
              if (oppToken.step >= 0 && oppToken.step <= 50) {
                const oppTrackIdx = (COLOR_START_INDEX[opp.color] + oppToken.step) % 52;
                const distBehind = (currentTrackIdx - oppTrackIdx + 52) % 52;
                if (distBehind >= 1 && distBehind <= 6) {
                  score += 180; // Escape threat
                }
              }
            });
          });
        }
      }

      // 6. Natural advancement preference towards finish
      score += token.step * 2;
    }

    if (score > highestScore) {
      highestScore = score;
      bestTokenId = tokenId;
    }
  });

  return bestTokenId;
}
