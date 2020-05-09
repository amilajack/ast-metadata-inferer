/* eslint global-require: off, no-console: off */
import fs from "fs";
import path from "path";
import AstMetadataInferer from "../src";

jest.setTimeout(60000);

describe("AstMetadataInferer", () => {
  it("should return basic output", async () => {
    const [record, ...records] = await AstMetadataInferer();
    expect(record).toHaveProperty("apiType");
    expect(record).toHaveProperty("type");
    expect(record).toHaveProperty("protoChain");
    expect(record).toHaveProperty("protoChainId");
    expect(record).toHaveProperty("astNodeTypes");
    expect(record).toHaveProperty("isStatic");
    expect(record).toMatchSnapshot();

    records.forEach((_record) => {
      expect(_record).toHaveProperty("apiType");
      expect(_record).toHaveProperty("type");
      expect(_record).toHaveProperty("protoChain");
      expect(_record).toHaveProperty("protoChainId");
      expect(_record).toHaveProperty("astNodeTypes");
      expect(_record).toHaveProperty("isStatic");
    });
  });

  it("should write to metadata.json correctly", async () => {
    const filepath = path.join(__dirname, "..", "metadata.json");
    const file = await fs.promises.readFile(filepath);

    expect(JSON.parse(file.toString())[0]).toMatchSnapshot();
    const recordsCount = JSON.parse(file.toString()).length;
    expect(recordsCount).toBeGreaterThanOrEqual(5000);

    console.log(`${recordsCount} records in metadata.json`);

    const AstMetadata = require("../metadata");
    expect(AstMetadata).toHaveLength(recordsCount);
  });

  it("should expose metadata.json in parsable format", () => {
    const AstMetadata = require("../metadata");
    const querySelectorRecord = AstMetadata.find(
      (record) => record.protoChainId === "document.querySelector"
    );
    expect(querySelectorRecord).toMatchSnapshot();
  });
});
