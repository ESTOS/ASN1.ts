import { BaseBlock, BaseBlockJson, BaseBlockParams } from "./BaseBlock.ts";
import { LocalObjectIdentifierValueBlockParams, LocalObjectIdentifierValueBlock, LocalObjectIdentifierValueBlockJson } from "./internals/LocalObjectIdentifierValueBlock.ts";
import { ETagClass, EUniversalTagNumber, typeStore } from "./TypeStore.ts";

export interface ObjectIdentifierParams extends BaseBlockParams, LocalObjectIdentifierValueBlockParams { }
export interface ObjectIdentifierJson extends BaseBlockJson<LocalObjectIdentifierValueBlockJson> {
  value: string;
}

export class ObjectIdentifier extends BaseBlock<LocalObjectIdentifierValueBlock, LocalObjectIdentifierValueBlockJson> {

  static {
    typeStore.ObjectIdentifier = this;
  }

  public static override NAME = "OBJECT IDENTIFIER";
  public static override defaultIDs = {tagClass: ETagClass.UNIVERSAL, tagNumber: EUniversalTagNumber.ObjectIdentifier};

  /**
   * Gets string representation of Object Identifier
   * @since 3.0.0
   */
  public getValue(): string {
    return this.valueBlock.toString();
  }

  /**
   * Sets Object Identifier value from string
   * @param value String value
   * @since 3.0.0
   */
  public setValue(value: string): void {
    this.valueBlock.fromString(value);
  }

  constructor(parameters: ObjectIdentifierParams = {}) {
    ObjectIdentifier.mergeIDBlock(parameters, ObjectIdentifier.defaultIDs);
    super(parameters, LocalObjectIdentifierValueBlock);
  }

  protected override onAsciiEncoding(): string {
    return `${(this.constructor as typeof ObjectIdentifier).NAME} : ${this.valueBlock.toString() || "empty"}`;
  }

  public override toJSON(): ObjectIdentifierJson {
    return {
      ...super.toJSON(),
      value: this.getValue(),
    };
  }

  /**
   * A typeguard that allows to validate if a certain asn1.js object is of our type
   *
   * @param obj The object we want to match against the type of this class
   * @returns true if obj is of the same type as our class
   */
  public static typeGuard(obj: unknown | undefined): obj is ObjectIdentifier {
    return this.matches(obj);
  }

}
