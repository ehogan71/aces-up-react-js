import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GameStatistics } from "./GameStatistics";

const storageKey = "test-stats";

describe("GameStatistics", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.body.innerHTML = "";
  });

  it("renders nothing until portal is active and target exists", () => {
    const { container } = render(
      <GameStatistics
        gameSessionId={1}
        gameOutcome={null}
        portalActive={false}
        portalTargetId="stats-target"
        storageKey={storageKey}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("tracks started/completed/won stats and persists to localStorage", async () => {
    const target = document.createElement("div");
    target.id = "stats-target";
    document.body.appendChild(target);

    const { rerender } = render(
      <GameStatistics
        gameSessionId={1}
        gameOutcome={null}
        portalActive={true}
        portalTargetId="stats-target"
        storageKey={storageKey}
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Game statistics")).toBeInTheDocument();
    });
    expect(screen.getByText("1")).toBeInTheDocument();

    rerender(
      <GameStatistics
        gameSessionId={1}
        gameOutcome="won"
        portalActive={true}
        portalTargetId="stats-target"
        storageKey={storageKey}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("1/1 (100%)")).toBeInTheDocument();
    });

    rerender(
      <GameStatistics
        gameSessionId={1}
        gameOutcome="won"
        portalActive={true}
        portalTargetId="stats-target"
        storageKey={storageKey}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("1/1 (100%)")).toBeInTheDocument();
    });

    const stored = JSON.parse(window.localStorage.getItem(storageKey) ?? "{}");
    expect(stored.gamesStarted).toBe(1);
    expect(stored.gamesCompleted).toBe(1);
    expect(stored.gamesWon).toBe(1);
  });

  it("clears statistics and invokes callback", async () => {
    const target = document.createElement("div");
    target.id = "stats-target";
    document.body.appendChild(target);

    const onClearStatistics = vi.fn();
    render(
      <GameStatistics
        gameSessionId={2}
        gameOutcome="lost"
        portalActive={true}
        portalTargetId="stats-target"
        storageKey={storageKey}
        showClearStatistics={true}
        onClearStatistics={onClearStatistics}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Clear Statistics*" }),
      ).toBeInTheDocument();
    });

    await userEvent.click(
      screen.getByRole("button", { name: "Clear Statistics*" }),
    );

    await waitFor(() => {
      expect(screen.getByText("0/0 (0%)")).toBeInTheDocument();
    });

    expect(onClearStatistics).toHaveBeenCalledTimes(1);
    const stored = JSON.parse(window.localStorage.getItem(storageKey) ?? "{}");
    expect(stored.gamesStarted).toBe(0);
    expect(stored.gamesCompleted).toBe(0);
    expect(stored.gamesWon).toBe(0);
  });
});
