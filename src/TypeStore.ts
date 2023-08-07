import type { BaseBlock } from "./BaseBlock.ts";
import type { BitString } from "./BitString.ts";
import type { BmpString } from "./BmpString.ts";
import type { Boolean as AsnBoolean } from "./Boolean.ts";
import type { CharacterString } from "./CharacterString.ts";
import type { Constructed } from "./Constructed.ts";
import type { DATE } from "./DATE.ts";
import type { DateTime } from "./DateTime.ts";
import type { Duration } from "./Duration.ts";
import type { EndOfContent } from "./EndOfContent.ts";
import type { Enumerated } from "./Enumerated.ts";
import type { GeneralizedTime } from "./GeneralizedTime.ts";
import type { GeneralString } from "./GeneralString.ts";
import type { GraphicString } from "./GraphicString.ts";
import type { IA5String } from "./IA5String.ts";
import type { Integer } from "./Integer.ts";
import type { Real } from "./Real.ts";
import type { Null } from "./Null.ts";
import type { NumericString } from "./NumericString.ts";
import type { ObjectIdentifier } from "./ObjectIdentifier.ts";
import type { OctetString } from "./OctetString.ts";
import type { Primitive } from "./Primitive.ts";
import type { PrintableString } from "./PrintableString.ts";
import type { RelativeObjectIdentifier } from "./RelativeObjectIdentifier.ts";
import type { Sequence } from "./Sequence.ts";
import type { Set } from "./Set.ts";
import type { TeletexString } from "./TeletexString.ts";
import type { TIME } from "./TIME.ts";
import type { TimeOfDay } from "./TimeOfDay.ts";
import type { UniversalString } from "./UniversalString.ts";
import type { UTCTime } from "./UTCTime.ts";
import type { Utf8String } from "./Utf8String.ts";
import type { VideotexString } from "./VideotexString.ts";
import type { VisibleString } from "./VisibleString.ts";

export type AsnType = BaseBlock | EndOfContent | AsnBoolean | Integer | Real | BitString | OctetString | Null | ObjectIdentifier | Enumerated | Utf8String | RelativeObjectIdentifier | TIME | Sequence | Set | NumericString | PrintableString | TeletexString | VideotexString | IA5String | UTCTime | GeneralizedTime | GraphicString | VisibleString | GeneralString | UniversalString | CharacterString | BmpString | DATE | TimeOfDay | DateTime | Duration | Constructed | Primitive;

export interface TypeStore {
  BitString: typeof BitString;
  BmpString: typeof BmpString;
  Boolean: typeof AsnBoolean;
  CharacterString: typeof CharacterString;
  Constructed: typeof Constructed;
  DATE: typeof DATE;
  DateTime: typeof DateTime;
  Duration: typeof Duration;
  EndOfContent: typeof EndOfContent;
  Enumerated: typeof Enumerated;
  GeneralizedTime: typeof GeneralizedTime;
  GeneralString: typeof GeneralString;
  GraphicString: typeof GraphicString;
  IA5String: typeof IA5String;
  Integer: typeof Integer;
  Null: typeof Null;
  NumericString: typeof NumericString;
  ObjectIdentifier: typeof ObjectIdentifier;
  OctetString: typeof OctetString;
  Primitive: typeof Primitive;
  PrintableString: typeof PrintableString;
  Real: typeof Real;
  RelativeObjectIdentifier: typeof RelativeObjectIdentifier;
  Sequence: typeof Sequence;
  Set: typeof Set;
  TeletexString: typeof TeletexString;
  TIME: typeof TIME;
  TimeOfDay: typeof TimeOfDay;
  UniversalString: typeof UniversalString;
  UTCTime: typeof UTCTime;
  Utf8String: typeof Utf8String;
  VideotexString: typeof VideotexString;
  VisibleString: typeof VisibleString;
}

export enum ETagClass {
  UNKNOWN = -1,
  UNIVERSAL = 1,
  APPLICATION = 2,
  CONTEXT_SPECIFIC = 3,
  PRIVATE = 4
}

