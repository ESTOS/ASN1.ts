import { ViewWriter } from "./ViewWriter";
import { ValueBlock, ValueBlockJson } from "./ValueBlock";
import { BaseBlock } from "./BaseBlock";
import { ETagClass, EUniversalTagNumber, typeStore } from "./TypeStore";

/**
 * It is possible to add a ... to the asn1 Schema for objects that are extendable (The other side may add attributes)
 * In order to handle that properly we define a dummy type inside of a schema and this dummy type tells us whether a structure may be larger than expecteed (contains a ... in the ans1 Definitions)
 *
 * This will value will never get encoded or decoded as there is no such type in any encoding
 */
export class Extension extends BaseBlock<ValueBlock, ValueBlockJson> {
  static {
    typeStore.Extension = this;
  }

  public static override NAME = "NULL";
  public static override defaultIDs = {tagClass: ETagClass.UNIVERSAL, tagNumber: EUniversalTagNumber.Extension};

  constructor() {
    super({idBlock: Extension.defaultIDs}, ValueBlock);

  }

  public getValue(): null {
    return null;
  }

  public setValue(value: number): void {
  }

  public override fromBER(inputBuffer: ArrayBuffer | Uint8Array, inputOffset: number, inputLength: number): number {
    throw new Error("An extension attribute should never get decoded... It´s just for schema validation");
  }

  public override toBER(sizeOnly?: boolean, writer?: ViewWriter): ArrayBuffer {
    throw new Error("An extension attribute should never get encoded... It´s just for schema validation");
  }

  protected override onAsciiEncoding(): string {
    return `${(this.constructor as typeof Extension).NAME}`;
  }

  /**
   * A typeguard that allows to validate if a certain asn1.js object is of our type
   *
   * @param obj The object we want to match against the type of this class
   * @returns true if obj is of the same type as our class
   */
  public static typeGuard(obj: unknown | undefined): obj is Extension {
    return this.matches(obj);
  }

}
