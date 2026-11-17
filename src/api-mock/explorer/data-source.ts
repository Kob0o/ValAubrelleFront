import type { ApiError } from "./types";

export class ExplorerRequestError extends Error {
  constructor(public status: number, public body: ApiError) {
    super(body.message);
    this.name = "ExplorerRequestError";
  }
}
