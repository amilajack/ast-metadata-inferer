import Compat from "../src/compat";

jest.setTimeout(process.env.CI ? 600_000 : 60_000);

describe("Compat", () => {
  it("should write compat records to each api record", async () => {
    const [record, ...records] = await Compat();
    const recordsCount = records.length + 1;
    expect(recordsCount).toBeGreaterThanOrEqual(3_900);
    if (process.env.DEBUG === "true") {
      console.log(`${recordsCount} records in compat.json`);
    }
    expect(record).toHaveProperty("kind");
    expect(record).toHaveProperty("language");
    expect(record).toHaveProperty("protoChain");
    expect(record).toHaveProperty("protoChainId");
    expect(record).toHaveProperty("astNodeTypes");
    expect(record).toHaveProperty("isStatic");
    expect(record).toMatchSnapshot();

    records.forEach((_record) => {
      expect(_record).toHaveProperty("kind");
      expect(_record).toHaveProperty("language");
      expect(_record).toHaveProperty("protoChain");
      expect(_record).toHaveProperty("protoChainId");
      expect(_record).toHaveProperty("astNodeTypes");
      expect(_record).toHaveProperty("isStatic");
      expect(_record).toHaveProperty("compat");
      // Test the properties of non-deprecated APIs
      if (_record.compat?.status && !_record.compat.status.deprecated) {
        expect(_record).toHaveProperty("compat.support");
        expect(_record).toHaveProperty("compat.status");
      }
    });
  });
});
