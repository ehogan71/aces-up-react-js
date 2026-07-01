import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "./App";
import type { CardType, GameState } from "./core/types";

vi.mock("react-icons/io5", () => ({
  IoSettingsOutline: () => <span data-testid="settings-icon" />,
}));

vi.mock("./components/casino-table/CasinoTable", () => ({
  CasinoTable: ({ children }: { children: React.ReactNode }) => (
    <div id="casino-felt">{children}</div>
  ),
}));

vi.mock("./components/draw-discard-board/DrawDiscardBoard", () => ({
  DrawDiscardBoard: ({
    drawPile,
    discardPile,
    cardBackColor,
    bottomButtonLabel,
    bottomButtonDisabled,
    onBottomButtonClick,
    onDraw,
  }: {
    drawPile: CardType[];
    discardPile: CardType[];
    cardBackColor: "red" | "blue";
    bottomButtonLabel: string;
    bottomButtonDisabled?: boolean;
    onBottomButtonClick?: () => void;
    onDraw?: () => void;
  }) => {
    const discardSlot = document.createElement("div");
    discardSlot.id = "discard-slot-origin";
    if (!document.getElementById("discard-slot-origin")) {
      document.body.appendChild(discardSlot);
    }

    return (
      <div>
        <button type="button" onClick={onDraw}>
          Draw {drawPile.length}
        </button>
        <button
          type="button"
          onClick={onBottomButtonClick}
          disabled={bottomButtonDisabled}
        >
          {bottomButtonLabel}
        </button>
        <div data-testid="discard-count">{discardPile.length}</div>
        <div data-testid="card-back-color">{cardBackColor}</div>
      </div>
    );
  },
}));

vi.mock("./components/settings-dialog/SettingsDialog", () => ({
  SettingsDialog: ({
    onDone,
    onTogglePlayableIndicators,
    onToggleCardCounts,
    onSelectCardBackColor,
  }: {
    onDone: () => void;
    onTogglePlayableIndicators: () => void;
    onToggleCardCounts: () => void;
    onSelectCardBackColor: (color: "red" | "blue") => void;
  }) => (
    <div>
      <div id="settings-stats" />
      <button type="button" onClick={onDone}>
        Done
      </button>
      <button type="button" onClick={onTogglePlayableIndicators}>
        Toggle Indicators
      </button>
      <button type="button" onClick={onToggleCardCounts}>
        Toggle Counts
      </button>
      <button type="button" onClick={() => onSelectCardBackColor("blue")}>
        Select Blue
      </button>
    </div>
  ),
}));

vi.mock("./components/game-statistics/GameStatistics", () => ({
  GameStatistics: ({ portalTargetId }: { portalTargetId: string }) => (
    <div data-testid="stats-props">{portalTargetId}</div>
  ),
}));

vi.mock("./components/game-board/GameBoard", () => ({
  GameBoard: ({
    piles,
    onAnimationComplete,
    onTopCardClick,
  }: {
    piles: CardType[][];
    onAnimationComplete?: () => void;
    onTopCardClick?: (
      pileIndex: number,
      card: CardType,
      element: HTMLElement,
      action: "discard" | "relocate",
    ) => void;
  }) => (
    <div>
      <button type="button" onClick={onAnimationComplete}>
        Finish Deal Animation
      </button>
      <button
        type="button"
        onClick={() => {
          const top = piles[0][piles[0].length - 1];
          if (!top || !onTopCardClick) {
            return;
          }

          const source = document.createElement("div");
          source.getBoundingClientRect = () =>
            ({ left: 20, top: 20, width: 60, height: 90 }) as DOMRect;

          onTopCardClick(0, top, source, "discard");
        }}
      >
        Trigger Discard
      </button>
    </div>
  ),
}));

vi.mock("./core/gameEngine", () => ({
  createDeck: vi.fn(() => [
    { suit: "H", rank: 1, faceUp: false },
    { suit: "D", rank: 2, faceUp: false },
  ]),
  dealCards: vi.fn((state: GameState) => {
    if (state.drawPile.length === 0) {
      return { newState: state, dealtCards: [] };
    }

    const nextDrawPile = state.drawPile.slice(0, -1);
    const dealt = state.drawPile[state.drawPile.length - 1];
    const piles = state.piles.map((pile) => [...pile]);
    piles[0].push(dealt);

    return {
      newState: {
        ...state,
        drawPile: nextDrawPile,
        piles,
      },
      dealtCards: [dealt],
    };
  }),
  discardTopCard: vi.fn((state: GameState, stackIndex: number) => {
    const source = state.piles[stackIndex];
    if (!source.length) {
      return { newState: state, discardedCard: null };
    }

    const discardedCard = source[source.length - 1];
    const newPiles = state.piles.map((pile, i) =>
      i === stackIndex ? pile.slice(0, -1) : [...pile],
    );

    return {
      newState: {
        ...state,
        piles: newPiles,
        discardPile: [...state.discardPile, discardedCard],
      },
      discardedCard,
    };
  }),
  relocateTopCard: vi.fn((state: GameState, stackIndex: number) => {
    const movedCard =
      state.piles[stackIndex][state.piles[stackIndex].length - 1];
    return {
      newState: state,
      movedCard: movedCard ?? null,
      targetStackIndex: movedCard ? 1 : null,
    };
  }),
  getTopCardPlayableAction: vi.fn((state: GameState, stackIndex: number) =>
    stackIndex === 0 && state.piles[0].length > 0 ? "discard" : null,
  ),
  getGameOutcome: vi.fn((state: GameState) =>
    state.drawPile.length === 0 ? "lost" : null,
  ),
}));

describe("App", () => {
  it("opens settings and persists card back choice", async () => {
    window.localStorage.clear();

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Open settings" }));
    fireEvent.click(screen.getByRole("button", { name: "Select Blue" }));

    await waitFor(() => {
      expect(screen.getByTestId("card-back-color")).toHaveTextContent("blue");
    });

    const stored = JSON.parse(
      window.localStorage.getItem("aces-up-game-settings") ?? "{}",
    );
    expect(stored.cardBackColor).toBe("blue");
  });

  it("deals cards, supports undo, and shows game-over when draw pile is empty", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Draw 2" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Finish Deal Animation" }),
    );
    expect(screen.getByRole("button", { name: "Draw 1" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByRole("button", { name: "Draw 2" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Draw 2" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Finish Deal Animation" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Draw 1" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Finish Deal Animation" }),
    );

    await waitFor(() => {
      expect(screen.getByText("Sorry, try again")).toBeInTheDocument();
    });
  });

  it("runs discard animation flow and commits pending discard state on transition end", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Draw 2" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Finish Deal Animation" }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Trigger Discard" }));

    const flying = document.querySelector(".discard-animation-card");
    expect(flying).toBeInTheDocument();

    fireEvent.transitionEnd(flying as Element, { propertyName: "opacity" });

    await waitFor(() => {
      expect(screen.getByTestId("discard-count")).toHaveTextContent("1");
    });
  });
});
