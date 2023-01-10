import { IAny, Any } from "./Any";
import { ILocalIdentificationBlockParams, LocalIdentificationBlock } from "./internals/LocalIdentificationBlock";
import { ETagClass, EUniversalTagNumber } from "./TypeStore";

export interface ISetOf extends IAny {
  value: Any;
  local: boolean;
}

export interface SetOfParams extends ILocalIdentificationBlockParams, Partial<ISetOf> {
}

export class SetOf extends Any {

  public value: Any;
  public local: boolean;
  public idBlock: LocalIdentificationBlock;

  constructor({
    value = new Any(),
    local = false,
    ...parameters
  }: SetOfParams = {}) {
    super(parameters);

    /** If the property is not explicitly defined as optional it may also be defined as optional with defining of the optionalID */
    if(parameters.idBlock?.optionalID !== undefined && parameters.idBlock.optionalID >= 0)
      this.optional = true;

    if(!parameters.idBlock)
      parameters.idBlock = {};
    parameters.idBlock.tagNumber = EUniversalTagNumber.Set;
    parameters.idBlock.tagClass = ETagClass.UNIVERSAL;

    this.idBlock = new LocalIdentificationBlock(parameters);

    this.value = value;
    this.local = local; /** Could local or global array to store elements */
  }

}
