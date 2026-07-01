import React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CardType } from "../../core/types";
import "./card.css";

interface CardProps {
  card: CardType;
  animateFromDraw?: boolean;
  onAnimationComplete?: () => void;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  card,
  animateFromDraw = false,
  onAnimationComplete,
  style,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [dealOffset, setDealOffset] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [isDealAnimationReady, setIsDealAnimationReady] = useState(false);
  const { suit, rank } = card;

  const imagePath = `/cards/${suit}-${rank}.png`;

  useLayoutEffect(() => {
    if (!animateFromDraw) {
      setDealOffset(null);
      setIsDealAnimationReady(false);
      return;
    }

    const drawSlot = document.getElementById("draw-slot-origin");
    const cardElement = cardRef.current;

    if (!(drawSlot instanceof HTMLElement) || !cardElement) {
      setDealOffset(null);
      setIsDealAnimationReady(true);
      return;
    }

    const drawRect = drawSlot.getBoundingClientRect();
    const cardRect = cardElement.getBoundingClientRect();

    // Offset from the draw pile center to this card's center.
    const x =
      drawRect.left + drawRect.width / 2 - (cardRect.left + cardRect.width / 2);
    const y =
      drawRect.top + drawRect.height / 2 - (cardRect.top + cardRect.height / 2);

    setDealOffset({ x, y });
    setIsDealAnimationReady(true);
  }, [animateFromDraw, suit, rank]);

  useEffect(() => {
    if (animateFromDraw) {
      const timer = setTimeout(() => {
        onAnimationComplete?.();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [animateFromDraw]);

  return (
    <div
      ref={cardRef}
      className={`card ${animateFromDraw && isDealAnimationReady ? "deal-animation" : ""}`}
      style={
        {
          ...(dealOffset
            ? {
                "--deal-from-x": `${dealOffset.x}px`,
                "--deal-from-y": `${dealOffset.y}px`,
              }
            : {}),
          ...style,
        } as React.CSSProperties
      }
    >
      <img
        src={imagePath}
        alt={`${rank} of ${suit}`}
        className="card-image"
        draggable={false}
      />
    </div>
  );
};
