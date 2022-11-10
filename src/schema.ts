/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as pvtsutils from "pvtsutils";
import { IS_CONSTRUCTED, NAME, ID_BLOCK, FROM_BER, TO_BER, TAG_CLASS, TAG_NUMBER, IS_HEX_ONLY, LOCAL, VALUE_HEX_VIEW } from "./internals/constants";
import { Any } from "./Any";
import { Choice } from "./Choice";
import { Repeated } from "./Repeated";
import { getTypeForIDBlock, localFromBER } from "./parser";
import { AsnType, typeStore } from "./TypeStore";
import { ILocalConstructedValueBlock } from "./internals/LocalConstructedValueBlock";
import { LocalIdentificationBlock } from "./internals/LocalIdentificationBlock";
import { LocalLengthBlock } from "./internals/LocalLengthBlock";
import { BaseBlock } from "./BaseBlock";

export type AsnSchemaType = AsnType | Any | Choice | Repeated;

export interface CompareSchemaSuccess {
  verified: true;
  result: AsnType & { [key: string]: any; };
}

export interface CompareSchemaFail {
  verified: false;
  errors?: SchemaErrors;
}

/**
 * Configure options how the schema shall get verified.
 * Allows to configure laxer or stricter parsing
 */
export class VerifyOptions {
  constructor(continueOnError = true, allowLargerThanSchema = false) {
    this.continueOnError = continueOnError;
    this.allowLargerThanSchema = allowLargerThanSchema;
  }
  // Parsing continues on an error, the errorlist contains all errors
  public continueOnError: boolean;
  // If the asn1 object is larger than the schema, this is not an error
  public allowLargerThanSchema: boolean;
}

export enum ESchemaError {
	NO_ERROR = 0,
  // The provided asn1data is invalid
  INVALID_ASN1DATA = 1,
  // The provided schema data is invalid
  INVALID_SCHEMADATA = 2,
  // The schema attribute has no tag class
  MISSING_TAG_CLASS_IN_SCHEMA = 3,
  // Mismatching tag class between asn1 and schema
  MISMATCHING_TAG_CLASS = 4,
  // The schema attribute has no tag number
  MISSING_TAG_NUMBER_IN_SCHEMA = 5,
  // Mismatching tag number between asn1 and schema
  MISMATCHING_TAG_NUMBER = 6,
  // The schema attribute has no constructed flag
  MISSING_CONSTRUCTED_FLAG_IN_SCHEMA = 7,
  // Mismatching constructed flag between asn1 and schema
  MISMATCHING_CONSTRUCTED_FLAG = 8,
  // The schema attribute has no constructed flag
  MISSING_ISHEXONLY_FLAG_IN_SCHEMA = 9,
  // Mismatching constructed flag between asn1 and schema
  MISMATCHING_ISHEXONLY_FLAG = 10,
  // The schema attribute has hexview flag
  MISSING_HEXVIEW_IN_SCHEMA = 11,
  // The hex view length is not matching between the asn1 and the schema
  MISMATCHING_HEX_VIEW_LENGTH = 12,
  // The hex view data is not matching between the asn1 and the schema
  MISMATCHING_HEX_VIEW_DATA = 13,
  // The object length is mismatching between the asn1 and the schema
  MISMATCHING_OBJECT_LENGTH = 14,
  // Failed to decode primitive data
  FAILED_TO_BER_DECODE_PRIMITIVE_DATA = 16,
  // Failed to match asn1 data with choice from the schema
  NO_MATCHING_DATA_FOR_CHOICE = 17,
  // The ASN1 structure is larger than the schema
  ASN1_IS_LARGER_THAN_SCHEMA = 18
}

/**
 * This object contains a schema error that occured while validating the schema
 */
export class SchemaError {
  constructor(error: ESchemaError, context: string) {
    this.error = error;
    this.context = context;
  }
  // The schema error (check enum for details)
  public error: ESchemaError;
  // Context in the tree (which parameter caused the issue)
  public context: string;
}

/**
 * While checking the schema this object contains the list of errors to give a deeper
 */
export class SchemaErrors extends Array<SchemaError> {
  public get failed(): boolean {
    return this.length > 0;
  }
  public get ok(): boolean {
    return this.length === 0;
  }
}

