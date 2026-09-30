import browserCompatData from "@mdn/browser-compat-data";
import mdnCompatDataProvider from "../src/providers/mdn";

describe("MDN provider", () => {
  const records = mdnCompatDataProvider();
  const recordsWithId = (protoChainId: string) =>
    records.filter((record) => record.protoChainId === protoChainId);

  it("should name static members as they are used in code", () => {
    expect(recordsWithId("AbortSignal.timeout")).toEqual([
      expect.objectContaining({
        name: "timeout",
        protoChain: ["AbortSignal", "timeout"],
        compat: browserCompatData.api.AbortSignal.timeout_static.__compat,
      }),
    ]);
    expect(
      records.filter((record) => record.protoChainId.endsWith("_static"))
    ).toEqual([]);
  });

  it("should prefer the static member when a prototype member has the same name", () => {
    expect(recordsWithId("Response.json")).toEqual([
      expect.objectContaining({
        compat: browserCompatData.api.Response.json_static.__compat,
      }),
    ]);
  });
});
