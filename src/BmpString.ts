import { LocalBmpStringValueBlockParams, LocalBmpStringValueBlock, LocalBmpStringValueBlockJson } from "./internals/LocalBmpStringValueBlock.ts";
import { IBaseIDs } from "./internals/LocalIdentificationBlock.ts";
import { ETagClass, EUniversalTagNumber, typeStore } from "./TypeStore.ts";

export type BmpStringParams = LocalBmpStringValueBlockParams;
export type BmpStringJson = LocalBmpStringValueBlockJson;

export class BmpString extends LocalBmpStringValueBlock {

  static {
    typeStore.BmpString = this;
  }
  public static override NAME = "BMPString";
  public static override defaultIDs: IBaseIDs = {tagClass: ETagClass.UNIVERSAL, tagNumber: EUniversalTagNumber.BmpString};

  constructor(parameters: BmpStringParams = {}) {
    BmpString.mergeIDBlock(parameters, BmpString.defaultIDs);
    super(parameters);
  }

  /**
   * A typeguard that allows to validate if a certain asn1.js object is of our type
   *
   * @param obj The object we want to match against the type of this class
   * @returns true if obj is of the same type as our class
   */
  public static typeGuard(obj: unknown | undefined): obj is BmpString {
    return this.matches(obj);
  }

}
