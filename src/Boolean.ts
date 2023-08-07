import { BaseBlock, BaseBlockJson, BaseBlockParams } from "./BaseBlock.ts";
import { LocalBooleanValueBlockParams, LocalBooleanValueBlock, LocalBooleanValueBlockJson } from "./internals/LocalBooleanValueBlock.ts";
import { IBaseIDs } from "./internals/LocalIdentificationBlock.ts";
import { ETagClass, EUniversalTagNumber, typeStore } from "./TypeStore.ts";

export interface BooleanParams extends BaseBlockParams, LocalBooleanValueBlockParams { }
export type BooleanJson = BaseBlockJson<LocalBooleanValueBlockJson>;

export class Boolean extends BaseBlock<LocalBooleanValueBlock, LocalBooleanValueBlockJson> {

  static {
    typeStore.Boolean = this;
  }

  /**
   * Gets value
   *
   * @since 3.0.0
   * @returns the boolean value
   */
  public getValue(): boolean {
    return this.valueBlock.value;
  }
  /**
   * Sets value
   *
   * @param value Boolean value to set
   * @since 3.0.0
   */
  public setValue(value: boolean): void {
    this.valueBlock.value = value;
  }

  public static override NAME = "BOOLEAN";
  public static override defaultIDs: IBaseIDs = {tagClass: ETagClass.UNIVERSAL, tagNumber: EUniversalTagNumber.Boolean};

  constructor(parameters: BooleanParams = {}) {
    Boolean.mergeIDBlock(parameters, Boolean.defaultIDs);
    super(parameters, LocalBooleanValueBlock);
  }

  protected override onAsciiEncoding(): string {
    return `${(this.constructor as typeof Boolean).NAME} : ${this.getValue}`;
  }

  /**
   * A typeguard that allows to validate if a certain asn1.js object is of our type
   *
   * @param obj The object we want to match against the type of this class
   * @returns true if obj is of the same type as our class
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  public static typeGuard(obj: unknown | undefined): obj is Boolean {
    return this.matches(obj);
  }

}
