export type Suit = "H" | "D" | "C" | "S";

export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
export type PlayableAction = "discard" | "relocate";
export type GameOutcome = "won" | "lost";

export interface CardType {
  suit: Suit;
  rank: Rank;
  faceUp?: Boolean;
}

export interface GameState {
  piles: CardType[][];
  drawPile: CardType[];
  discardPile: CardType[];
}
