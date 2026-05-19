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

declare const dictionary: CedictDocument;
export default dictionary;
