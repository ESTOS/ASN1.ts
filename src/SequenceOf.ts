import { IAny, Any } from "./Any.ts";
import { ILocalIdentificationBlockParams, LocalIdentificationBlock } from "./internals/LocalIdentificationBlock.ts";
import { ETagClass, EUniversalTagNumber } from "./TypeStore.ts";

export interface ISequenceOf extends IAny {
  value: Any;
  local: boolean;
}

export interface SequenceOfParams extends ILocalIdentificationBlockParams, Partial<ISequenceOf> {
}

export class SequenceOf extends Any {

  public value: Any;
  public local: boolean;
  public idBlock: LocalIdentificationBlock;

  constructor({
    value = new Any(),
    local = false,
    ...parameters
  }: SequenceOfParams = {}) {
    super(parameters);

    /** If the property is not explicitly defined as optional it may also be defined as optional with defining of the optionalID */
    if(parameters.idBlock?.optionalID !== undefined && parameters.idBlock.optionalID >= 0)
      this.optional = true;

    if(!parameters.idBlock)
      parameters.idBlock = {};
    parameters.idBlock.tagNumber = EUniversalTagNumber.Sequence;
    parameters.idBlock.tagClass = ETagClass.UNIVERSAL;

    this.idBlock = new LocalIdentificationBlock(parameters);

    this.value = value;
    this.local = local; /** Could local or global array to store elements */
  }

}
