import { ConstructedParams, Constructed, ConstructedJson } from "./Constructed.ts";
import { ETagClass, EUniversalTagNumber, typeStore } from "./TypeStore.ts";

export type SetParams = ConstructedParams;
export type SetJson = ConstructedJson;

export class Set extends Constructed {

  static {
    typeStore.Set = this;
  }

  public static override NAME = "SET";
  public static override defaultIDs = {tagClass: ETagClass.UNIVERSAL, tagNumber: EUniversalTagNumber.Set};

  constructor(parameters: SetParams = {}) {
    Set.mergeIDBlock(parameters, Set.defaultIDs);
    super(parameters);
  }

  /**
   * A typeguard that allows to validate if a certain asn1.js object is of our type
   *
   * @param obj The object we want to match against the type of this class
   * @returns true if obj is of the same type as our class
   */
  public static typeGuard(obj: unknown | undefined): obj is Set {
    return this.matches(obj);
  }

}
