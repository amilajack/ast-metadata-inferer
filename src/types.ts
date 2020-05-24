import { CompatStatement } from "mdn-browser-compat-data/types";

export type ApiMetadata<T = Language.JS> = {
  id: string;
  name: string;
  language: T;
  kind: APIKind;
  protoChain: Array<string>;
  protoChainId: string;
  compat: CompatStatement;
};

export type CssApiMetadata = ApiMetadata<Language.CSS>;

export type JsApiMetadata = ApiMetadata<Language.JS>;

export enum Language {
  JS = "js-api",
  CSS = "css-api",
}

export enum APIKind {
  Web = "web",
  ES = "es",
}
