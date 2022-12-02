import { LocalSimpleStringBlockParams, LocalSimpleStringBlock, LocalSimpleStringBlockJson } from "./internals/LocalSimpleStringBlock";
import { ETagClass, EUniversalTagNumber, typeStore } from "./TypeStore";

export type VideotexStringParams = LocalSimpleStringBlockParams;
export type VideotexStringJson = LocalSimpleStringBlockJson;

export class VideotexString extends LocalSimpleStringBlock {

  static {
    typeStore.VideotexString = this;
  }

  public static override NAME = "VideotexString";
  public static override defaultIDs = {tagClass: ETagClass.UNIVERSAL, tagNumber: EUniversalTagNumber.VideotexString};

  constructor(parameters: VideotexStringParams = {}) {
    VideotexString.mergeIDBlock(parameters, VideotexString.defaultIDs);
    super(parameters);
  }

  /**
   * A typeguard that allows to validate if a certain asn1.js object is of our type
   *
   * @param obj The object we want to match against the type of this class
   * @returns true if obj is of the same type as our class
   */
  public static typeGuard(obj: unknown | undefined): obj is VideotexString {
    return this.matches(obj);
  }

}
