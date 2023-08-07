import { IntegerParams, Integer, IntegerJson } from "./Integer.ts";
import { ETagClass, EUniversalTagNumber, typeStore } from "./TypeStore.ts";

export type EnumeratedParams = IntegerParams;
export type EnumeratedJson = IntegerJson;

export class Enumerated extends Integer {

  static {
    typeStore.Enumerated = this;
  }

  public static override NAME = "ENUMERATED";
  public static override defaultIDs = {tagClass: ETagClass.UNIVERSAL, tagNumber: EUniversalTagNumber.Enumerated};

  constructor(parameters: EnumeratedParams = {}) {
    Enumerated.mergeIDBlock(parameters, Enumerated.defaultIDs);
    super(parameters);
  }

  /**
   * A typeguard that allows to validate if a certain asn1.js object is of our type
   *
   * @param obj The object we want to match against the type of this class
   * @returns true if obj is of the same type as our class
   */
  public static override typeGuard(obj: unknown | undefined): obj is Enumerated {
    return this.matches(obj);
  }

}
