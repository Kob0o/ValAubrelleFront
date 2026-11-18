import type { Metadata } from "next";
import { ExplorerPrototype } from "@/components/explorer/explorer-prototype";

export const metadata: Metadata = {
  title: "Explorer le territoire — Val d’Aubrelle",
  description: "Prototype cartographique : comparer les prix et les DPE de 32 communes.",
};

export default function ExplorerPage() {
  return <ExplorerPrototype />;
}
