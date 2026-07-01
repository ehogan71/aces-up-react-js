import type {
  GameState,
  CardType,
  Suit,
  Rank,
  PlayableAction,
  GameOutcome,
} from "./types";

const suits: Suit[] = ["H", "D", "C", "S"];
const ranks: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

export function createDeck(): CardType[] {
  const deck: CardType[] = [];
  // Build the deck
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank, faceUp: false });
    }
  }

  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

export function dealCards(state: GameState): {
  newState: GameState;
  dealtCards: CardType[];
} {
  if (state.drawPile.length < 4) {
    return { newState: state, dealtCards: [] };
  }

  const newDraw = [...state.drawPile];
  const newPiles = state.piles.map((pile) => [...pile]);
  const dealtCards: CardType[] = [];

  for (let i = 0; i < 4; i++) {
    const card = newDraw.pop();
    if (card) {
      newPiles[i].push(card);
      dealtCards.push(card);
    }
  }

  const newState: GameState = {
    ...state,
    drawPile: newDraw,
    piles: newPiles,
  };

  return { newState, dealtCards };
}

export function discardTopCard(
  state: GameState,
  stackIndex: number,
): {
  newState: GameState;
  discardedCard: CardType | null;
} {
  const stack = state.piles[stackIndex];
  if (!stack.length) {
    return { newState: state, discardedCard: null };
  }

  const discardedCard = stack[stack.length - 1];
  const newPiles = state.piles.map((pile, index) =>
    index === stackIndex ? pile.slice(0, -1) : [...pile],
  );

  const newState: GameState = {
    ...state,
    piles: newPiles,
    discardPile: [...state.discardPile, discardedCard],
  };

  return { newState, discardedCard };
}

export function relocateTopCard(
  state: GameState,
  stackIndex: number,
): {
  newState: GameState;
  movedCard: CardType | null;
  targetStackIndex: number | null;
} {
  const sourceStack = state.piles[stackIndex];
  if (!sourceStack.length) {
    return { newState: state, movedCard: null, targetStackIndex: null };
  }

  const targetStackIndex = state.piles.findIndex(
    (stack, index) => index !== stackIndex && stack.length === 0,
  );

  if (targetStackIndex === -1) {
    return { newState: state, movedCard: null, targetStackIndex: null };
  }

  const movedCard = sourceStack[sourceStack.length - 1];
  const newPiles = state.piles.map((pile, index) => {
    if (index === stackIndex) {
      return pile.slice(0, -1);
    }

    if (index === targetStackIndex) {
      return [...pile, movedCard];
    }

    return [...pile];
  });

  const newState: GameState = {
    ...state,
    piles: newPiles,
  };

  return { newState, movedCard, targetStackIndex };
}

const rankValue = (rank: number) => (rank === 1 ? 14 : rank); // Treat Ace as highest for comparison
const isHigherRank = (candidate: CardType, target: CardType) =>
  rankValue(candidate.rank) > rankValue(target.rank);

export function getTopCardPlayableAction(
  state: GameState,
  stackIndex: number,
): PlayableAction | null {
  const stack = state.piles[stackIndex];
  if (!stack.length) return null;

  const topCard = stack[stack.length - 1];

  const hasHigherMatchingSuit = state.piles.some((otherStack, otherIndex) => {
    if (otherIndex === stackIndex) return false;
    if (!otherStack.length) return false;

    const otherTop = otherStack[otherStack.length - 1];
    return otherTop.suit === topCard.suit && isHigherRank(otherTop, topCard);
  });

  if (hasHigherMatchingSuit) return "discard";

  const hasEmptyStack = state.piles.some(
    (otherStack, otherIndex) =>
      otherIndex !== stackIndex && otherStack.length === 0,
  );

  if (stack.length === 1 && hasEmptyStack) return null;

  return hasEmptyStack ? "relocate" : null;
}

export function getGameOutcome(state: GameState): GameOutcome | null {
  if (state.drawPile.length > 0) {
    return null;
  }

  const hasPlayableCard = state.piles.some(
    (_, pileIndex) => getTopCardPlayableAction(state, pileIndex) !== null,
  );

  if (hasPlayableCard) {
    return null;
  }

  const isWinningState = state.piles.every(
    (pile) => pile.length === 1 && pile[0].rank === 1,
  );

  return isWinningState ? "won" : "lost";
}
