import React from "react";
import "./casino-table.css";

interface CasinoTableProps {
  children: React.ReactNode;
}

export const CasinoTable: React.FC<CasinoTableProps> = ({ children }) => {
  return (
    <div id="casino-felt" className="casino-felt">
      {children}
    </div>
  );
};
