import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GameBoard } from "./GameBoard";

const pilePropsSpy = vi.fn();

vi.mock("../pile/Pile", () => ({
  Pile: (props: unknown) => {
    pilePropsSpy(props);
    return <div data-testid="pile-mock" />;
  },
}));

describe("GameBoard", () => {
  it("renders four pile slots and passes expected props to each Pile", () => {
    const onAnimationComplete = vi.fn();
    const onTopCardClick = vi.fn();

    const piles = [[{ suit: "H", rank: 1 }], [], [], []] as any;
    const playableActions = ["discard", null, null, null] as const;

    const { container } = render(
      <GameBoard
        piles={piles}
        playableActions={[...playableActions]}
        animateDeal={true}
        hidePlayableIndicators={false}
        discardingCard={{ suit: "H", rank: 1 }}
        discardingPileIndex={0}
        lastDealt={[{ suit: "H", rank: 1 }] as any}
        onAnimationComplete={onAnimationComplete}
        onTopCardClick={onTopCardClick}
      />,
    );

    expect(container.querySelectorAll(".pile-slot")).toHaveLength(4);
    expect(pilePropsSpy).toHaveBeenCalledTimes(4);

    const firstCallProps = pilePropsSpy.mock.calls[0][0] as any;
    expect(firstCallProps.pileIndex).toBe(0);
    expect(firstCallProps.playableAction).toBe("discard");
    expect(firstCallProps.animateDeal).toBe(true);
    expect(firstCallProps.hidePlayableIndicators).toBe(false);
    expect(firstCallProps.onAnimationComplete).toBe(onAnimationComplete);
    expect(firstCallProps.onTopCardClick).toBe(onTopCardClick);
  });
});