export enum EUniversalTagNumber {
  unknown = -1,
  EndOfContent = 0,
  Boolean = 1,
  Integer = 2,
  BitString = 3,
  OctetString = 4,
  Null = 5,
  ObjectIdentifier = 6,
  /** 7 - ObjectDescriptor */
  /** 8 - INSTANCE OF, EXTERNAL */
  Real = 9,
  Enumerated = 10,
  /** 11 - EMBEDDED PDV */
  Utf8String = 12,
  RelativeObjectIdentifier = 13,
  TIME = 14,
  /** 15 */
  Sequence = 16,
  Set = 17,
  NumericString = 18,
  PrintableString = 19,
  TeletexString = 20,
  VideotexString = 21,
  IA5String = 22,
  UTCTime = 23,
  GeneralizedTime = 24,
  GraphicString = 25,
  VisibleString = 26,
  GeneralString = 27,
  UniversalString = 28,
  CharacterString = 29,
  BmpString = 30,
  DATE = 31,
  TimeOfDay = 32,
  DateTime = 33,
  Duration = 34
}

/* istanbul ignore next */
export function getTagClassAsText(tagClass: ETagClass): string {
  switch(tagClass) {
  case ETagClass.UNIVERSAL:
    return "UNIVERSAL";
  case ETagClass.APPLICATION:
    return "APPLICATION";
  case ETagClass.CONTEXT_SPECIFIC:
    return "CONTEXT_SPECIFIC";
  case ETagClass.PRIVATE:
    return "PRIVATE";
  default:
    return `TAGCLASS(${tagClass})`;
  }
}

/* istanbul ignore next */
export function getTagNumberAsText(tagNumber: EUniversalTagNumber): string {
  switch(tagNumber) {
    case EUniversalTagNumber.EndOfContent:
      return "EndOfContent";
    case EUniversalTagNumber.Boolean:
      return "Boolean";
    case EUniversalTagNumber.Integer:
      return "Integer";
    case EUniversalTagNumber.BitString:
      return "BitString";
    case EUniversalTagNumber.OctetString:
      return "OctetString";
    case EUniversalTagNumber.Null:
      return "Null";
    case EUniversalTagNumber.ObjectIdentifier:
      return "ObjectIdentifier";
    case EUniversalTagNumber.Real:
      return "Real";
    case EUniversalTagNumber.Enumerated:
      return "Enumerated";
    case EUniversalTagNumber.Utf8String:
      return "Utf8String";
    case EUniversalTagNumber.RelativeObjectIdentifier:
      return "RelativeObjectIdentifier";
    case EUniversalTagNumber.TIME:
      return "TIME";
    case EUniversalTagNumber.Sequence:
     return "Sequence";
    case EUniversalTagNumber.Set:
     return "Set";
    case EUniversalTagNumber.NumericString:
      return "NumericString";
    case EUniversalTagNumber.PrintableString:
      return "PrintableString";
    case EUniversalTagNumber.TeletexString:
      return "TeletexString";
    case EUniversalTagNumber.VideotexString:
      return "VideotexString";
    case EUniversalTagNumber.IA5String:
      return "IA5String";
    case EUniversalTagNumber.UTCTime:
      return "UTCTime";
    case EUniversalTagNumber.GeneralizedTime:
      return "GeneralizedTime";
    case EUniversalTagNumber.GraphicString:
      return "GraphicString";
    case EUniversalTagNumber.VisibleString:
      return "VisibleString";
    case EUniversalTagNumber.GeneralString:
      return "GeneralString";
    case EUniversalTagNumber.UniversalString:
      return "UniversalString";
    case EUniversalTagNumber.CharacterString:
      return "CharacterString";
    case EUniversalTagNumber.BmpString:
      return "BmpString";
    case EUniversalTagNumber.DATE:
      return "DATE";
    case EUniversalTagNumber.TimeOfDay:
      return "TimeOfDay";
    case EUniversalTagNumber.DateTime:
      return "DateTime";
    case EUniversalTagNumber.Duration:
      return "Duration";
    default:
      return `TAGNUMBER(${tagNumber})`;
  }
}

export const typeStore = {} as TypeStore;
