import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DrawDiscardBoard } from "./DrawDiscardBoard";
import type { CardType } from "../../core/types";

const card = (suit: CardType["suit"], rank: CardType["rank"]): CardType => ({
  suit,
  rank,
});

describe("DrawDiscardBoard", () => {
  it("renders empty labels when draw and discard piles are empty", () => {
    render(
      <DrawDiscardBoard
        drawPile={[]}
        discardPile={[]}
        cardBackColor="red"
        showCardCounts={true}
        bottomButtonLabel="Undo"
      />,
    );

    expect(screen.getAllByText("Empty")).toHaveLength(2);
  });

  it("renders red card backs and card counts", () => {
    render(
      <DrawDiscardBoard
        drawPile={[card("H", 1), card("D", 2)]}
        discardPile={[card("S", 7)]}
        cardBackColor="red"
        showCardCounts={true}
        bottomButtonLabel="Undo"
      />,
    );

    const cardBacks = document.querySelectorAll(".card-back--red");
    expect(cardBacks).toHaveLength(2);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders blue card backs and hides counts when disabled", () => {
    render(
      <DrawDiscardBoard
        drawPile={[card("H", 1)]}
        discardPile={[card("S", 7)]}
        cardBackColor="blue"
        showCardCounts={false}
        bottomButtonLabel="Undo"
      />,
    );

    const cardBacks = document.querySelectorAll(".card-back--blue");
    expect(cardBacks).toHaveLength(2);
    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });

  it("calls callbacks for draw and bottom action", () => {
    const onDraw = vi.fn();
    const onBottomButtonClick = vi.fn();

    render(
      <DrawDiscardBoard
        drawPile={[card("H", 1)]}
        discardPile={[]}
        cardBackColor="red"
        showCardCounts={true}
        bottomButtonLabel="Undo"
        onDraw={onDraw}
        onBottomButtonClick={onBottomButtonClick}
      />,
    );

    fireEvent.click(document.getElementById("draw-slot-origin") as HTMLElement);
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));

    expect(onDraw).toHaveBeenCalledTimes(1);
    expect(onBottomButtonClick).toHaveBeenCalledTimes(1);
  });

  it("respects bottom button disabled state", () => {
    render(
      <DrawDiscardBoard
        drawPile={[card("H", 1)]}
        discardPile={[]}
        cardBackColor="red"
        showCardCounts={true}
        bottomButtonLabel="Undo"
        bottomButtonDisabled={true}
      />,
    );

    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();
  });
});
