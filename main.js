import { NoteSplitter, $n } from "./noteSplitter.js";

const notes = [
    "r8 e8 e8 e8 e8 e8 e8 e8 r8 e8 e8 e8 e8 e8 e8 e8 r8 e8 e8 e8 e8 e8 e8 e8 r8 e8 e8 e8 e8 e8 e8 e8 r8 e8 e8 e8 e8 e8 e8 e8 r8 e8 e8 e8 e8 e8 e8 e8 r8 e8 e8 e8 e8 e8 e8 e8 r8 e8 e8 e8 e8 e8 e8 e8 r8 e8 e8 e8 e8 e8 e8 e8 r8 e8 e8 e8 e8 e8 e8 e8 r8 e8 e8 e8 e8 e8 e8 e8 r8 e8 e8 e8 e8 e8 e8 e8 r8 e8 e8 e8 e8 e8 e8 e8 r8 e8 e8 e8 e8 e8 e8 e8 e16 e16 e16 e16 e16 e16 e16 e16 e16 e16 e16 e16 e16 e16 e16 e16 e32 e32 e32 e32 e32 e32 e32 e32 e32 e32 e32 e32 e32 e32 e32 e32 e32 e32 e32 e32 e32 e32 e32 e32 e32 e32 e32 e32 e32 e32 e32 e32 e4",
    "e16 r16 e16 e16 r16 r16 e16 r16 e16 e16 r16 r16 e16 r16 e16 r16 e16 r16 e16 e16 r16 r16 e16 r16 e16 e16 r16 r16 e16 r16 e16 r16 e16 r16 e16 e16 r16 r16 e16 r16 e16 e16 e16 r16 e16 r16 e16 r16 e16 r16 e16 e16 r16 e16 e16 r16 e16 e16 e16 r16 e16 r16 r16 r16 e16 r16 e16 e16 r16 r16 e16 r16 e16 e16 r16 r16 e16 r16 e16 r16 e16 r16 e16 e16 r16 r16 e16 r16 e16 e16 r16 r16 e16 r16 e16 r16 e16 r16 e16 e16 r16 e16 e16 r16 e16 e16 r16 e16 e16 e16 e16 r16 e16 r16 e16 e16 r16 e16 e16 e16 e16 r16 e16 r16 e16 r16 e16 r16 e16 r16 e16 e16 r16 r16 e16 r16 e16 e16 r16 r16 e16 r16 e16 r16 e16 r16 e16 e16 r16 r16 e16 r16 e16 e16 e16 r16 e16 r16 e16 r16 e16 r16 e16 r16 e16 r16 e16 r16 e16 r16 r16 e16 e16 e16 e16 r16 e16 r16 e16 e16 e16 r16 e16 r16 e16 e16 e16 r16 e16 r16 r16 r16 e16 r16 e16 e16 r16 r16 e16 r16 e16 e16 r16 r16 e16 r16 e16 r16 e16 r16 e16 e16 r16 r16 e16 r16 e16 e16 e16 r16 e16 e16 e16 r16 e16 r16 e16 e16 r16 e16 e16 r16 e16 e16 e16 r16 e16 e16 e16 r16 e16 r16 e16 e16 r16 e16 e16 r16 e16 e16 e16 r16 e16 r16 r16 r16",
];

const qushu = ["r8 r8 r8 r8 r8 r8 r8 e4 e16 r16 r16 e16 r16 r16 e8 r8 e8 r8"];
const fragrance_master = new NoteSplitter($n(4), 1, qushu[0]);

const parsed = fragrance_master.parseLilypond();
// console.log(parsed.content);

const reduced = parsed.reduceRest();
// console.log(reduced.content);

const normalized = reduced.split(true, false, true);
// console.log(normalized.content);

const lilypond = normalized.lilypond();
console.log(lilypond.join().content);
