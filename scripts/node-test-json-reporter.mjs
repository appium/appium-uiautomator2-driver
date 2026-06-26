/**
 * Emits Node test runner events as newline-delimited JSON for shell-friendly post-processing.
 */
export default async function* jsonReporter(source) {
  for await (const event of source) {
    yield `${JSON.stringify(event)}\n`;
  }
}
