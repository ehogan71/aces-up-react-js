import { useEffect, useRef, useState } from "react";
import { CasinoTable } from "./components/casino-table/CasinoTable";
import { GameBoard } from "./components/game-board/GameBoard";
import { DrawDiscardBoard } from "./components/draw-discard-board/DrawDiscardBoard";
import { GameStatistics } from "./components/game-statistics/GameStatistics";
import { SettingsDialog } from "./components/settings-dialog/SettingsDialog";
import { IoSettingsOutline } from "react-icons/io5";
import type { CardType, GameOutcome, GameState } from "./core/types";
import {
  dealCards,
  createDeck,
  discardTopCard,
  getGameOutcome,
  getTopCardPlayableAction,
  relocateTopCard,
} from "./core/gameEngine";

type DiscardAnimationState = {
  card: CardType;
  sourcePileIndex: number;
  sourceLeft: number;
  sourceTop: number;
  sourceWidth: number;
  sourceHeight: number;
  targetLeft: number;
  targetTop: number;
  isFlying: boolean;
};

function App() {
  const settingsStorageKey = "aces-up-game-settings";

  const readStoredSettings = (): {
    showPlayableIndicators: boolean;
    showCardCounts: boolean;
    cardBackColor: "red" | "blue";
  } => {
    if (typeof window === "undefined") {
      return {
        showPlayableIndicators: true,
        showCardCounts: true,
        cardBackColor: "red",
      };
    }

    try {
      const rawValue = window.localStorage.getItem(settingsStorageKey);
      if (!rawValue) {
        return {
          showPlayableIndicators: true,
          showCardCounts: true,
          cardBackColor: "red",
        };
      }

      const parsedValue = JSON.parse(rawValue) as {
        showPlayableIndicators?: boolean;
        showCardCounts?: boolean;
        cardBackColor?: "red" | "blue";
      };

      return {
        showPlayableIndicators: parsedValue.showPlayableIndicators ?? true,
        showCardCounts: parsedValue.showCardCounts ?? true,
        cardBackColor: parsedValue.cardBackColor === "blue" ? "blue" : "red",
      };
    } catch {
      return {
        showPlayableIndicators: true,
        showCardCounts: true,
        cardBackColor: "red",
      };
    }
  };

  const initialSettings = readStoredSettings();

  const createInitialGameState = (): GameState => ({
    piles: [[], [], [], []],
    drawPile: createDeck(),
    discardPile: [],
  });

  const [gameState, setGameState] = useState<GameState>({
    piles: [[], [], [], []],
    drawPile: createDeck(),
    discardPile: [],
  });
  const [gameSessionId, setGameSessionId] = useState(0);
  const [undoStack, setUndoStack] = useState<GameState[]>([]);
  const [animateDeal, setAnimateDeal] = useState(false);
  const [lastDealt, setLastDealt] = useState<CardType[]>([]);
  const [discardAnimation, setDiscardAnimation] =
    useState<DiscardAnimationState | null>(null);
  const [pendingDiscardState, setPendingDiscardState] =
    useState<GameState | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showPlayableIndicators, setShowPlayableIndicators] = useState(
    initialSettings.showPlayableIndicators,
  );
  const [showCardCounts, setShowCardCounts] = useState(
    initialSettings.showCardCounts,
  );
  const [cardBackColor, setCardBackColor] = useState<"red" | "blue">(
    initialSettings.cardBackColor,
  );
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);
  const previousOutcomeRef = useRef<GameOutcome | null>(null);

  const gameOutcome = getGameOutcome(gameState);

  useEffect(() => {
    if (gameOutcome && gameOutcome !== previousOutcomeRef.current) {
      setIsGameOverModalOpen(true);
    }

    if (!gameOutcome) {
      setIsGameOverModalOpen(false);
    }

    previousOutcomeRef.current = gameOutcome;
  }, [gameOutcome]);

  function handleNewGame() {
    previousOutcomeRef.current = null;
    setIsSettingsOpen(false);
    setIsGameOverModalOpen(false);
    setGameSessionId((sessionId) => sessionId + 1);
    setUndoStack([]);
    setAnimateDeal(false);
    setLastDealt([]);
    setDiscardAnimation(null);
    setPendingDiscardState(null);
    setGameState(createInitialGameState());
  }

  function handleDismissGameOver() {
    setIsGameOverModalOpen(false);
  }

  function handleOpenSettings() {
    setIsSettingsOpen(true);
  }

  function handleCloseSettings() {
    setIsSettingsOpen(false);
  }

  function handleClearStatistics() {
    handleNewGame();
  }

  function handleDeal() {
    if (gameOutcome) {
      return;
    }

    const { newState, dealtCards } = dealCards(gameState);

    if (dealtCards.length === 0) {
      return;
    }

    setUndoStack((stack) => [...stack, gameState]);

    // Trigger animation for these cards
    setAnimateDeal(true);
    setLastDealt(dealtCards);

    // Update game state
    setGameState(newState);
  }

  function handleTopCardClick(
    pileIndex: number,
    card: CardType,
    element: HTMLElement,
    action: "discard" | "relocate",
  ) {
    if (animateDeal || discardAnimation) {
      return;
    }

    if (getTopCardPlayableAction(gameState, pileIndex) !== action) {
      return;
    }

    const topCard =
      gameState.piles[pileIndex][gameState.piles[pileIndex].length - 1];
    if (topCard !== card) {
      return;
    }

    if (action === "relocate") {
      const { newState, movedCard, targetStackIndex } = relocateTopCard(
        gameState,
        pileIndex,
      );

      if (!movedCard || targetStackIndex === null) {
        return;
      }

      setUndoStack((stack) => [...stack, gameState]);
      setGameState(newState);
      return;
    }

    const discardSlot = document.getElementById("discard-slot-origin");
    const felt = document.getElementById("casino-felt");

    if (
      !(discardSlot instanceof HTMLElement) ||
      !(felt instanceof HTMLElement)
    ) {
      const { newState } = discardTopCard(gameState, pileIndex);
      setUndoStack((stack) => [...stack, gameState]);
      setGameState(newState);
      return;
    }

    const sourceRect = element.getBoundingClientRect();
    const targetRect = discardSlot.getBoundingClientRect();
    const sourceLeft = sourceRect.left;
    const sourceTop = sourceRect.top;

    const { newState, discardedCard } = discardTopCard(gameState, pileIndex);

    if (!discardedCard) {
      return;
    }

    setUndoStack((stack) => [...stack, gameState]);
    setPendingDiscardState(newState);
    setDiscardAnimation({
      card: discardedCard,
      sourcePileIndex: pileIndex,
      sourceLeft,
      sourceTop,
      sourceWidth: sourceRect.width,
      sourceHeight: sourceRect.height,
      targetLeft: targetRect.left,
      targetTop: targetRect.top,
      isFlying: false,
    });
  }

  function handleUndo() {
    if (animateDeal || discardAnimation || undoStack.length === 0) {
      return;
    }

    const previousState = undoStack[undoStack.length - 1];
    setUndoStack((stack) => stack.slice(0, -1));
    setIsGameOverModalOpen(false);
    previousOutcomeRef.current = null;
    setGameState(previousState);
  }

  useEffect(() => {
    if (!discardAnimation || discardAnimation.isFlying) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      setDiscardAnimation((current) =>
        current ? { ...current, isFlying: true } : current,
      );
    });

    return () => cancelAnimationFrame(frame);
  }, [discardAnimation]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      settingsStorageKey,
      JSON.stringify({
        showPlayableIndicators,
        showCardCounts,
        cardBackColor,
      }),
    );
  }, [showPlayableIndicators, showCardCounts, cardBackColor]);

  const playableActions = gameState.piles.map((_, pileIndex) =>
    getTopCardPlayableAction(gameState, pileIndex),
  );

  const hidePlayableIndicators = animateDeal || discardAnimation !== null;
  const effectiveHidePlayableIndicators =
    hidePlayableIndicators || !showPlayableIndicators;
  const bottomButtonLabel = gameOutcome ? "New Game" : "Undo";
  const bottomButtonDisabled = gameOutcome ? false : undoStack.length === 0;
  const handleBottomButtonClick = gameOutcome ? handleNewGame : handleUndo;
  const isStatisticsPortalActive =
    isSettingsOpen || (isGameOverModalOpen && gameOutcome !== null);
  const statisticsPortalTargetId = isSettingsOpen
    ? "settings-stats"
    : "game-over-modal-stats";

  return (
    <CasinoTable>
      <button
        type="button"
        className="settings-cog-button"
        onClick={handleOpenSettings}
        aria-label="Open settings"
        title="Settings"
      >
        <IoSettingsOutline className="settings-cog-icon" aria-hidden="true" />
      </button>

      <GameBoard
        piles={gameState.piles}
        playableActions={playableActions}
        animateDeal={animateDeal}
        hidePlayableIndicators={effectiveHidePlayableIndicators}
        discardingCard={discardAnimation?.card ?? null}
        discardingPileIndex={discardAnimation?.sourcePileIndex ?? null}
        lastDealt={lastDealt}
        onAnimationComplete={() => setAnimateDeal(false)}
        onTopCardClick={handleTopCardClick}
      />
      <DrawDiscardBoard
        drawPile={gameState.drawPile}
        discardPile={gameState.discardPile}
        cardBackColor={cardBackColor}
        showCardCounts={showCardCounts}
        bottomButtonLabel={bottomButtonLabel}
        bottomButtonDisabled={bottomButtonDisabled}
        onBottomButtonClick={handleBottomButtonClick}
        onDraw={handleDeal}
      />
      {isGameOverModalOpen && gameOutcome && (
        <div className="game-over-modal-backdrop">
          <div className="game-over-modal" role="dialog" aria-modal="true">
            <h2>
              {gameOutcome === "won"
                ? "Congratulations! You won"
                : "Sorry, try again"}
            </h2>
            <div id="game-over-modal-stats" />
            <div className="game-over-modal-actions">
              <button type="button" onClick={handleNewGame}>
                New Game
              </button>
              <button type="button" onClick={handleDismissGameOver}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
      {isSettingsOpen && (
        <SettingsDialog
          onDone={handleCloseSettings}
          showPlayableIndicators={showPlayableIndicators}
          onTogglePlayableIndicators={() =>
            setShowPlayableIndicators((value) => !value)
          }
          showCardCounts={showCardCounts}
          onToggleCardCounts={() => setShowCardCounts((value) => !value)}
          cardBackColor={cardBackColor}
          onSelectCardBackColor={setCardBackColor}
        />
      )}
      <GameStatistics
        gameSessionId={gameSessionId}
        gameOutcome={gameOutcome}
        portalActive={isStatisticsPortalActive}
        portalTargetId={statisticsPortalTargetId}
        showClearStatistics={isSettingsOpen}
        onClearStatistics={handleClearStatistics}
      />
      {discardAnimation && (
        <div
          className={`card discard-animation-card ${
            discardAnimation.isFlying ? "discard-animation-card--fly" : ""
          }`}
          style={
            {
              position: "fixed",
              left: `${discardAnimation.isFlying ? discardAnimation.targetLeft : discardAnimation.sourceLeft}px`,
              top: `${discardAnimation.isFlying ? discardAnimation.targetTop : discardAnimation.sourceTop}px`,
              width: `${discardAnimation.sourceWidth}px`,
              height: `${discardAnimation.sourceHeight}px`,
            } as React.CSSProperties
          }
          onTransitionEnd={(event) => {
            if (event.propertyName === "opacity") {
              setDiscardAnimation(null);
              setGameState(
                (currentState) => pendingDiscardState ?? currentState,
              );
              setPendingDiscardState(null);
            }
          }}
        >
          <img
            src={`cards/${discardAnimation.card.suit}-${discardAnimation.card.rank}.png`}
            alt={`${discardAnimation.card.rank} of ${discardAnimation.card.suit}`}
            className="card-image"
            draggable={false}
          />
        </div>
      )}
    </CasinoTable>
  );
}

export default App;
