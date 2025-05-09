import init_wasm, { Answers, solve } from "../solver-pkg/polymate2";
import { SolverRequest } from "./solverTypes";

let initialized = false;
let answers: Answers | null = null;

self.onmessage = (e: MessageEvent<SolverRequest>) => {
  const { data } = e;

  const task = () => {
    const kind = data.kind;

    if (kind === "solve") {
      const problem = data.problem;
      answers = solve(problem);
      self.postMessage({ kind: "solved", numAnswers: answers.len() });
    } else if (kind === "answer") {
      if (answers === null) {
        self.postMessage({ kind: "error", error: "answers not available" });
        return;
      }
      const answer = answers.get(data.index);
      self.postMessage({ kind: "answer", answer });
    }
  };

  if (initialized) {
    task();
  } else {
    init_wasm().then(() => {
      initialized = true;
      task();
    });
  }
};
