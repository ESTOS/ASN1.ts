import { LocalUniversalStringValueBlockParams, LocalUniversalStringValueBlock, LocalUniversalStringValueBlockJson } from "./internals/LocalUniversalStringValueBlockParams.ts";
import { ETagClass, EUniversalTagNumber, typeStore } from "./TypeStore.ts";

export type UniversalStringParams = LocalUniversalStringValueBlockParams;
export type UniversalStringJson = LocalUniversalStringValueBlockJson;

export class UniversalString extends LocalUniversalStringValueBlock {

  static {
    typeStore.UniversalString = this;
  }

  public static override NAME = "UniversalString";
  public static override defaultIDs = {tagClass: ETagClass.UNIVERSAL, tagNumber: EUniversalTagNumber.UniversalString};

  constructor(parameters: UniversalStringParams = {}) {
    UniversalString.mergeIDBlock(parameters, UniversalString.defaultIDs);
    super(parameters);
  }

  /**
   * A typeguard that allows to validate if a certain asn1.js object is of our type
   *
   * @param obj The object we want to match against the type of this class
   * @returns true if obj is of the same type as our class
   */
  public static typeGuard(obj: unknown | undefined): obj is UniversalString {
    return this.matches(obj);
  }

}
