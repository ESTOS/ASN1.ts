import { IAny, Any } from "./Any.ts";
import { BaseBlock } from "./BaseBlock.ts";
import { ILocalIdentificationBlockParams, LocalIdentificationBlock } from "./internals/LocalIdentificationBlock.ts";
import { SequenceOf } from "./SequenceOf.ts";
import { SetOf } from "./SetOf.ts";

export interface IChoice extends IAny {
  value: (BaseBlock | SequenceOf | SetOf | Choice)[];
}

export interface ChoiceParams extends ILocalIdentificationBlockParams, Partial<IChoice> {
}

/**
 * A Choice is only used while schema validation
 * In that case the choice takes the place of a list of possible options while verifying a schema
 */
export class Choice extends Any implements IChoice {
  public value: (BaseBlock | SequenceOf | SetOf | Choice)[];
  public idBlock: LocalIdentificationBlock;

  constructor({
    value = [],
    ...parameters
  }: ChoiceParams = {}) {
    super(parameters);

    /** If the property is not explicitly defined as optional it may also be defined as optional with defining of the optionalID */
    if(parameters.idBlock?.optionalID !== undefined && parameters.idBlock.optionalID >= 0)
      this.optional = true;

    this.idBlock = new LocalIdentificationBlock(parameters);

    this.value = value;
  }

}
