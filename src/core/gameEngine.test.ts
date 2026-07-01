import { describe, expect, it } from "vitest";
import {
  createDeck,
  dealCards,
  discardTopCard,
  getGameOutcome,
  getTopCardPlayableAction,
  relocateTopCard,
} from "./gameEngine";
import type { CardType, GameState } from "./types";

const card = (suit: CardType["suit"], rank: CardType["rank"]): CardType => ({
  suit,
  rank,
  faceUp: false,
});

const createState = (overrides?: Partial<GameState>): GameState => ({
  piles: [[], [], [], []],
  drawPile: [],
  discardPile: [],
  ...overrides,
});

describe("gameEngine", () => {
  it("createDeck builds a 52-card deck with unique suit/rank combos", () => {
    const deck = createDeck();
    expect(deck).toHaveLength(52);

    const unique = new Set(deck.map((c) => `${c.suit}-${c.rank}`));
    expect(unique.size).toBe(52);
  });

  it("dealCards returns unchanged state when draw pile has fewer than 4 cards", () => {
    const state = createState({
      drawPile: [card("H", 1), card("D", 2), card("C", 3)],
    });
    const result = dealCards(state);

    expect(result.newState).toBe(state);
    expect(result.dealtCards).toEqual([]);
  });

  it("dealCards pops from draw pile and places one card into each pile", () => {
    const drawPile = [card("H", 1), card("D", 2), card("C", 3), card("S", 4)];
    const state = createState({ drawPile });

    const { newState, dealtCards } = dealCards(state);

    expect(newState.drawPile).toHaveLength(0);
    expect(newState.piles[0]).toEqual([card("S", 4)]);
    expect(newState.piles[1]).toEqual([card("C", 3)]);
    expect(newState.piles[2]).toEqual([card("D", 2)]);
    expect(newState.piles[3]).toEqual([card("H", 1)]);
    expect(dealtCards).toEqual([
      card("S", 4),
      card("C", 3),
      card("D", 2),
      card("H", 1),
    ]);
  });

  it("discardTopCard returns unchanged state for empty source pile", () => {
    const state = createState({ piles: [[], [card("D", 5)], [], []] });

    const { newState, discardedCard } = discardTopCard(state, 0);

    expect(newState).toBe(state);
    expect(discardedCard).toBeNull();
  });

  it("discardTopCard moves top card to discard pile", () => {
    const state = createState({
      piles: [[card("H", 3), card("H", 8)], [], [], []],
      discardPile: [card("S", 13)],
    });

    const { newState, discardedCard } = discardTopCard(state, 0);

    expect(discardedCard).toEqual(card("H", 8));
    expect(newState.piles[0]).toEqual([card("H", 3)]);
    expect(newState.discardPile).toEqual([card("S", 13), card("H", 8)]);
  });

  it("relocateTopCard moves top card to leftmost empty pile", () => {
    const state = createState({
      piles: [[card("C", 10), card("C", 11)], [card("D", 7)], [], []],
    });

    const { newState, movedCard, targetStackIndex } = relocateTopCard(state, 0);

    expect(movedCard).toEqual(card("C", 11));
    expect(targetStackIndex).toBe(2);
    expect(newState.piles[0]).toEqual([card("C", 10)]);
    expect(newState.piles[2]).toEqual([card("C", 11)]);
  });

  it("relocateTopCard returns nulls when no target empty pile exists", () => {
    const state = createState({
      piles: [[card("C", 10)], [card("D", 7)], [card("H", 9)], [card("S", 2)]],
    });

    const { newState, movedCard, targetStackIndex } = relocateTopCard(state, 0);

    expect(newState).toBe(state);
    expect(movedCard).toBeNull();
    expect(targetStackIndex).toBeNull();
  });

  it("getTopCardPlayableAction prefers discard when higher matching suit exists", () => {
    const state = createState({
      piles: [[card("H", 10)], [card("H", 12)], [], []],
    });

    expect(getTopCardPlayableAction(state, 0)).toBe("discard");
  });

  it("getTopCardPlayableAction allows relocate when empty pile exists and source has more than one card", () => {
    const state = createState({
      piles: [
        [card("S", 3), card("D", 9)],
        [card("H", 11)],
        [],
        [card("C", 4)],
      ],
    });

    expect(getTopCardPlayableAction(state, 0)).toBe("relocate");
  });

  it("getTopCardPlayableAction returns null for single card with empty pile", () => {
    const state = createState({
      piles: [[card("S", 3)], [card("H", 11)], [], [card("C", 4)]],
    });

    expect(getTopCardPlayableAction(state, 0)).toBeNull();
  });

  it("getGameOutcome returns won when draw pile is empty and each pile has one ace", () => {
    const state = createState({
      piles: [[card("H", 1)], [card("D", 1)], [card("C", 1)], [card("S", 1)]],
      drawPile: [],
    });

    expect(getGameOutcome(state)).toBe("won");
  });

  it("getGameOutcome returns lost when no moves remain and not all piles are aces", () => {
    const state = createState({
      piles: [
        [card("H", 13)],
        [card("D", 12)],
        [card("C", 11)],
        [card("S", 10)],
      ],
      drawPile: [],
    });

    expect(getGameOutcome(state)).toBe("lost");
  });

  it("getGameOutcome returns null while moves remain or draw pile exists", () => {
    const withDraw = createState({
      piles: [
        [card("H", 13)],
        [card("D", 12)],
        [card("C", 11)],
        [card("S", 10)],
      ],
      drawPile: [card("H", 2)],
    });
    expect(getGameOutcome(withDraw)).toBeNull();

    const withMove = createState({
      piles: [[card("H", 10)], [card("H", 11)], [card("C", 4)], [card("S", 3)]],
      drawPile: [],
    });
    expect(getGameOutcome(withMove)).toBeNull();
  });
});
