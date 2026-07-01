import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Card } from "./Card";

describe("Card", () => {
  it("renders the card image with suit/rank path and alt", () => {
    render(<Card card={{ suit: "H", rank: 12 }} />);

    const image = screen.getByRole("img", { name: "12 of H" });
    expect(image).toHaveAttribute("src", "/cards/H-12.png");
  });

  it("applies deal animation class when animateFromDraw is true", async () => {
    const drawSlot = document.createElement("div");
    drawSlot.id = "draw-slot-origin";
    drawSlot.getBoundingClientRect = () =>
      ({ left: 10, top: 20, width: 30, height: 40 }) as DOMRect;
    document.body.appendChild(drawSlot);

    const { container } = render(
      <Card card={{ suit: "C", rank: 7 }} animateFromDraw />,
    );

    await waitFor(() => {
      expect(container.querySelector(".card")).toHaveClass("deal-animation");
    });
  });

  it("calls onAnimationComplete after animation timeout", () => {
    vi.useFakeTimers();
    const onAnimationComplete = vi.fn();

    render(
      <Card
        card={{ suit: "S", rank: 3 }}
        animateFromDraw
        onAnimationComplete={onAnimationComplete}
      />,
    );

    vi.advanceTimersByTime(400);
    expect(onAnimationComplete).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it("merges custom style into card container", () => {
    const { container } = render(
      <Card card={{ suit: "D", rank: 9 }} style={{ opacity: 0.5 }} />,
    );

    expect(container.querySelector(".card")).toHaveStyle({ opacity: "0.5" });
  });
});
