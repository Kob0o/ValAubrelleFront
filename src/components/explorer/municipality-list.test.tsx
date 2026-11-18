import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { indicatorClasses, indicatorValues, municipalities } from "@/mocks/explorer";
import { MunicipalityList } from "./municipality-list";

afterEach(cleanup);

it("préserve dans la liste une commune sans géométrie et son identifiant de sélection", () => {
  const onSelect = vi.fn();
  render(<MunicipalityList municipalities={[{ ...municipalities[0], geometry: null }, { ...municipalities[1], isInPerimeter: false }]} values={indicatorValues} classes={indicatorClasses.price} layer="price" selection={[municipalities[0].code]} onSelect={onSelect} />);
  expect(screen.getAllByRole("button")).toHaveLength(1);
  const button = screen.getByRole("button", { name: /Bois-des-Aulnes/ });
  expect(button).toHaveTextContent("Géométrie indisponible");
  expect(button).toHaveAttribute("aria-pressed", "true");
  fireEvent.click(button);
  expect(onSelect).toHaveBeenCalledWith("59001");
});
