import { LocalSimpleStringBlockParams, LocalSimpleStringBlock, LocalSimpleStringBlockJson } from "./internals/LocalSimpleStringBlock";
import { ETagClass, EUniversalTagNumber, typeStore } from "./TypeStore";

export type VisibleStringParams = LocalSimpleStringBlockParams;
export type VisibleStringJson = LocalSimpleStringBlockJson;

export class VisibleString extends LocalSimpleStringBlock {

  static {
    typeStore.VisibleString = this;
  }

  public static override NAME = "VisibleString";
  public static override defaultIDs = {tagClass: ETagClass.UNIVERSAL, tagNumber: EUniversalTagNumber.VisibleString};

  constructor(parameters: VisibleStringParams = {}) {
    super(parameters);

    this.idBlock.tagClass = VisibleString.defaultIDs.tagClass;
    this.idBlock.tagNumber = VisibleString.defaultIDs.tagNumber;
  }

}
