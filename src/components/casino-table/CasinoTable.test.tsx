import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CasinoTable } from "./CasinoTable";

describe("CasinoTable", () => {
  it("renders children inside casino felt container", () => {
    render(
      <CasinoTable>
        <div>Child content</div>
      </CasinoTable>,
    );

    const felt = document.getElementById("casino-felt");
    expect(felt).toBeInTheDocument();
    expect(felt).toHaveClass("casino-felt");
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });
});
