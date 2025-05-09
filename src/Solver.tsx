import Worker from "./solverWorker?worker";
import { Answer, Problem } from "../solver-pkg/polymate2";
export { type Answer, Answers } from "../solver-pkg/polymate2";
import { SolverResponse } from "./solverTypes";

let worker: Worker | null = null;
let currentResolve: ((result: SolverResult) => void) | null = null;

export type SolverResult =
  | { status: "ok"; numAnswers: number }
  | { status: "error"; error: string };

export const solveAsync = async (problem: Problem): Promise<SolverResult> => {
  if (worker === null) {
    worker = new Worker();
  }

  if (currentResolve !== null) {
    return new Promise((resolve) => {
      resolve({
        status: "error",
        error: "solver already running",
      });
    });
  }

  return new Promise((resolve) => {
    worker!.onmessage = (e: MessageEvent<SolverResponse>) => {
      currentResolve = null;

      if (e.data.kind === "solved") {
        resolve({
          status: "ok",
          numAnswers: e.data.numAnswers,
        });
      } else {
        resolve({
          status: "error",
          error: "data type mismatch",
        });
      }
    };
    worker!.postMessage({
      kind: "solve",
      problem,
    });
    currentResolve = resolve;
  });
};

export const getAnswerAsync = async (index: number): Promise<Answer | null> => {
  if (worker === null) {
    return new Promise((resolve) => {
      resolve(null);
    });
  }

  return new Promise((resolve) => {
    worker!.onmessage = (e) => {
      if (e.data.kind === "answer") {
        resolve(e.data.answer);
      } else if (e.data.kind === "error") {
        resolve(null);
      }
    };
    worker!.postMessage({
      kind: "answer",
      index,
    });
  });
};

export const terminateWorker = () => {
  if (worker === null) {
    return;
  }

  worker.terminate();
  worker = null;

  if (currentResolve !== null) {
    const resolve = currentResolve;
    currentResolve = null;
    resolve({
      status: "error",
      error: "solver terminated",
    });
  }
};
