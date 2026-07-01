import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { GameOutcome } from "../../core/types";
import "./game-statistics.css";

interface GameStatisticsState {
  gamesStarted: number;
  gamesCompleted: number;
  gamesWon: number;
}

interface GameStatisticsProps {
  gameSessionId: number;
  gameOutcome: GameOutcome | null;
  portalActive?: boolean;
  storageKey?: string;
  portalTargetId?: string;
  showClearStatistics?: boolean;
  onClearStatistics?: () => void;
}

const defaultStats: GameStatisticsState = {
  gamesStarted: 0,
  gamesCompleted: 0,
  gamesWon: 0,
};

function readStoredStats(storageKey: string): GameStatisticsState {
  if (typeof window === "undefined") {
    return defaultStats;
  }

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) {
      return defaultStats;
    }

    const parsedValue = JSON.parse(rawValue) as Partial<GameStatisticsState>;

    return {
      gamesStarted: Number(parsedValue.gamesStarted) || 0,
      gamesCompleted: Number(parsedValue.gamesCompleted) || 0,
      gamesWon: Number(parsedValue.gamesWon) || 0,
    };
  } catch {
    return defaultStats;
  }
}

export const GameStatistics: React.FC<GameStatisticsProps> = ({
  gameSessionId,
  gameOutcome,
  portalActive = false,
  storageKey = "aces-up-game-statistics",
  portalTargetId = "game-over-modal-stats",
  showClearStatistics = false,
  onClearStatistics,
}) => {
  const [stats, setStats] = useState<GameStatisticsState>(() =>
    readStoredStats(storageKey),
  );
  const previousSessionIdRef = useRef<number | null>(null);
  const previousOutcomeRef = useRef<GameOutcome | null>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (previousSessionIdRef.current === gameSessionId) {
      return;
    }

    previousSessionIdRef.current = gameSessionId;
    setStats((currentStats) => ({
      ...currentStats,
      gamesStarted: currentStats.gamesStarted + 1,
    }));
  }, [gameSessionId]);

  useEffect(() => {
    if (!gameOutcome || previousOutcomeRef.current === gameOutcome) {
      previousOutcomeRef.current = gameOutcome;
      return;
    }

    previousOutcomeRef.current = gameOutcome;
    setStats((currentStats) => ({
      ...currentStats,
      gamesCompleted: currentStats.gamesCompleted + 1,
      gamesWon:
        gameOutcome === "won"
          ? currentStats.gamesWon + 1
          : currentStats.gamesWon,
    }));
  }, [gameOutcome]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(stats));
  }, [stats, storageKey]);

  useEffect(() => {
    if (!portalActive || typeof document === "undefined") {
      setPortalTarget(null);
      return;
    }

    const frame = requestAnimationFrame(() => {
      setPortalTarget(document.getElementById(portalTargetId));
    });

    return () => cancelAnimationFrame(frame);
  }, [portalActive, portalTargetId]);

  const winRate =
    stats.gamesCompleted === 0
      ? 0
      : Math.round((stats.gamesWon / stats.gamesCompleted) * 100);

  const handleClearStatistics = () => {
    setStats(defaultStats);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(defaultStats));
    }

    onClearStatistics?.();
  };

  const statsMarkup = (
    <div className="game-statistics" aria-label="Game statistics">
      <div className="game-statistics-row">
        <span className="game-statistics-label">Games started</span>
        <span className="game-statistics-value">{stats.gamesStarted}</span>
      </div>
      <div className="game-statistics-row">
        <span className="game-statistics-label">
          Games won/completed (%won)
        </span>
        <span className="game-statistics-value">
          {stats.gamesWon}/{stats.gamesCompleted} ({winRate}%)
        </span>
      </div>
      {showClearStatistics && (
        <div className="game-statistics-clear-wrap">
          <button
            type="button"
            className="game-statistics-clear-button"
            onClick={handleClearStatistics}
          >
            Clear Statistics*
          </button>
          <p className="game-statistics-clear-note">
            * This action will start a new game
          </p>
        </div>
      )}
    </div>
  );

  if (!portalTarget) {
    return null;
  }

  return createPortal(statsMarkup, portalTarget);
};
