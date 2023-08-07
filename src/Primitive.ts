import { BaseBlock, BaseBlockJson, BaseBlockParams } from "./BaseBlock.ts";
import { LocalPrimitiveValueBlock, LocalPrimitiveValueBlockJson, LocalPrimitiveValueBlockParams } from "./internals/LocalPrimitiveValueBlock.ts";
import { typeStore } from "./TypeStore.ts";

export interface PrimitiveParams extends BaseBlockParams, LocalPrimitiveValueBlockParams { }
export type PrimitiveJson = BaseBlockJson<LocalPrimitiveValueBlockJson>;

export class Primitive extends BaseBlock<LocalPrimitiveValueBlock, LocalPrimitiveValueBlockJson> {

  static {
    typeStore.Primitive = this;
  }

  public static override NAME = "PRIMITIVE";

  constructor(parameters: PrimitiveParams = {}) {
    super(parameters, LocalPrimitiveValueBlock);

    this.idBlock.isConstructed = false;
  }

  public getValue(): null {
    return null;
  }

  public setValue(value: number): void {
  }

}
