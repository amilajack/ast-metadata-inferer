/* eslint @typescript-eslint/ban-ts-ignore: off */
import Nightmare from "nightmare";
import { ApiMetadata, Language, CssApiMetadata, JsApiMetadata } from "../types";

function formatJSAssertion(record: ApiMetadata): string {
  const remainingProtoObject = record.protoChain.filter((_, i) => i > 0);
  const formattedStaticProtoChain = record.protoChain.join(".");
  const lowercaseParentObject = record.protoChain[0].toLowerCase();

  const exceptions = new Set(["crypto", "Crypto"]);

  const lowercaseTestCondition = String(
    lowercaseParentObject !== "function" &&
      !exceptions.has(record.protoChain[0])
  );

  const lowercaseSupportTest = `
    if (${lowercaseTestCondition}) {
      ${
        lowercaseParentObject === "function" ||
        lowercaseParentObject === record.protoChain[0]
          ? ""
          : `if (typeof ${lowercaseParentObject} !== 'undefined') {
          throw new Error('${record.protoChain[0]} is not supported but ${lowercaseParentObject} is supported')
        }`
      }
    }
  `;

  return `
    (function () {
      ${lowercaseSupportTest}
      try {
        // a
        if (typeof window === 'undefined') { return false }
        // a
        if (typeof ${record.protoChain[0]} === 'undefined') { return false }
        // a.b
        if (typeof ${formattedStaticProtoChain} !== 'undefined')  { return true }
        // a.prototype.b
        if (typeof ${record.protoChain[0]}.prototype !== 'undefined') {
          if (${remainingProtoObject.length} === 0) { return false }
          return typeof ${[record.protoChain[0], "prototype"]
            .concat(remainingProtoObject)
            .join(".")} !== 'undefined'
        }
        return false
      } catch (e) {
        // TypeError thrown on property access and all prototypes are defined,
        // item usually experiences getter error
        // Ex. HTMLInputElement.prototype.indeterminate
        // -> 'The HTMLInputElement.indeterminate getter can only be used on instances of HTMLInputElement'
        return (e instanceof TypeError)
      }
    })()
  `;
}

/**
 * Takes a `protoChain` and returns bool if supported. Should only be run if
 * supported. Evaluation returns true if defined
 *
 * ex. ['Array', 'push'] => false
 * ex. ['document', 'querySelector'] => true
 */
function determineIsStatic(record: ApiMetadata): string {
  return `
    (function () {
      try {
        var protoChainIdType = typeof ${record.protoChain.join(".")}
        return protoChainIdType !== 'undefined'
      } catch (e) {
        return e instanceof TypeError
      }
    })()
  `;
}

/**
 * Create assertion to check if a CSS property is supported
 * @TODO: Support checking if API is 'prefixed'
 */
function formatCSSAssertion(record: CssApiMetadata): string {
  const cssPropertyName = record.protoChain[record.protoChain.length - 1];
  return `
    (function () {
      // Check CSS properties
      var properties = document.body.style
      if ('${cssPropertyName}' in properties) return true
      // Check CSS values
      var values = document.createElement('div').style;
      if ('${cssPropertyName}' in values) return true
      return false
    })()
  `;
}

function determineASTNodeTypes(record: JsApiMetadata): string {
  const api = record.protoChain.join(".");
  const { length } = record.protoChain;

  return `
    (function() {
      var items = []
      if (${length} === 1 && typeof ${api} === 'function') {
        try {
          ${api}()
          items.push('CallExpression')
        } catch (e) {
          if (!e.message.includes("Please use the 'new' operator")) {
            items.push('CallExpression')
          }
        }
        try {
          new ${api}
          items.push('NewExpression')
        } catch (e) {
          if (!e.message.includes('not a constructor')) {
            items.push('NewExpression')
          }
        }
      }
      else {
        items.push('MemberExpression')
      }
      return items
    })()
  `;
}

/**
 * Get all the supported css values. Evaluation will return an array of camel-cased
 * values.
 */
function getAllSupportCSSValues(): string {
  return `
    (function () {
      var styles = document.createElement('div').style;
      var stylesList = []
      for (var style in styles) {
        stylesList.push(style)
      }
      return stylesList
    })()
  `;
}

/**
 * Get all the supported css properties. Evaluation will return an array of
 * camel-cased properties.
 */
function getAllSupportCSSProperties(): string {
  return `
    (function () {
      var properties = document.body.style
      var stylesList = []
      for (var property in properties) {
        stylesList.push(property)
      }
      return stylesList
    })()
  `;
}

type CSSAssertions = {
  language: Language;
  apiIsSupported: string;
  allCSSValues: string;
  allCSSProperties: string;
};

type JSAssertions = {
  language: Language;
  apiIsSupported: string;
  determineASTNodeTypes: string;
  determineIsStatic: string;
};

export function getsCssAssertions(api: CssApiMetadata): CSSAssertions {
  return {
    language: Language.CSS,
    apiIsSupported: formatCSSAssertion(api),
    allCSSValues: getAllSupportCSSValues(),
    allCSSProperties: getAllSupportCSSProperties(),
  };
}
export function getJsAssertions(api: JsApiMetadata): JSAssertions {
  return {
    language: Language.CSS,
    apiIsSupported: formatJSAssertion(api),
    determineASTNodeTypes: determineASTNodeTypes(api),
    determineIsStatic: determineIsStatic(api),
  };
}

/**
 * @HACK: Tests wont run unless the tests are parallelized across browsers
 *        This is a temporary solution that creates two browser sessions and
 *        runs tests on them
 */
function parallelizeBrowserTests<T>(tests: string[]): Promise<T[]> {
  const middle = Math.floor(tests.length / 2);
  const config = {
    // eslint-disable-next-line global-require
    electronPath: require("electron"),
  };

  return Promise.all([
    // @ts-ignore
    Nightmare(config)
      .goto("https://example.com")
      .evaluate(
        // eslint-disable-next-line no-eval
        (compatTest: string) => eval(compatTest),
        `(function() {
          return [${tests.slice(0, middle).join(",")}];
        })()`
      )
      .end(),
    // @ts-ignore
    Nightmare(config)
      .goto("https://example.com")
      .evaluate(
        // eslint-disable-next-line no-eval
        (compatTest: string) => eval(compatTest),
        `(function() {
          return [${tests.slice(middle).join(",")}];
        })()`
      )
      .end(),
  ]).then(([first, second]) => first.concat(second));
}

interface RecordWithMetadata extends ApiMetadata {
  isStatic: boolean;
  astNodeTypes: string[];
}

export default async function astMetarataInfererTester(
  apiMetadata: Array<JsApiMetadata>
): Promise<RecordWithMetadata[]> {
  const supportedApiResults = await parallelizeBrowserTests(
    apiMetadata.map((record) => getJsAssertions(record).apiIsSupported)
  );
  const supportedApis = apiMetadata.filter((_, i) => supportedApiResults[i]);

  return Promise.all([
    parallelizeBrowserTests<string[]>(
      supportedApis.map((e) => getJsAssertions(e).determineASTNodeTypes)
    ),
    parallelizeBrowserTests<boolean>(
      supportedApis.map((e) => getJsAssertions(e).determineIsStatic)
    ),
  ]).then(([astNodeTypeTestResults, isStaticTestResults]) =>
    supportedApis.map((e, i) => ({
      ...e,
      astNodeTypes: astNodeTypeTestResults[i],
      isStatic: isStaticTestResults[i],
    }))
  );
}
