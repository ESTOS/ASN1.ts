import { LocalSimpleStringBlockParams, LocalSimpleStringBlock, LocalSimpleStringBlockJson } from "./internals/LocalSimpleStringBlock.ts";
import { ETagClass, EUniversalTagNumber, typeStore } from "./TypeStore.ts";

export type NumericStringParams = LocalSimpleStringBlockParams;
export type NumericStringJson = LocalSimpleStringBlockJson;

export class NumericString extends LocalSimpleStringBlock {

  static {
    typeStore.NumericString = this;
  }

  public static override NAME = "NumericString";
  public static override defaultIDs = {tagClass: ETagClass.UNIVERSAL, tagNumber: EUniversalTagNumber.NumericString};

  constructor(parameters: NumericStringParams = {}) {
    NumericString.mergeIDBlock(parameters, NumericString.defaultIDs);
    super(parameters);
  }

  /**
   * A typeguard that allows to validate if a certain asn1.js object is of our type
   *
   * @param obj The object we want to match against the type of this class
   * @returns true if obj is of the same type as our class
   */
  public static typeGuard(obj: unknown | undefined): obj is NumericString {
    return this.matches(obj);
  }

}
