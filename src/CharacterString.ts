import { LocalSimpleStringBlockParams, LocalSimpleStringBlock, LocalSimpleStringBlockJson } from "./internals/LocalSimpleStringBlock";
import { ETagClass, EUniversalTagNumber, typeStore } from "./TypeStore";

export type CharacterStringParams = LocalSimpleStringBlockParams;
export type CharacterStringJson = LocalSimpleStringBlockJson;

export class CharacterString extends LocalSimpleStringBlock {

  static {
    typeStore.CharacterString = this;
  }

  public static override NAME = "CharacterString";
  public static override defaultIDs = {tagClass: ETagClass.UNIVERSAL, tagNumber: EUniversalTagNumber.CharacterString};

  constructor(parameters: CharacterStringParams = {}) {
    CharacterString.mergeIDBlock(parameters, CharacterString.defaultIDs);
    super(parameters);
  }

  /**
   * A typeguard that allows to validate if a certain asn1.js object is of our type
   *
   * @param obj The object we want to match against the type of this class
   * @returns true if obj is of the same type as our class
   */
  public static typeGuard(obj: unknown | undefined): obj is CharacterString {
    return this.matches(obj);
  }

}
