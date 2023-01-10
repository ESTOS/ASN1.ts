import { IAny, Any } from "./Any";
import { BaseBlock } from "./BaseBlock";
import { ILocalIdentificationBlockParams, LocalIdentificationBlock } from "./internals/LocalIdentificationBlock";
import { SequenceOf } from "./SequenceOf";
import { SetOf } from "./SetOf";

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
