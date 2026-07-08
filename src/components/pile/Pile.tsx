import React from "react";
import type { CardType, PlayableAction } from "../../core/types";
import { Card } from "../card/Card";
import "./pile.css";

interface PileProps {
  cards: CardType[];
  playableAction: PlayableAction | null;
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
  pileIndex: number;
}

export const Pile: React.FC<PileProps> = ({
  cards,
  playableAction,
  animateDeal,
  hidePlayableIndicators,
  discardingCard,
  discardingPileIndex,
  lastDealt,
  onAnimationComplete,
  onTopCardClick,
  pileIndex,
}) => {
  return (
    <div className="pile">
      {cards.map((card, index) => {
        const isTopCard = index === cards.length - 1;
        const shouldAnimate =
          animateDeal && isTopCard && lastDealt?.includes(card);
        const canPlay = isTopCard && playableAction !== null;
        const isDiscardingSourceTopCard =
          isTopCard &&
          discardingPileIndex === pileIndex &&
          discardingCard?.suit === card.suit &&
          discardingCard?.rank === card.rank;

        const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
          if (!canPlay || !playableAction) return;
          onTopCardClick?.(
            pileIndex,
            card,
            event.currentTarget,
            playableAction,
          );
        };

        return (
          <div
            key={`${card.suit}-${card.rank}-${index}`}
            className="pile-card"
            onClick={canPlay ? handleClick : undefined}
            style={{
              top: `calc(${index} * var(--pile-feather-offset))`,
              cursor: canPlay ? "pointer" : "default",
              opacity: isDiscardingSourceTopCard ? 0 : 1,
              pointerEvents: isDiscardingSourceTopCard ? "none" : "auto",
            }}
          >
            {!hidePlayableIndicators && isTopCard && playableAction && (
              <div
                className={`playable-indicator playable-indicator--${playableAction}`}
                aria-label={`${playableAction} available`}
                title={playableAction}
              />
            )}
            <Card
              card={card}
              animateFromDraw={shouldAnimate}
              onAnimationComplete={onAnimationComplete}
            />
          </div>
        );
      })}
    </div>
  );
};
