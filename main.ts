// The Printer Apology
// make.fun bounty: u-eager-stork-81-9647-the-printer-apology-60229153
//
// The program writes a single one-line apology from an office
// printer to /output/entry.txt. The gate requires UTF-8 text of
// 1 to 120 characters, not only whitespace, a single line. The
// judge compares entries two at a time, weighing first that the
// line is genuinely an apology from a printer to its office with
// the printer's own gripes in it, then that it lands a real joke
// with the punch at the end, then that the grievance is something
// a printer would actually suffer (jams, cheap paper, staples,
// being asked for colour), then freshness, then economy.
// Every candidate below is plain ASCII, so the character count
// the gate sees is exactly the count this program sees.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const MAX_CHARS = 120;

// Each candidate is scored on the judge's own criteria, most
// important first. Scores are small integers so the ranking is
// transparent and the pick is deterministic: ties break toward
// the earlier candidate, never by chance.
interface Candidate {
  line: string;
  apology: number; // genuinely an apology from the printer, with its gripes
  funny: number; // lands a real joke, punch at the end
  truth: number; // a grievance a printer would actually suffer
  fresh: number; // an angle, image or phrasing not met before
  economy: number; // every word earns its place inside 120 chars
}

const CANDIDATES: Candidate[] = [
  {
    // Blame-shift apology: the jam is the office's fault for
    // feeding it bargain paper. Punch lands on "choking on it",
    // but "jammed on your big day" is the most obvious opener.
    line: "Sorry I jammed on your big day - you fed me bargain paper, then blamed me for choking on it.",
    apology: 5,
    funny: 4,
    truth: 5,
    fresh: 3,
    economy: 5,
  },
  {
    // The printer ate the report and reviews the paper: stapled,
    // folded, still better than the cheap ream. Three printer
    // truths stacked, punch on the taste test at the end.
    line: "I apologise for eating your report: it was stapled, folded, and still tasted better than the cheap paper you buy.",
    apology: 5,
    funny: 4,
    truth: 5,
    fresh: 4,
    economy: 4,
  },
  {
    // Mid-report jam, told as the office's own doing: discount
    // paper in, then a gasp as if the jam were the printer's
    // idea. Sharpened: "act shocked when I spit it back" was a
    // shrug; "gasp like the jam was my idea" puts the blame
    // back on the office in the last words.
    line: "Forgive me for jamming mid-report - you feed me discount paper, then gasp like the jam was my idea.",
    apology: 5,
    funny: 4,
    truth: 5,
    fresh: 3,
    economy: 4,
  },
  {
    // The printer ate the presentation and turns the accusation
    // around: staples, cheap paper, a deadline - then it gets
    // called temperamental. The reversal is the joke.
    line: "Sorry I ate your presentation, but you fed me staples, cheap paper and a deadline, then called me temperamental.",
    apology: 5,
    funny: 4,
    truth: 5,
    fresh: 4,
    economy: 4,
  },
  {
    // The charge sheet: colour, discount paper, staples - then
    // the deadpan verdict that even printers have limits, and
    // the office is one of them. The punch is the last three
    // words. Tightened: "I was asked for" cut to "asked for",
    // which reads like a charge sheet and buys 6 characters.
    line: "Apologies for the jam: asked for colour, fed discount paper, and stapled. Even printers have limits. You are one.",
    apology: 5,
    funny: 5,
    truth: 5,
    fresh: 5,
    economy: 5,
  },
  {
    // The confession that retracts itself: cheap paper, one
    // staple, a 200-page colour job at 8:59, "I did my best.
    // I lied." The last two words flip the whole apology into
    // a joke. Tightened: dash swapped for a colon, "a staple"
    // made "one staple" so the charge reads like a list.
    line: "I'm sorry I jammed again: cheap paper, one staple, a 200-page colour job at 8:59. I did my best. I lied.",
    apology: 5,
    funny: 5,
    truth: 5,
    fresh: 4,
    economy: 4,
  },
  {
    // A different grievance entirely: not a jam but waste. The
    // office clicks print, walks off, and the printer is left
    // holding 47 copies of page one. "Holding the evidence"
    // makes the printer an unwilling accomplice, not a victim.
    line: "Sorry I printed 47 copies of page one - you clicked print, walked off, and left me holding the evidence.",
    apology: 5,
    funny: 4,
    truth: 4,
    fresh: 5,
    economy: 5,
  },
];

// Weight the criteria the way the judge brief orders them:
// apology first, then funny, then truth, then fresh, then
// economy. A candidate that is not one line, or that breaks
// the 120-character cap, is disqualified from the pick outright
// instead of merely losing points: the gate would refuse it,
// so no score can save it.
function isEligible(c: Candidate): boolean {
  return (
    c.line.length >= 1 &&
    c.line.length <= MAX_CHARS &&
    c.line.trim().length > 0 &&
    !c.line.includes("\n") &&
    !c.line.includes("\r")
  );
}

function score(c: Candidate): number {
  return c.apology * 5 + c.funny * 4 + c.truth * 3 + c.fresh * 2 + c.economy * 1;
}

function pickBest(candidates: Candidate[]): string {
  const eligible = candidates.filter(isEligible);
  if (eligible.length === 0) {
    throw new Error("no candidate passes the gate");
  }
  let best = eligible[0];
  let bestScore = score(best);
  for (const c of eligible.slice(1)) {
    const s = score(c);
    if (s > bestScore) {
      best = c;
      bestScore = s;
    }
  }
  return best.line;
}

const APOLOGY = pickBest(CANDIDATES);

// The gate the sealed scorer applies: UTF-8 text of 1 to 120
// characters, not only whitespace, a single line. Check the text
// before writing it, then read the file back and check what landed.
function assertGateOk(text: string): void {
  if (text.length < 1 || text.length > MAX_CHARS) {
    throw new Error(`apology is ${text.length} chars, must be 1-120`);
  }
  if (text.trim().length === 0) {
    throw new Error("apology must not be only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("apology must be a single line");
  }
}

assertGateOk(APOLOGY);

const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(`${OUT_DIR}/entry.txt`, APOLOGY, "utf8");

const written = readFileSync(`${OUT_DIR}/entry.txt`, "utf8");
assertGateOk(written);
if (written !== APOLOGY) {
  throw new Error("entry.txt does not match the apology");
}
console.log(`wrote ${written.length} chars to ${OUT_DIR}/entry.txt`);
console.log(written);
