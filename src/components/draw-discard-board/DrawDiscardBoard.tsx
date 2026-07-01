import React from "react";
import type { CardType } from "../../core/types";
import "./draw-discard-board.css";

interface DrawDiscardBoardProps {
  drawPile: CardType[];
  discardPile: CardType[];
  cardBackColor: "red" | "blue";
  showCardCounts: boolean;
  onDraw?: () => void;
  bottomButtonLabel: string;
  onBottomButtonClick?: () => void;
  bottomButtonDisabled?: boolean;
}

export const DrawDiscardBoard: React.FC<DrawDiscardBoardProps> = ({
  drawPile,
  discardPile,
  cardBackColor,
  showCardCounts,
  bottomButtonLabel,
  onBottomButtonClick,
  bottomButtonDisabled = false,
  onDraw,
}) => {
  const discardCount = discardPile.length;
  const cardBackClass =
    cardBackColor === "blue"
      ? "card-back card-back--blue"
      : "card-back card-back--red";

  return (
    <div className="draw-discard-board">
      <div id="draw-slot-origin" className="draw-slot" onClick={onDraw}>
        {drawPile.length > 0 ? (
          <>
            <div className={cardBackClass} />
            {showCardCounts && (
              <div className="card-count-badge">{drawPile.length}</div>
            )}
          </>
        ) : (
          <div className="empty-slot">Empty</div>
        )}
      </div>
      <div className="undo-slot">
        <button
          type="button"
          className="undo-button"
          onClick={onBottomButtonClick}
          disabled={bottomButtonDisabled}
        >
          {bottomButtonLabel}
        </button>
      </div>
      <div id="discard-slot-origin" className="discard-slot">
        {discardCount > 0 ? (
          <>
            <div className={cardBackClass} />
            {showCardCounts && (
              <div className="card-count-badge">{discardCount}</div>
            )}
          </>
        ) : (
          <div className="empty-slot">Empty</div>
        )}
      </div>
    </div>
  );
};
