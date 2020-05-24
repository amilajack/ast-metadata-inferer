// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import microsoftAPICatalog from "./microsoft-api-catalog-data.json";
import HasPrefix from "../../helpers/has-prefix";
import interceptAndFormat from "../../helpers/normalize-protochain";
import { ApiMetadata, Language } from "../../types";

type MicrosoftAPICatalogProviderRecord = {
  name: string;
  spec: boolean;
  specNames: Array<string>;
  apis: MicrosoftAPICatalogProviderRecord[];
};

interface FormattedRecord extends MicrosoftAPICatalogProviderRecord {
  parentName: string;
  protoChain?: string[];
  protoChainId?: string;
  spec: boolean;
  webidlId?: string;
}

/**
 * Comvert camelcase phrases to hypen-separated words
 * ex. camelCase => camel-case
 * This is used to map CSS DOM API names to css properties and attributes
 */
export function camelCaseToHyphen(string: string): string {
  return (
    Array
      // Covert string to array
      .from(string)
      // If char `X` is uppercase, map it to `-x`
      .map(
        (curr) =>
          curr === curr.toUpperCase() ? `-${curr.toLowerCase()}` : curr,
        []
      )
      .join("")
  );
}

/**
 * @TODO: Allow overriding database records
 */
export default function MicrosoftAPICatalogProvider(): Array<ApiMetadata> {
  const formattedRecords: FormattedRecord[] = [];
  const ignoredAPIs = [
    "arguments",
    "caller",
    "constructor",
    "length",
    "name",
    "prototype",
  ];

  // Convert two dimentional records to single dimentional array
  (microsoftAPICatalog as MicrosoftAPICatalogProviderRecord[]).forEach(
    (record) => {
      formattedRecords.push({
        ...record,
        parentName: record.name,
        protoChain: [interceptAndFormat(record.name)],
        protoChainId: interceptAndFormat(record.name),
        spec: record.spec || false,
        webidlId: record.name,
      });

      record.apis.forEach((api) => {
        // @TODO: Properly strip vendor prefixes and check if non-prefixed API
        //        exists. If not, create the record for it
        formattedRecords.push({
          ...api,
          spec: record.spec || false,
          parentName: record.name,
        });
      });
    }
  );

  const JSAPIs = formattedRecords
    // Filter all CSS records. For some reason reason, MicrosoftAPICatalog does not report
    // the correctly. Validate that the record's name is a string. Some record
    // names are numbers from some odd reason
    .filter(
      (formattedRecord) =>
        !formattedRecord.name.includes("-") &&
        formattedRecord.parentName !== "CSS2Properties" &&
        Number.isNaN(parseInt(formattedRecord.name, 10)) &&
        typeof formattedRecord.spec !== "undefined"
    )
    .map((formattedRecord) => {
      const protoChain = (
        formattedRecord.protoChain || [
          interceptAndFormat(formattedRecord.parentName),
          formattedRecord.name,
        ]
      )
        // Remove 'window' from the protochain
        .filter((e) => e !== "window");

      return {
        id: formattedRecord.name,
        name: formattedRecord.name,
        specNames: formattedRecord.specNames,
        language: Language.JS,
        specIsFinished: formattedRecord.spec,
        protoChain,
        protoChainId: protoChain.join("."),
        compat: {},
      };
    })
    .filter(
      (record) =>
        record.name !== "defaultStatus" &&
        record.protoChain.length !== 0 &&
        !ignoredAPIs.includes(record.name) &&
        !HasPrefix(record.name) &&
        !HasPrefix(record.protoChainId) &&
        !HasPrefix(record.id)
    );

  // Find the CSS DOM API's and use them create the css style records
  // const CSSAPIs = JSAPIs
  //   .filter(record => record.protoChain.includes('CSSStyleDeclaration'))
  //   .map(record => ({
  //     ...record,
  //     id: camelCaseToHyphen(record.name),
  //     name: camelCaseToHyphen(record.name),
  //   }));

  // return [...CSSAPIs, ...JSAPIs];

  return JSAPIs;
}
