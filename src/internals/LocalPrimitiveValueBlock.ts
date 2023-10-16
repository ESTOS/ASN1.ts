/* eslint-disable @typescript-eslint/ban-ts-comment */
import { HexBlock, HexBlockJson, HexBlockParams } from "../HexBlock";
import { ValueBlock, ValueBlockJson, ValueBlockParams } from "../ValueBlock";

export interface LocalPrimitiveValueBlockParams extends HexBlockParams, ValueBlockParams { }
export interface LocalPrimitiveValueBlockJson extends HexBlockJson, ValueBlockJson { }

export class LocalPrimitiveValueBlock extends HexBlock(ValueBlock) {

  public static override NAME = "PrimitiveValueBlock";

  constructor({
    isHexOnly = true,
    ...parameters
  }: LocalPrimitiveValueBlockParams = {}) {
    super(parameters);

    this.isHexOnly = isHexOnly;
  }

}
