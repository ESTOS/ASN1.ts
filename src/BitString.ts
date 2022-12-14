import { BaseBlock, BaseBlockJson, BaseBlockParams } from "./BaseBlock";
import { Constructed } from "./Constructed";
import { BIT_STRING_NAME } from "./internals/constants";
import { LocalBitStringValueBlockParams, LocalBitStringValueBlock, LocalBitStringValueBlockJson } from "./internals/LocalBitStringValueBlock";
import { IBaseIDs } from "./internals/LocalIdentificationBlock";
import { ETagClass, EUniversalTagNumber, typeStore } from "./TypeStore";

export interface BitStringParams extends BaseBlockParams, LocalBitStringValueBlockParams { }
export type BitStringJson = BaseBlockJson<LocalBitStringValueBlockJson>;

export class BitString extends BaseBlock<LocalBitStringValueBlock, LocalBitStringValueBlockJson> {

  static {
    typeStore.BitString = this;
  }

  public static override NAME = BIT_STRING_NAME;
  public static override defaultIDs: IBaseIDs = {tagClass: ETagClass.UNIVERSAL, tagNumber: EUniversalTagNumber.BitString};

  constructor(parameters: BitStringParams = {}) {
    parameters.isConstructed ??= !!parameters.value?.length;
    parameters.idBlock = {isConstructed: parameters.isConstructed};
    parameters.lenBlock = {isIndefiniteForm: !!parameters.isIndefiniteForm};
    BitString.mergeIDBlock(parameters, BitString.defaultIDs);
    super(parameters, LocalBitStringValueBlock);
  }

  public override fromBER(inputBuffer: ArrayBuffer | Uint8Array, inputOffset: number, inputLength: number): number {
    this.valueBlock.isConstructed = this.idBlock.isConstructed;
    this.valueBlock.isIndefiniteForm = this.lenBlock.isIndefiniteForm;

    return super.fromBER(inputBuffer, inputOffset, inputLength);
  }

  protected override onAsciiEncoding(): string {
    if (this.valueBlock.isConstructed || (this.valueBlock.value && this.valueBlock.value.length)) {
      return Constructed.prototype.onAsciiEncoding.call(this);
    } else {
      /** convert bytes to bits */
      const bits = [];
      const valueHex = this.valueBlock.valueHexView;
      for (const byte of valueHex) {
        bits.push(byte.toString(2).padStart(8, "0"));
      }

      const bitsStr = bits.join("");

      return `${(this.constructor as typeof BitString).NAME} : ${bitsStr.substring(0, bitsStr.length - this.valueBlock.unusedBits)}`;
    }
  }

  /**
   * A typeguard that allows to validate if a certain asn1.js object is of our type
   *
   * @param obj The object we want to match against the type of this class
   * @returns true if obj is of the same type as our class
   */
  public static typeGuard(obj: unknown | undefined): obj is BitString {
    return this.matches(obj);
  }

}
