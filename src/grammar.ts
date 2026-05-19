// `?raw` is handled by unplugin-raw (configured in vite.config.ts), which
// inlines the file's contents as a default-exported string at build time.
import grammar from "../grammar.ohm?raw";

export default grammar;
