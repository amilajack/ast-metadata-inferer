import interceptAndNormalize from "../src/helpers/normalize-protochain";

describe("Helpers", () => {
  it("should map APIs to correct protochain", () => {
    expect(interceptAndNormalize("NavigatorPlugins")).toEqual("navigator");
  });
});
