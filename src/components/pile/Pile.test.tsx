import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Pile } from "./Pile";
import type { CardType } from "../../core/types";

const cardSpy = vi.fn(
  (props: { card: CardType; animateFromDraw?: boolean }) => (
    <div
      data-testid={`card-${props.card.suit}-${props.card.rank}`}
      data-animate={props.animateFromDraw ? "yes" : "no"}
    />
  ),
);

vi.mock("../card/Card", () => ({
  Card: (props: { card: CardType; animateFromDraw?: boolean }) =>
    cardSpy(props),
}));

const c = (suit: CardType["suit"], rank: CardType["rank"]): CardType => ({
  suit,
  rank,
});

describe("Pile", () => {
  it("renders cards and allows clicking the top card when playable", () => {
    const onTopCardClick = vi.fn();

    render(
      <Pile
        cards={[c("H", 5), c("S", 9)]}
        playableAction="discard"
        animateDeal={false}
        hidePlayableIndicators={false}
        discardingCard={null}
        discardingPileIndex={null}
        lastDealt={[]}
        pileIndex={2}
        onTopCardClick={onTopCardClick}
      />,
    );

    const pileCards = document.querySelectorAll(".pile-card");
    fireEvent.click(pileCards[1]);

    expect(onTopCardClick).toHaveBeenCalledTimes(1);
    const [pileIndex, topCard, element, action] = onTopCardClick.mock.calls[0];
    expect(pileIndex).toBe(2);
    expect(topCard).toEqual(c("S", 9));
    expect(element).toBeInstanceOf(HTMLElement);
    expect(action).toBe("discard");
  });

  it("does not allow clicking non-top cards", () => {
    const onTopCardClick = vi.fn();

    render(
      <Pile
        cards={[c("H", 5), c("S", 9)]}
        playableAction="discard"
        animateDeal={false}
        hidePlayableIndicators={false}
        discardingCard={null}
        discardingPileIndex={null}
        lastDealt={[]}
        pileIndex={0}
        onTopCardClick={onTopCardClick}
      />,
    );

    const pileCards = document.querySelectorAll(".pile-card");
    fireEvent.click(pileCards[0]);

    expect(onTopCardClick).not.toHaveBeenCalled();
  });

  it("hides playable indicator when hidePlayableIndicators is true", () => {
    render(
      <Pile
        cards={[c("D", 10)]}
        playableAction="relocate"
        animateDeal={false}
        hidePlayableIndicators={true}
        discardingCard={null}
        discardingPileIndex={null}
        lastDealt={[]}
        pileIndex={1}
      />,
    );

    expect(
      screen.queryByLabelText("relocate available"),
    ).not.toBeInTheDocument();
  });

  it("hides the source top card while discard animation is active", () => {
    render(
      <Pile
        cards={[c("D", 10), c("D", 11)]}
        playableAction={null}
        animateDeal={false}
        hidePlayableIndicators={false}
        discardingCard={c("D", 11)}
        discardingPileIndex={3}
        lastDealt={[]}
        pileIndex={3}
      />,
    );

    const pileCards = document.querySelectorAll(".pile-card");
    expect(pileCards[1]).toHaveStyle({ opacity: "0", pointerEvents: "none" });
  });

  it("marks top dealt card for draw animation only when included in lastDealt", () => {
    render(
      <Pile
        cards={[c("C", 2), c("H", 4)]}
        playableAction={null}
        animateDeal={true}
        hidePlayableIndicators={false}
        discardingCard={null}
        discardingPileIndex={null}
        lastDealt={[c("H", 4)]}
        pileIndex={0}
      />,
    );

    expect(screen.getByTestId("card-C-2")).toHaveAttribute(
      "data-animate",
      "no",
    );
    expect(screen.getByTestId("card-H-4")).toHaveAttribute(
      "data-animate",
      "no",
    );
  });

  it("animates top card when the same card reference exists in lastDealt", () => {
    const top = c("H", 4);
    render(
      <Pile
        cards={[c("C", 2), top]}
        playableAction={null}
        animateDeal={true}
        hidePlayableIndicators={false}
        discardingCard={null}
        discardingPileIndex={null}
        lastDealt={[top]}
        pileIndex={0}
      />,
    );

    expect(screen.getByTestId("card-H-4")).toHaveAttribute(
      "data-animate",
      "yes",
    );
  });
});
