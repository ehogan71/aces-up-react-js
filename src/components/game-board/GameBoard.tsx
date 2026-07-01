import React from "react";
import { Pile } from "../pile/Pile";
import type { CardType, PlayableAction } from "../../core/types";
import "./game-board.css";

interface GameBoardProps {
  piles: CardType[][];
  playableActions: (PlayableAction | null)[];
  animateDeal: boolean;
  hidePlayableIndicators: boolean;
  discardingCard: CardType | null;
  discardingPileIndex: number | null;
  lastDealt: CardType[];
  onAnimationComplete?: () => void;
  onTopCardClick?: (
    pileIndex: number,
    card: CardType,
    element: HTMLElement,
    action: PlayableAction,
  ) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  piles,
  playableActions,
  animateDeal,
  hidePlayableIndicators,
  discardingCard,
  discardingPileIndex,
  lastDealt,
  onAnimationComplete,
  onTopCardClick,
}) => {
  return (
    <div className="game-board">
      {piles.map((pile, pileIndex) => (
        <div key={pileIndex} className="pile-slot">
          <Pile
            cards={pile}
            playableAction={playableActions[pileIndex] ?? null}
            animateDeal={animateDeal}
            hidePlayableIndicators={hidePlayableIndicators}
            discardingCard={discardingCard}
            discardingPileIndex={discardingPileIndex}
            lastDealt={lastDealt}
            onAnimationComplete={onAnimationComplete}
            onTopCardClick={onTopCardClick}
            pileIndex={pileIndex}
          />
        </div>
      ))}
    </div>
  );
};
