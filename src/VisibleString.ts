import { LocalSimpleStringBlockParams, LocalSimpleStringBlock, LocalSimpleStringBlockJson } from "./internals/LocalSimpleStringBlock.ts";
import { ETagClass, EUniversalTagNumber, typeStore } from "./TypeStore.ts";

export type VisibleStringParams = LocalSimpleStringBlockParams;
export type VisibleStringJson = LocalSimpleStringBlockJson;

export class VisibleString extends LocalSimpleStringBlock {

  static {
    typeStore.VisibleString = this;
  }

  public static override NAME = "VisibleString";
  public static override defaultIDs = {tagClass: ETagClass.UNIVERSAL, tagNumber: EUniversalTagNumber.VisibleString};

  constructor(parameters: VisibleStringParams = {}) {
    VisibleString.mergeIDBlock(parameters, VisibleString.defaultIDs);
    super(parameters);
  }

  /**
   * A typeguard that allows to validate if a certain asn1.js object is of our type
   *
   * @param obj The object we want to match against the type of this class
   * @returns true if obj is of the same type as our class
   */
  public static typeGuard(obj: unknown | undefined): obj is VisibleString {
    if (!obj)
      return false;
    return this.matches(obj);
  }

}
