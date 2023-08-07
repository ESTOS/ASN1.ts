/* eslint-disable @typescript-eslint/ban-ts-comment */
import { HexBlock, HexBlockJson, HexBlockParams } from "../HexBlock.ts";
import { ValueBlock, ValueBlockJson, ValueBlockParams } from "../ValueBlock.ts";

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

export interface LocalPrimitiveValueBlock {
  /**
   * @deprecated since version 3.0.0
   */
  // @ts-ignore
  valueBeforeDecode: ArrayBuffer;
  /**
   * Binary data in ArrayBuffer representation
   *
   * @deprecated since version 3.0.0
   */
  // @ts-ignore
  valueHex: ArrayBuffer;
}
