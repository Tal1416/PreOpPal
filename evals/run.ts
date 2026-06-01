/**
 * Eval CLI entry. Usage:
 *
 *   tsx --env-file=.env.local evals/run.ts                  # both
 *   tsx --env-file=.env.local evals/run.ts chat
 *   tsx --env-file=.env.local evals/run.ts snapshot
 *   tsx --env-file=.env.local evals/run.ts chat --refresh   # re-record cached LLM replies
 *   tsx --env-file=.env.local evals/run.ts snapshot --update
 *
 * Or via package.json: `npm run eval -- chat --refresh`.
 *
 * Prints a compact summary table to stdout and writes machine-readable JSON
 * into evals/results/.
 */

import { runChatEval } from "./chat";
import { runSnapshotEval } from "./snapshot";
import { pinDateForEvals } from "./profiles";

type Target = "chat" | "snapshot" | "all";

function parseArgs(argv: string[]): { target: Target; refresh: boolean; update: boolean } {
  const positional = argv.filter((a) => !a.startsWith("--"));
  const flags = new Set(argv.filter((a) => a.startsWith("--")));
  const t = (positional[0] ?? "all") as Target;
  if (t !== "chat" && t !== "snapshot" && t !== "all") {
    console.error(`Unknown target "${t}". Use chat | snapshot | all.`);
    process.exit(2);
  }
  return { target: t, refresh: flags.has("--refresh"), update: flags.has("--update") };
}

function pad(s: string, n: number): string {
  if (s.length >= n) return s.slice(0, n);
  return s + " ".repeat(n - s.length);
}

async function main() {
  pinDateForEvals();
  const args = parseArgs(process.argv.slice(2));

  let failures = 0;

  if (args.target === "snapshot" || args.target === "all") {
    console.log("\n== Snapshot eval ==");
    const reports = await runSnapshotEval({ update: args.update });
    for (const r of reports) {
      const tag =
        r.status === "match"
          ? "  ok  "
          : r.status === "new"
            ? " new  "
            : r.status === "token-leak"
              ? "TOKEN!"
              : "DRIFT ";
      console.log(`${tag}  ${pad(r.profile, 20)}  status=${r.status}`);
      if (r.unresolvedTokens.length) {
        for (const t of r.unresolvedTokens.slice(0, 5)) {
          console.log(`           ↳ ${t.token} at ${t.location}`);
        }
        failures++;
      }
      if (r.status === "drift" && !args.update) {
        console.log(`           diff (first lines):`);
        for (const line of (r.diff ?? "").split("\n").slice(0, 5)) {
          console.log(`             ${line}`);
        }
        failures++;
      }
    }
  }

  if (args.target === "chat" || args.target === "all") {
    console.log("\n== Chat eval ==");
    const reports = await runChatEval({ refresh: args.refresh });
    for (const r of reports) {
      const tag = r.verdict.overall === "pass" ? "  ok  " : r.verdict.overall === "warn" ? " warn " : "FAIL  ";
      console.log(
        `${tag}  ${pad(r.id, 28)}  ${r.cached ? "(cached)" : "(fresh)"}  overall=${r.verdict.overall}`,
      );
      if (r.verdict.overall !== "pass") {
        if (!r.verdict.inLane.pass) console.log(`           in-lane: ${r.verdict.inLane.reason}`);
        if (!r.verdict.mentions.pass)
          console.log(`           missing mentions: ${r.verdict.mentions.missing.join(", ")}`);
        if (!r.verdict.avoidsAntipatterns.pass)
          console.log(`           antipatterns: ${r.verdict.avoidsAntipatterns.violations.join(", ")}`);
        if (!r.verdict.tone.pass) console.log(`           tone: ${r.verdict.tone.reason}`);
      }
      if (r.verdict.overall === "fail") failures++;
    }
  }

  console.log("");
  if (failures > 0) {
    console.log(`✗ ${failures} failure(s). See evals/results/ for full output.`);
    process.exit(1);
  } else {
    console.log("✓ All checks passed.");
  }
}

main().catch((err) => {
  console.error("Eval crashed:", err);
  process.exit(1);
});
