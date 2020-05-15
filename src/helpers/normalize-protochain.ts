/**
 * Map webidl definition names to prototype chain parent
 * ex. Console -> console
 *
 * This helps generate protoChain's and protoChainId's
 * ex. Console.log -> console.log
 */
export default function interceptAndNormalize(parentObjectId: string): string {
  const apisToLowercase = new Set([
    "Console",
    "Window",
    "Document",
    "External",
    "History",
    "Location",
    "Navigator",
    "Performance",
    "Screen",
    "defaultStatus",
    "Controllers",
  ]);

  return apisToLowercase.has(parentObjectId)
    ? parentObjectId.toLowerCase()
    : parentObjectId;
}
