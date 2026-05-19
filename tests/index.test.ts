import { expect, test } from "vite-plus/test";
import { parse } from "../scripts/parse.ts";

function parseSingle(line: string) {
  const doc = parse(`${line}\n`);
  expect(doc.entries).toHaveLength(1);
  return doc.entries[0]!;
}

test("parses a simple entry", () => {
  expect(parseSingle("你好 你好 [ni3 hao3] /hello/hi/")).toEqual({
    traditional: "你好",
    simplified: "你好",
    pinyin: "ni3 hao3",
    definitions: ["hello", "hi"],
  });
});

test("preserves middle-dot in headwords and pinyin", () => {
  const entry = parseSingle("亞當·斯密 亚当·斯密 [Ya4 dang1 · Si1 mi4] /Adam Smith (1723-1790)/");
  expect(entry.traditional).toBe("亞當·斯密");
  expect(entry.simplified).toBe("亚当·斯密");
  expect(entry.pinyin).toBe("Ya4 dang1 · Si1 mi4");
  expect(entry.definitions).toEqual(["Adam Smith (1723-1790)"]);
});

test("accepts brackets and pipes inside definitions", () => {
  const entry = parseSingle("甲 甲 [jia3] /(see 乙[yi3])/variant of 假|假[jia3]/");
  expect(entry.definitions).toEqual(["(see 乙[yi3])", "variant of 假|假[jia3]"]);
});

test("handles the ü-as-u: pinyin convention", () => {
  const entry = parseSingle("女 女 [nu:3] /woman/");
  expect(entry.pinyin).toBe("nu:3");
});

test("collects metadata, comments and entries from a full document", () => {
  const input = [
    "# CC-CEDICT",
    "# Community maintained free Chinese-English dictionary.",
    "#! version=1",
    "#! entries=2",
    "",
    "你好 你好 [ni3 hao3] /hello/",
    "謝謝 谢谢 [xie4 xie5] /thanks/thank you/",
    "",
  ].join("\n");

  const doc = parse(input);
  expect(doc.metadata).toEqual({ version: "1", entries: "2" });
  expect(doc.comments).toHaveLength(2);
  expect(doc.entries).toHaveLength(2);
  expect(doc.entries[1]).toEqual({
    traditional: "謝謝",
    simplified: "谢谢",
    pinyin: "xie4 xie5",
    definitions: ["thanks", "thank you"],
  });
});

test("throws on malformed input", () => {
  expect(() => parse("not a real entry\n")).toThrow(/Failed to parse/);
});
