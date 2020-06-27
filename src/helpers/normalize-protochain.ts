/**
 * Map webidl definition names to prototype chain parent
 * ex. Console -> console
 *
 * This helps generate protoChain's and protoChainId's
 * ex. Console.log -> console.log
 */
export default function interceptAndNormalize(parentObjectId: string): string {
  // Mapping WebIdl names to their actual representation
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

  // Mapping WebIdl names to actual names
  const apiMappings = new Map([
    ["NavigatorConcurrentHardware", "navigator"],
    ["NavigatorID", "navigator"],
    ["NavigatorLanguage", "navigator"],
    ["NavigatorOnLine", "navigator"],
    ["NavigatorPlugins", "navigator"],
    ["NavigatorStorage", "navigator"],
  ]);

  if (apiMappings.has(parentObjectId)) {
    return apiMappings.get(parentObjectId) as string;
  }

  return apisToLowercase.has(parentObjectId)
    ? parentObjectId.toLowerCase()
    : parentObjectId;
}
