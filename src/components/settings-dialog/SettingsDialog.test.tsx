import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SettingsDialog } from "./SettingsDialog";

describe("SettingsDialog", () => {
  it("calls handlers for done and gameplay toggles", () => {
    const onDone = vi.fn();
    const onTogglePlayableIndicators = vi.fn();
    const onToggleCardCounts = vi.fn();

    render(
      <SettingsDialog
        onDone={onDone}
        showPlayableIndicators={true}
        onTogglePlayableIndicators={onTogglePlayableIndicators}
        showCardCounts={false}
        onToggleCardCounts={onToggleCardCounts}
        cardBackColor="red"
        onSelectCardBackColor={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    fireEvent.click(screen.getAllByRole("button", { pressed: true })[0]);
    fireEvent.click(screen.getAllByRole("button", { pressed: false })[0]);

    expect(onDone).toHaveBeenCalledTimes(1);
    expect(onTogglePlayableIndicators).toHaveBeenCalledTimes(1);
    expect(onToggleCardCounts).toHaveBeenCalledTimes(1);
  });

  it("allows selecting red and blue card back themes", () => {
    const onSelectCardBackColor = vi.fn();

    const { rerender } = render(
      <SettingsDialog
        onDone={vi.fn()}
        showPlayableIndicators={true}
        onTogglePlayableIndicators={vi.fn()}
        showCardCounts={true}
        onToggleCardCounts={vi.fn()}
        cardBackColor="red"
        onSelectCardBackColor={onSelectCardBackColor}
      />,
    );

    const red = screen.getByRole("button", { name: "Red" });
    const blue = screen.getByRole("button", { name: "Blue" });

    expect(red).toHaveAttribute("aria-pressed", "true");
    expect(blue).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(blue);
    fireEvent.click(red);
    expect(onSelectCardBackColor).toHaveBeenNthCalledWith(1, "blue");
    expect(onSelectCardBackColor).toHaveBeenNthCalledWith(2, "red");

    rerender(
      <SettingsDialog
        onDone={vi.fn()}
        showPlayableIndicators={true}
        onTogglePlayableIndicators={vi.fn()}
        showCardCounts={true}
        onToggleCardCounts={vi.fn()}
        cardBackColor="blue"
        onSelectCardBackColor={onSelectCardBackColor}
      />,
    );

    expect(screen.getByRole("button", { name: "Blue" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
