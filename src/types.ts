import { CompatStatement } from "mdn-browser-compat-data/types";

export enum AstNodeTypes {
  MemberExpression = "MemberExpression",
  CallExpression = "CallExpression",
  NewExpression = "NewExpression",
}

export type ProviderApiMetadata<T = Language.JS> = {
  id: string;
  name: string;
  language: T;
  kind: APIKind;
  protoChain: Array<string>;
  protoChainId: string;
  compat: CompatStatement;
};

export interface ApiMetadata<T = Language.JS> extends ProviderApiMetadata<T> {
  astNodetypes: AstNodeTypes[];
  isBoolean: boolean;
}

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
