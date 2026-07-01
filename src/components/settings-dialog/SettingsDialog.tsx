import React from "react";
import "./settings-dialog.css";

interface SettingsDialogProps {
  onDone: () => void;
  showPlayableIndicators: boolean;
  onTogglePlayableIndicators: () => void;
  showCardCounts: boolean;
  onToggleCardCounts: () => void;
  cardBackColor: "red" | "blue";
  onSelectCardBackColor: (color: "red" | "blue") => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  onDone,
  showPlayableIndicators,
  onTogglePlayableIndicators,
  showCardCounts,
  onToggleCardCounts,
  cardBackColor,
  onSelectCardBackColor,
}) => {
  return (
    <div className="settings-dialog-backdrop">
      <div className="settings-dialog" role="dialog" aria-modal="true">
        <button type="button" className="settings-done-button" onClick={onDone}>
          Done
        </button>

        <h2 className="settings-title">Settings</h2>

        <section className="settings-section">
          <h3>Game Play</h3>

          <label className="settings-toggle-row">
            <div className="settings-toggle-copy">
              <span className="settings-toggle-label">Playable indicators</span>
              <span className="settings-toggle-description">
                show the dot on cards that can be played
              </span>
            </div>
            <button
              type="button"
              className={`settings-toggle ${
                showPlayableIndicators ? "settings-toggle--on" : ""
              }`}
              onClick={onTogglePlayableIndicators}
              aria-pressed={showPlayableIndicators}
            >
              <span className="settings-toggle-knob" />
            </button>
          </label>

          <label className="settings-toggle-row">
            <div className="settings-toggle-copy">
              <span className="settings-toggle-label">Card counts</span>
              <span className="settings-toggle-description">
                Show the card counts on the deck and discard stacks
              </span>
            </div>
            <button
              type="button"
              className={`settings-toggle ${showCardCounts ? "settings-toggle--on" : ""}`}
              onClick={onToggleCardCounts}
              aria-pressed={showCardCounts}
            >
              <span className="settings-toggle-knob" />
            </button>
          </label>
        </section>

        <section className="settings-section">
          <h3>Card Backs</h3>
          <div className="settings-card-back-buttons">
            <button
              type="button"
              className={`settings-card-back-button settings-card-back-button--red ${
                cardBackColor === "red"
                  ? "settings-card-back-button--selected"
                  : ""
              }`}
              onClick={() => onSelectCardBackColor("red")}
              aria-pressed={cardBackColor === "red"}
            >
              Red
            </button>
            <button
              type="button"
              className={`settings-card-back-button settings-card-back-button--blue ${
                cardBackColor === "blue"
                  ? "settings-card-back-button--selected"
                  : ""
              }`}
              onClick={() => onSelectCardBackColor("blue")}
              aria-pressed={cardBackColor === "blue"}
            >
              Blue
            </button>
          </div>
        </section>

        <section className="settings-section">
          <h3>Statistics</h3>
          <div id="settings-stats" />
        </section>

        <section className="settings-section">
          <h3>Site Info</h3>
          <p>Developed by Edward Hogan</p>
          <p>Powered by React.js</p>
          <p>Version v1.0.0</p>
        </section>
      </div>
    </div>
  );
};