export type CompareSchemaResult = CompareSchemaSuccess | CompareSchemaFail;

export function compareSchema(root: AsnType, inputSchema: AsnSchemaType, options: VerifyOptions = new VerifyOptions()): CompareSchemaResult {
  const errors = compareSchemaInternal(root, inputSchema, options);
  if (errors.failed) {
    return {
      verified: false,
      errors
    };
  } else {
    return {
      verified: true,
      result: root
    };
  }
}

/**
 * Compare of two ASN.1 object trees
 * @param root Root of input ASN.1 object tree
 * @param inputSchema Input ASN.1 schema to compare with
 * @param inputData Input ASN.1 object tree
 * @param context A context that holds the name where we are in the root AsnType while parsing (needed for contextual errors)
 * @return Returns result of comparison
 */
function compareSchemaInternal(root: AsnType, inputSchema: AsnSchemaType, options = new VerifyOptions(), inputData = root, context = ""): SchemaErrors {
  const errors = new SchemaErrors();

  if(!context.length) {
    context = inputSchema.name;
    if (!context && inputSchema instanceof BaseBlock)
      context += inputSchema.idBlock.getDebug("-");
  }

   //#region Special case for Choice schema element type
  if (inputSchema instanceof Choice) {
    /**
     * We iterate over the choice fields and validate whether the inputData matches the choice data
     * If that is the case we take over name and the optional from the choice attribute
     */
    for (let j = 0; j < inputSchema.value.length; j++) {
      const schema = inputSchema.value[j];
      const errors = compareSchemaInternal(root, schema, options, inputData, context);
      if (errors.ok) {
        inputData.name = inputSchema.name;
        inputData.optional = inputSchema.optional;
        return errors;
      }
    }

    errors.push(new SchemaError(ESchemaError.NO_MATCHING_DATA_FOR_CHOICE, context));
    return errors;
  }
  //#endregion
  //#region Special case for Any schema element type
  if (inputSchema instanceof Any) {
    //#region Add named component of ASN.1 schema
    if (inputSchema.hasOwnProperty(NAME))
      (root as any)[inputSchema.name] = inputData; // TODO Such call may replace original field of the object (eg idBlock)


    //#endregion
    return errors;
  }
  //#endregion
  //#region Initial check
  if ((root instanceof Object) === false) {
    errors.push(new SchemaError(ESchemaError.INVALID_ASN1DATA, context));
    return errors;
  }

  if ((inputData instanceof Object) === false) {
    errors.push(new SchemaError(ESchemaError.INVALID_ASN1DATA, context));
    return errors;
  }

  if ((inputSchema instanceof Object) === false) {
    errors.push(new SchemaError(ESchemaError.INVALID_SCHEMADATA, context));
    return errors;
  }

  if (!(ID_BLOCK in inputSchema)) {
    errors.push(new SchemaError(ESchemaError.INVALID_SCHEMADATA, context));
    return errors;
  }
  //#endregion
  //#region Comparing idBlock properties in ASN.1 data and ASN.1 schema
  //#region Encode and decode ASN.1 schema idBlock
  /// <remarks>This encoding/decoding is necessary because could be an errors in schema definition</remarks>
  if (!(FROM_BER in inputSchema.idBlock)) {
    errors.push(new SchemaError(ESchemaError.INVALID_SCHEMADATA, context));
    return errors;
  }

  if (!(TO_BER in inputSchema.idBlock)) {
    errors.push(new SchemaError(ESchemaError.INVALID_SCHEMADATA, context));
    return errors;
  }

  /*
    As optional params are encoded differently to the scheme (tagclass contextual and tagnumber is the id of the element
    we should not encode decode the values here as these operations touch the schema attributes
    const encodedId = inputSchema.idBlock.toBER(false);
    if (encodedId.byteLength === 0) {
      return {
        verified: false,
        result: { error: "Error encoding idBlock for ASN.1 schema" }
      };
    }

    const decodedOffset = inputSchema.idBlock.fromBER(encodedId, 0, encodedId.byteLength);
    if (decodedOffset === -1) {
      return {
        verified: false,
        result: { error: "Error decoding idBlock for ASN.1 schema" }
      };
    }
  */
  //#endregion
  //#region tagClass
  if (!inputSchema.idBlock.hasOwnProperty(TAG_CLASS)) {
    errors.push(new SchemaError(ESchemaError.MISSING_TAG_CLASS_IN_SCHEMA, context));
    return errors;
  }

  if (inputSchema.idBlock.tagClass !== inputData.idBlock.tagClass) {
    errors.push(new SchemaError(ESchemaError.MISMATCHING_TAG_CLASS, context));
    return errors;
  }
  //#endregion
  //#region tagNumber
  if (!inputSchema.idBlock.hasOwnProperty(TAG_NUMBER)) {
    errors.push(new SchemaError(ESchemaError.MISSING_TAG_NUMBER_IN_SCHEMA, context));
    return errors;
  }

  if (inputSchema.idBlock.tagNumber !== inputData.idBlock.tagNumber) {
    errors.push(new SchemaError(ESchemaError.MISMATCHING_TAG_NUMBER, context));
    return errors;
  }
  //#endregion
  //#region isConstructed
  if (!inputSchema.idBlock.hasOwnProperty(IS_CONSTRUCTED)) {
    errors.push(new SchemaError(ESchemaError.MISSING_CONSTRUCTED_FLAG_IN_SCHEMA, context));
    return errors;
  }

  if (inputSchema.idBlock.isConstructed !== inputData.idBlock.isConstructed) {
    errors.push(new SchemaError(ESchemaError.MISMATCHING_CONSTRUCTED_FLAG, context));
    return errors;
  }
  //#endregion
  //#region isHexOnly
  if (!inputSchema.idBlock.hasOwnProperty(IS_HEX_ONLY)) {
    errors.push(new SchemaError(ESchemaError.MISSING_ISHEXONLY_FLAG_IN_SCHEMA, context));
    return errors;
  }

  if (inputSchema.idBlock.isHexOnly !== inputData.idBlock.isHexOnly) {
    errors.push(new SchemaError(ESchemaError.MISMATCHING_ISHEXONLY_FLAG, context));
    return errors;
  }
  //#endregion
  //#region valueHex
  if (inputSchema.idBlock.isHexOnly) {
    if (!inputSchema.idBlock.hasOwnProperty(VALUE_HEX_VIEW)) // Since 'valueHex' is an inherited property
    {
      errors.push(new SchemaError(ESchemaError.MISSING_HEXVIEW_IN_SCHEMA, context));
      return errors;
    }

    const schemaView = inputSchema.idBlock.valueHexView;
    const asn1View = inputData.idBlock.valueHexView;

    if (schemaView.length !== asn1View.length) {
      errors.push(new SchemaError(ESchemaError.MISMATCHING_HEX_VIEW_LENGTH, context));
      return errors;
    }

    for (let i = 0; i < schemaView.length; i++) {
      if (schemaView[i] !== asn1View[1]) {
        errors.push(new SchemaError(ESchemaError.MISMATCHING_HEX_VIEW_DATA, context));
        return errors;
      }
    }
  }
  //#endregion
  //#endregion

  //#region Add named component of ASN.1 schema
  /*
    Urgs, what coding style is that? A consumer of the api chooses a specific name e.g. "optional" or "name" and overwrites
    internal structures. I don´t think it´s ment to work like that...
    In case someone wants to acces certain properties by name a getter should get used and that searches in the valueblock
    Furthermore this idea is not typescript compatible, you need to cast this object here to write to it and the consumer also needs to cast it to be able to access the properties...
    -> not ideal, therefore commented out.... (also removed the delete methods below that removed it in case of an error)
    -> use getValueByName("nam"") from the Sequence and Set objects
    if (inputSchema.name) {
      inputSchema.name = inputSchema.name.replace(/^\s+|\s+$/g, EMPTY_STRING);
      if (inputSchema.name)
        (root as any)[inputSchema.name] = inputData; // "no longer a TODO" check field existence. If exists throw an error
    }
  */
  //#endregion
  //#region Getting next ASN.1 block for comparison
  if (inputSchema instanceof typeStore.Constructed) {
    // TODO not clear how it works for OctetString and BitString
    //* if (inputSchema.idBlock.isConstructed) {
    let admission = 0;

    // Get rid of ts-ignore and cast the input object properly one time in advance
    const inputValue = (inputData.valueBlock as ILocalConstructedValueBlock).value as AsnType[];

    let maxLength = Math.max(inputSchema.valueBlock.value.length, inputValue.length);

    if (maxLength > 0) {
      if (inputSchema.valueBlock.value[0] instanceof Repeated) {
        maxLength = inputValue.length; // TODO debug it
      }
    }

    //#region Special case when constructive value has no elements
    if (maxLength === 0)
      return errors;

    //#endregion
    //#region Special case when "inputData" has no values and "inputSchema" has all optional values
    // TODO debug it
    if ((inputValue.length === 0) &&
      (inputSchema.valueBlock.value.length !== 0)) {
      let _optional = true;

      for (let i = 0; i < inputSchema.valueBlock.value.length; i++)
        _optional = _optional && (inputSchema.valueBlock.value[i].optional || false);

      if (_optional)
        return errors;

      errors.push(new SchemaError(ESchemaError.MISMATCHING_OBJECT_LENGTH, context));
      return errors;
    }
    // Helper variable to improve searching for context specific optional attributes
    // The variable stores the last value where we found the last optional param
    let nextOptional = 0;
    //#endregion
    for (let i = 0; i < maxLength; i++) {
      //#region Special case when there is an OPTIONAL element of ASN.1 schema at the end
      if ((i - admission) >= inputValue.length) {
        if (inputSchema.valueBlock.value[i].optional === false) {
          errors.push(new SchemaError(ESchemaError.MISMATCHING_OBJECT_LENGTH, context));
          return errors;
        }
      }
      //#endregion
      else {
        //#region Special case for Repeated type of ASN.1 schema element
        if (inputSchema.valueBlock.value[0] instanceof Repeated) {
          const errors = compareSchemaInternal(root, inputSchema.valueBlock.value[0].value, options, inputValue[i], context);
          if (errors.failed) {
            if (inputSchema.valueBlock.value[0].optional)
              admission++;
            else
              return errors;
          }

          if ((NAME in inputSchema.valueBlock.value[0]) && (inputSchema.valueBlock.value[0].name.length > 0)) {
            let arrayRoot: Record<string, any> = {};

            if ((LOCAL in inputSchema.valueBlock.value[0]) && (inputSchema.valueBlock.value[0].local))
              arrayRoot = inputData;
            else
              arrayRoot = root;

            if (typeof arrayRoot[inputSchema.valueBlock.value[0].name] === "undefined")
              arrayRoot[inputSchema.valueBlock.value[0].name] = [];

            arrayRoot[inputSchema.valueBlock.value[0].name].push(inputValue[i]);
          }
        }
        //#endregion
        else {
          let inputObject = inputValue[i - admission];
          let schema = inputSchema.valueBlock.value[i];

          let newContext = context;
          if (newContext.length)
            newContext += ":";

          if (!schema) {
            // The input object exists but is not reference in the schema.
            if (!options.allowLargerThanSchema) {
              // This is not allowed, let´s throw an error
              newContext += inputObject.idBlock.getDebug("-");
              errors.push(new SchemaError(ESchemaError.ASN1_IS_LARGER_THAN_SCHEMA, newContext));
            }
            return errors;
          }
          if (schema.name)
            newContext += schema.name;
          else
            newContext += schema.idBlock.getDebug("-");

          if (inputObject.idBlock.tagClass === 3 && inputObject.idBlock.tagNumber >= 0) {
            // This is a context specific property (optional property)
            // the type comes from the target field with optionalID === tagNumber
            for (let j = nextOptional; j < maxLength; j++) {
                const check = inputSchema.valueBlock.value[j];
                if (check.idBlock.optionalID === inputObject.idBlock.tagNumber) {
                  nextOptional = j + 1;
                  schema = check;
                  // As we have a context specific attribute the type comes from the schema field
                  const newType = getTypeForIDBlock(schema.idBlock);
                  if (newType) {
                    // Create the new object matching the type of the scheme for the context spcific parameter from the input
                    const contextualElement = new newType();
                    // Create the id block based on the schema information
                    contextualElement.idBlock = new LocalIdentificationBlock(schema);
                    // Take over the name for reference
                    contextualElement.name = schema.name;
                    // The id block may be different for this value especially if the context specific with a higer id used more than one byte.
                    // So we calculate the required block length by converting to BER and ignoring the optionalID flag in the toBER calculation
                    contextualElement.idBlock.blockLength = contextualElement.idBlock.toBER(true, true).byteLength;
                    // The len block is the same as from the source, create a copy and set the same blockLength
                    contextualElement.lenBlock = new LocalLengthBlock(inputObject);
                    // The blocklength is not taken over from the input but is the same as in the original object so we just take it over
                    contextualElement.lenBlock.blockLength = inputObject.lenBlock.blockLength;
                    // Let´s take over the payload from the input parameter into the final parameter
                    contextualElement.valueBeforeDecodeView = new Uint8Array(inputObject.valueBeforeDecodeView);
                    // We need to tune the first byte as the type information has now changed from context specific + optionalID to universal + tag number (type)
                    contextualElement.valueBeforeDecodeView[0] = contextualElement.idBlock.tagNumber;
                    // Now we need to calculate the offset of the payload inside the source elements, It´s the source idblock length + the source len block length
                    const offset = inputObject.lenBlock.blockLength + inputObject.idBlock.blockLength;
                    const decoded = contextualElement.fromBER(contextualElement.valueBeforeDecodeView, offset, contextualElement.valueBeforeDecodeView.length);
                    if (decoded) {
                      inputObject = contextualElement;
                      inputValue[i - admission] = contextualElement;
                    }
                  }
                  break;
                }
            }
          }
          const recursive_errors = compareSchemaInternal(root, schema, options, inputObject, newContext);
          if(recursive_errors.failed) {
            if (inputSchema.valueBlock.value[i].optional)
              admission++;
            else if(!options.continueOnError)
              return recursive_errors;
            else
              errors.push(...recursive_errors);
          } else {
            inputObject.name = schema.name;
            inputObject.optional = schema.optional;
          }
        }
      }
    }

    if(errors.failed)
      return errors;

    // Here we are done with iterating over all objects (including recursion, stepping in) and we step out to the next higher element in the structure
    inputData.name = inputSchema.name;
    inputData.optional = inputSchema.optional;

    return errors;
  }
  //#endregion
  //#region Ability to parse internal value for primitive-encoded value (value of OctetString, for example)
  if (inputSchema.primitiveSchema &&
    (VALUE_HEX_VIEW in inputData.valueBlock)) {
    //#region Decoding of raw ASN.1 data
    const asn1 = localFromBER(inputData.valueBlock.valueHexView);
    if (asn1.offset === -1) {
      errors.push(new SchemaError(ESchemaError.FAILED_TO_BER_DECODE_PRIMITIVE_DATA, context));
      return errors;
    }
    //#endregion

    return compareSchemaInternal(root, inputSchema.primitiveSchema, options, asn1.result, context);
  }

  return errors;
  //#endregion
}

/**
 * ASN.1 schema verification for ArrayBuffer data
 * @param inputBuffer - Input BER-encoded ASN.1 data
 * @param inputSchema - Input ASN.1 schema to verify against to
 * @param verifyOptions - Options to control how the object is beeing verified
 * @return
 */
export function verifySchema(inputBuffer: pvtsutils.BufferSource, inputSchema: AsnSchemaType, options: VerifyOptions = new VerifyOptions()): CompareSchemaResult {
  //#region Decoding of raw ASN.1 data
  const asn1 = localFromBER(pvtsutils.BufferSourceConverter.toUint8Array(inputBuffer));
  if (asn1.offset === -1) {
    const errors = new SchemaErrors();
    errors.push(new SchemaError(ESchemaError.FAILED_TO_BER_DECODE_PRIMITIVE_DATA, ""));
    return {
      verified: false,
      errors
    };
  }
  //#endregion
  //#region Compare ASN.1 struct with input schema
  return compareSchema(asn1.result, inputSchema, options);
  //#endregion
}
