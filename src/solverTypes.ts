import { Answer, Problem } from "../solver-pkg/polymate2";
export { type Answer } from "../solver-pkg/polymate2";

export type SolverRequest =
  | { kind: "solve"; problem: Problem }
  | { kind: "answer"; index: number };

export type SolverResponse =
  | { kind: "solved"; numAnswers: number }
  | { kind: "answer"; answer: Answer }
  | { kind: "error"; error: string };
