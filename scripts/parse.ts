import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import esMain from "es-main";
import { grammar as makeGrammar } from "ohm-js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const grammarSource = readFileSync(join(repoRoot, "grammar.ohm"), "utf8");

export const grammar = makeGrammar(grammarSource);

export interface CedictEntry {
  traditional: string;
  simplified: string;
  pinyin: string;
  definitions: string[];
}

export interface CedictDocument {
  metadata: Record<string, string>;
  comments: string[];
  entries: CedictEntry[];
}

type LineNode =
  | { kind: "metadata"; key: string; value: string }
  | { kind: "comment"; text: string }
  | { kind: "entry"; entry: CedictEntry }
  | { kind: "blank" };

const semantics = grammar.createSemantics().addOperation<unknown>("build", {
  file(lines): CedictDocument {
    const doc: CedictDocument = { metadata: {}, comments: [], entries: [] };
    for (const child of lines.children) {
      const node = child.build() as LineNode;
      if (node.kind === "metadata") doc.metadata[node.key] = node.value;
      else if (node.kind === "comment") doc.comments.push(node.text);
      else if (node.kind === "entry") doc.entries.push(node.entry);
    }
    return doc;
  },
  line(content): LineNode {
    return content.build() as LineNode;
  },
  metadataLine(_hash, _hs, key, _eq, value, _eol): LineNode {
    return {
      kind: "metadata",
      key: key.sourceString.trim(),
      value: value.sourceString.trim(),
    };
  },
  commentLine(_hash, rest, _eol): LineNode {
    return { kind: "comment", text: rest.sourceString };
  },
  entryLine(
    traditional,
    _sp1,
    simplified,
    _sp2,
    _lbracket,
    pinyin,
    _rbracket,
    _sp3,
    _slash1,
    defs,
    _slash2,
    _eol,
  ): LineNode {
    return {
      kind: "entry",
      entry: {
        traditional: traditional.sourceString,
        simplified: simplified.sourceString,
        pinyin: pinyin.sourceString,
        definitions: defs.build() as string[],
      },
    };
  },
  definitions(first, _slashes, rest): string[] {
    return [first.sourceString, ...rest.children.map((c) => c.sourceString)];
  },
  blankLine(_eol): LineNode {
    return { kind: "blank" };
  },
});

export function parse(input: string): CedictDocument {
  const match = grammar.match(input);
  if (match.failed()) {
    throw new Error(`Failed to parse CC-CEDICT input:\n${match.message}`);
  }
  return semantics(match).build() as CedictDocument;
}

// Run as a CLI: read the bundled .txt and emit a .json at the repo root with
// the same basename, so it can be referenced directly by the package exports.
if (esMain(import.meta)) {
  const inputName = "cedict_1_0_ts_utf-8_mdbg.txt";
  const inputPath = join(repoRoot, "data", inputName);
  const outputPath = join(repoRoot, inputName.replace(/\.txt$/, ".json"));

  const doc = parse(readFileSync(inputPath, "utf8"));
  writeFileSync(outputPath, JSON.stringify(doc));
  console.log(`Parsed ${doc.entries.length.toLocaleString()} entries → ${outputPath}`);
}
