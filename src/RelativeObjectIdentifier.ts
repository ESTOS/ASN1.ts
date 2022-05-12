import { BaseBlock, BaseBlockJson, BaseBlockParams } from "./BaseBlock";
import { LocalRelativeObjectIdentifierValueBlockParams, LocalRelativeObjectIdentifierValueBlock, LocalRelativeObjectIdentifierValueBlockJson } from "./internals/LocalRelativeObjectIdentifierValueBlock";
import { typeStore } from "./TypeStore";


export interface RelativeObjectIdentifierParams extends BaseBlockParams, LocalRelativeObjectIdentifierValueBlockParams { }
export interface RelativeObjectIdentifierJson extends BaseBlockJson<LocalRelativeObjectIdentifierValueBlockJson> {
  value: string;
}

export class RelativeObjectIdentifier extends BaseBlock<LocalRelativeObjectIdentifierValueBlock, LocalRelativeObjectIdentifierValueBlockJson> {

  static {
    typeStore.RelativeObjectIdentifier = this;
  }

  /**
   * Gets string representation of Relative Object Identifier
   * @since 3.0.0
   */
  public get value(): string {
    return this.valueBlock.toString();
  }

  public static override NAME = "RelativeObjectIdentifier";

  constructor(parameters: RelativeObjectIdentifierParams = {}) {
    super(parameters, LocalRelativeObjectIdentifierValueBlock);

    this.idBlock.tagClass = 1; // UNIVERSAL
    this.idBlock.tagNumber = 13; // RELATIVE OBJECT IDENTIFIER
  }

  protected override onAsciiEncoding(): string {
    return `${(this.constructor as typeof RelativeObjectIdentifier).NAME} : ${this.valueBlock.toString() || "empty"}`;
  }

  public override toJSON(): RelativeObjectIdentifierJson {
    return {
      ...super.toJSON(),
      value: this.value,
    };
  }

}
