# @leonsilicon/cc-cedict

[CC-CEDICT](https://www.mdbg.net/chinese/dictionary?page=cc-cedict) — the community-maintained Chinese ↔ English dictionary — parsed into JSON, plus the [Ohm](https://ohmjs.org) grammar that produced it.

- ~125,000 entries with Traditional / Simplified / pinyin / definitions.
- Ships as a single JSON file you can `import` directly via [JSON modules](https://nodejs.org/api/esm.html#json-modules) (`with { type: "json" }`).
- The grammar is exported separately so you can re-parse the source file yourself, against a newer dump or a fork.

## Installation

```bash
npm install @leonsilicon/cc-cedict
# or: pnpm add @leonsilicon/cc-cedict / yarn add @leonsilicon/cc-cedict / bun add @leonsilicon/cc-cedict
```

Requires Node.js 22.12+ (or any runtime that supports the `with { type: "json" }` import attribute).

## Usage

### Read the dictionary

```ts
import cedict from "@leonsilicon/cc-cedict";

console.log(cedict.entries.length); // 124_933
console.log(cedict.metadata.version); // "1"
console.log(cedict.entries[0]);
// {
//   traditional: "110",
//   simplified:  "110",
//   pinyin:      "yao1 yao1 ling2",
//   definitions: ["the emergency number for law enforcement ..."],
// }
```

The default export has this shape:

```ts
interface CedictDocument {
  metadata: Record<string, string>; // header `#! key=value` lines
  comments: string[]; // header `# ...` lines (license, version notes, etc.)
  entries: CedictEntry[];
}

interface CedictEntry {
  traditional: string;
  simplified: string;
  pinyin: string; // space-separated syllables; `u:` denotes ü
  definitions: string[]; // one per `/.../` segment in the source
}
```

### Use the Ohm grammar

```ts
import grammar from "@leonsilicon/cc-cedict/grammar";
import * as ohm from "ohm-js";

const g = ohm.grammar(grammar);
const match = g.match(`你好 你好 [ni3 hao3] /hello/hi/\n`);
if (match.succeeded()) {
  // ... walk the parse tree with your own semantics
}
```

`@leonsilicon/cc-cedict/grammar` is a default-exported string containing the raw Ohm source. The grammar defines these rules (see [`grammar.ohm`](./grammar.ohm) for the full source):

| Rule           | Matches                                  |
| -------------- | ---------------------------------------- |
| `file`         | the whole file (a sequence of `line`s)   |
| `metadataLine` | `#! key=value` header lines              |
| `commentLine`  | `# anything` header lines                |
| `entryLine`    | `<trad> <simp> [pinyin] /def1/def2/.../` |
| `blankLine`    | a bare newline                           |

## Source format

Each entry in CC-CEDICT looks like:

```
亞當·斯密 亚当·斯密 [Ya4 dang1 · Si1 mi4] /Adam Smith (1723-1790), Scottish philosopher .../
```

- The headword section is space-delimited (Traditional, then Simplified).
- Pinyin appears inside `[...]`; `u:` represents ü.
- Definitions follow inside `/.../`, slash-separated.

## Regenerating the JSON

The published JSON is built from `data/cedict_1_0_ts_utf-8_mdbg.txt` (downloaded from MDBG). To rebuild against the latest dump:

```bash
bun run download   # fetch the latest cedict_1_0_ts_utf-8_mdbg.txt.gz
bun run parse      # parse it with the Ohm grammar → cedict_1_0_ts_utf-8_mdbg.json
```

The same two steps run automatically before `npm publish` via the `prepublishOnly` hook.

## License & attribution

The parsing code in this package is MIT-licensed. The dictionary data itself is licensed by MDBG under [Creative Commons Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/). If you redistribute the JSON or any derivative, you must keep the same license and credit CC-CEDICT.
