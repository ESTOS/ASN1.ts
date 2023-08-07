import { IBerConvertible } from "./types.ts";
import * as internals from "./internals/LocalBaseBlock.ts";
import { ViewWriter } from "./ViewWriter.ts";

export type IValueBlock = internals.ILocalBaseBlock;
export type ValueBlockParams = internals.LocalBaseBlockParams;
export type ValueBlockJson = internals.LocalBaseBlockJson;

export class ValueBlock extends internals.LocalBaseBlock implements IValueBlock, IBerConvertible {

  public static override NAME = "valueBlock";

  public fromBER(inputBuffer: ArrayBuffer | Uint8Array, inputOffset: number, inputLength: number): number {
    throw TypeError("User need to make a specific function in a class which extends 'ValueBlock'");
  }

  public toBER(sizeOnly?: boolean, writer?: ViewWriter): ArrayBuffer {
    throw TypeError("User need to make a specific function in a class which extends 'ValueBlock'");
  }

}
