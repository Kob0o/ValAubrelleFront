import { render, screen } from "@testing-library/react";
import { describe, expect, it, expectTypeOf } from "vitest";
import { Settings } from "lucide-react";

import {
  IconButton,
  type IconButtonProps,
} from "@/components/shared/icon-button";

describe("IconButton", () => {
  it("expose le label via aria-label", () => {
    render(
      <IconButton label="Ouvrir les paramètres">
        <Settings aria-hidden />
      </IconButton>,
    );

    expect(
      screen.getByRole("button", { name: "Ouvrir les paramètres" }),
    ).toBeInTheDocument();
  });

  it("exige un label au typage", () => {
    expectTypeOf<IconButtonProps>().toHaveProperty("label");
    expectTypeOf<IconButtonProps["label"]>().toEqualTypeOf<string>();

    type PropsWithoutLabel = Omit<IconButtonProps, "label">;
    type LabelRequired = PropsWithoutLabel extends IconButtonProps
      ? false
      : true;
    expectTypeOf<LabelRequired>().toEqualTypeOf<true>();
  });
});
