// This file is embedded as resource file in the esnacc.exe ASN1 Compiler
// Do NOT edit or modify this code as it is machine generated
// and will be overwritten with every code generation of the esnacc.exe

// prettier-ignore
/* eslint-disable */

import * as asn1ts from "../src";

export enum ConverterErrorType {
	NO_ERROR = 0,
	PROPERTY_MISSING = 2,
	PROPERTY_NULLORUNDEFINED = 3,
	PROPERTY_TYPEMISMATCH = 4
}

/**
 * A converter error entry with details about the error and context
 */
export class ConverterError {
	public errortype?: ConverterErrorType;
	public propertyname?: string;
	public debuginfo?: string;

	/**
	 * Constructs a parsing error object, simply stores the handed over arguments in the class
	 *
	 * @param errortype - The error type that let to the creation of the ConverterError
	 * @param propertyname - The name that was parsed
	 * @param debuginfo - Additional debug info
	 */
	public constructor(errortype?: ConverterErrorType, propertyname?: string, debuginfo?: string) {
		this.errortype = errortype;
		this.propertyname = propertyname;
		this.debuginfo = debuginfo;
	}

	/**
	 * Helper method that provides the parsing error as text for logging and debugging
	 *
	 * @param type - The error the method should provide as string
	 * @returns - the ConverterError as text or unknown if an unknown type was provided
	 */
	public static getErrorTypeString(type: ConverterErrorType): string {
		switch (type) {
			case ConverterErrorType.NO_ERROR:
				return "NO_ERROR";
			case ConverterErrorType.PROPERTY_MISSING:
				return "PROPERTY_MISSING";
			case ConverterErrorType.PROPERTY_NULLORUNDEFINED:
				return "PROPERTY_NULLORUNDEFINED";
			case ConverterErrorType.PROPERTY_TYPEMISMATCH:
				return "PROPERTY_TYPEMISMATCH";
			default:
				debugger;
				return "unknown";
		}
	}

	/**
	 * Helper method that provides an error description based on properties of the class
	 *
	 * @returns - A combined parsing error as text
	 */
	public getErrorDescription(): string {
		let errorDescription = "";
		if (this.errortype !== undefined)
			errorDescription += "ERROR: " + ConverterError.getErrorTypeString(this.errortype);
		if (this.propertyname !== undefined)
			errorDescription += " - PROPERTY: " + this.propertyname;
		if (this.debuginfo !== undefined)
			errorDescription += " - " + this.debuginfo;
		return errorDescription;
	}
}

/**
 * Context base data
 */
interface IContextBase {
	// The context string, as we recurse through objects the path is visible in this string root_object::sub_object::property
	context: string;
	// root is set to true if we are on the highest, initial layer (the root object)
	root: boolean;
}

export interface IEncodeContext extends IContextBase {
	// If encoding lax the encoder will sum up errors but will not stop encoding, errors are collected but the function always returns true
	bLaxEncoding: boolean;
	// to get naked code (not pretty printed with newlines, and tabs) set this to false
	bPrettyPrint: boolean;
	// Adds the type name to the generated output as _type="Typename"
	bAddTypes: boolean;
	// Encodes optional params in the hand coded UCServer notation
	bUCServerOptionalParams: boolean;
}

// If bAddTypes in the EncodeContext has been set we use this type to be able to add the object name to the serialized output
export interface INamedType {
	// the Name of the object we serialized from json to string
	_type?: string;
}

/**
 * Config how we encode something that goes into the transport layer
 */
export class EncodeContext implements IEncodeContext {
	// Give the diagnostic elements the context of the element we are currently encoding to ease understanding where an error occured...
	public context = "";
	// root is set to true if we are on the highest, initial layer (the root object)
	public root = true;
	// If encoding lax the encoder will sum up errors but will not stop encoding, errors are collected but the function always returns true
	public bLaxEncoding = false;
	// to get naked code (not pretty printed with newlines, and tabs) set this to false
	public bPrettyPrint = false;
	// Adds the type name to the generated output as _type="Typename"
	public bAddTypes = true;
	// Encodes optional params in the hand coded UCServer notation
	public bUCServerOptionalParams = false;

	/**
	 * Constructs a EncodeContext object, simply stores the handed over arguments in the class if provided
	 *
	 * @param args - Arguments on how to initialize the EncodeContext
	 */
	public constructor(args?: Partial<IEncodeContext>) {
		if (args?.bLaxEncoding !== undefined)
			this.bLaxEncoding = args.bLaxEncoding;
		if (args?.bPrettyPrint !== undefined)
			this.bPrettyPrint = args.bPrettyPrint;
		if (args?.bAddTypes !== undefined)
			this.bAddTypes = args.bAddTypes;
		if (args?.bUCServerOptionalParams !== undefined)
			this.bUCServerOptionalParams = args.bUCServerOptionalParams;
	}
}

export interface IDecodeContext extends IContextBase {
	// If decoding lax the parser will sum up errors but will not stop parsing, errors are collected but the function always returns true
	bLaxDecoding: boolean;
}

/**
 * Config how we decode something that comes from the transport layer
 */
export class DecodeContext implements IDecodeContext {
	// Give the diagnostic elements the context of the element we are currently decoding to ease understanding where an error occured...
	public context = "";
	// root is set to true if we are on the highest, initial layer (the root object)
	public root = true;
	// If decoding lax the parser will sum up errors but will not stop parsing, errors are collected but the function always returns true
	public bLaxDecoding = false;

	/**
	 * Constructs a DecodeContext object, simply stores the handed over arguments in the class if provided
	 *
	 * @param bLaxDecoding - Shall the decoder ignore errors and do best it can
	 */
	public constructor(bLaxDecoding?: boolean) {
		if (bLaxDecoding !== undefined)
			this.bLaxDecoding = bLaxDecoding;
	}
}

/**
 * An array of converter errors
 */
export class ConverterErrors extends Array<ConverterError> {
	// Holds the error Count when we call storeState()
	// The variable is used in validateResult to know if new errors where added or not
	private lastStoredErrorCount = 0;

	/**
	 * Helper method that provides all parsing errors as text
	 *
	 * @returns - All errors in the array as combined text \\n delimited
	 */
	public getDiagnostic(): string {
		let debuginfo = "";
		for (const error of this) {
			if (debuginfo.length)
				debuginfo += "\n";
			debuginfo += error.getErrorDescription();
		}
		return debuginfo;
	}

	/**
	 * Checks whether the converter has detected errors
	 * 
	 * @returns true if we hold errors or false if not
	 */
	public hasErrors(): boolean {
		return this.length !== 0;
	}

	/**
	 * Checks whether we have new errors since the last call of storeState()
	 * 
	 * @returns true if we hold new errors or false if not
	 */
	public hasNewErrors(): boolean {
		return this.length !== this.lastStoredErrorCount;
	}

	/**
	 * Updates the internal lastStoredErrorCount to the current amount of errors
	 * We need the stored value to be able to validateResult (see if we hold new errors or not)
	 */
	public storeState(): void {
		this.lastStoredErrorCount = this.length;
	}


	/**
	 * Clears the list of errors
	 */
	public clear(): void {
		this.length = 0;
	}

	/**
	 * Evaluates whether a function has caused errors or not and adds the errorDescription
	 * to the appropriate position in the errorList
	 *
	 * @param context - the context what where we are in the structure
	 * @param objectName - the objectName which we are currently validating
	 * @returns true on success or false on error
	 */
	public validateResult(context: IContextBase, objectName: string): boolean {
		// Is our error counter now higher than when entering the encoding/decoding function? -> no = return false
		if (this.length <= this.lastStoredErrorCount)
			return true;

		let bSuccess = false;
		// We have a higher error count -> What to return now?
		if (Object.prototype.hasOwnProperty.call(context, "bLaxEncoding")) {
			// We are encoding
			const encodeContext = context as unknown as IEncodeContext;
			bSuccess = encodeContext.bLaxEncoding;
			if (!bSuccess && context.root)
				this.unshift(new ConverterError(undefined, undefined, `Errors while encoding ${objectName}`));
		} else {
			// We are decoding
			const decodingContext = context as unknown as IDecodeContext;
			bSuccess = decodingContext.bLaxDecoding;
			if (!bSuccess && context.root)
				this.unshift(new ConverterError(undefined, undefined, `Errors while decoding ${objectName}`));
		}

		return bSuccess;
	}
}

/**
 * This interface allows to pass the converter from the invoker to the transport layer.
 * The transport layer then converts the object into the appropriate transport notation
 */
export interface IConverter {
	toJSON(obj: unknown, errors?: ConverterErrors, context?: EncodeContext, parametername?: string): object | undefined;
	fromJSON(obj: string | object | undefined, errors?: ConverterErrors, context?: DecodeContext, parametername?: string, optional?: boolean): unknown | undefined;
	toBER(obj: unknown | undefined, errors?: ConverterErrors, context?: EncodeContext, parametername?: string, optional?: boolean | number): asn1ts.BaseBlock | undefined;
	fromBER(obj: Uint8Array | asn1ts.Sequence | undefined, errors?: ConverterErrors, context?: DecodeContext, parametername?: string, optional?: boolean): unknown | undefined;
}

/**
 * The TypeScript Converter class with helper functions to convert to / from - JSON / BER
 */
export class TSConverter {
	private static base64chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

	/**
	 * Adds a property missing error to the list of errors
	 *
	 * @param errors - the errors array
	 * @param context - the context (where are we)
	 * @param name - the name of the property
	 * @param optional - Wheter the property is optional
	 */
	public static addMissingError(errors?: ConverterErrors, context?: EncodeContext, name?: string, optional?: boolean | number): void {
		if (optional === true || (typeof optional === "number" && optional >= 0))
			return;
		if (!errors)
			return;
		if (context)
			errors.push(new ConverterError(ConverterErrorType.PROPERTY_MISSING, context.context + "::" + name, "property missing"));
		else
			errors.push(new ConverterError(ConverterErrorType.PROPERTY_MISSING, name, "property missing"));
	}

	/**
	 * Creates asn1ts Sequence constructor params based on the arguments
	 *
	 * @param name - the name of the attribute
	 * @param optional - true if the attribute is optional or a number when we have a contextual optional parameter
	 * @returns the parameters for the constructor call
	 */
	public static getASN1TSConstructorParams(name?: string, optional?: boolean | number): asn1ts.ConstructedParams {
		const params: asn1ts.ConstructedParams = { name };
		if (typeof optional === "number")
			params.idBlock = { optionalID: optional };
		else if (optional)
			params.optional = true;
		return params;
	}

	/**
	 * Type guard that ensures to work with a JSON object no matter if we provide a string or an object
	 *
	 * @param data - String or a JSON object
	 * @param errors - List of parsing errors
	 * @param context - context that is provided along with all the decoding operation
	 * @param optional - true if the parameter is an optional parameter
	 * @returns - a JSON object or undefined if an exception was catched (errors contains the error in that case)
	 */
	public static prepareJSONData<T>(data: string | object | undefined, errors: ConverterErrors, context: DecodeContext, optional?: boolean): T | undefined {
		let result: T | undefined;
		if (data == null) {
			if (!optional)
				errors.push(new ConverterError(ConverterErrorType.PROPERTY_MISSING, context.context, "property missing"));
			return undefined;
		} else {
			if (typeof data === "string") {
				try {
					// UCWeb creates an array envelop which is technically wrong so we need to remove that here
					// All ROSE messages are single sequences
					if (data.startsWith("["))
						data = data.substring(1, data.length - 1);
					result = JSON.parse(data) as T;
				} catch (error) {
					let message = "Could not json parse - ";
					if (error instanceof SyntaxError)
						message += error.message;
					errors.push(new ConverterError(ConverterErrorType.PROPERTY_NULLORUNDEFINED, context.context, message));
					return undefined;
				}
			} else
				result = data as T;
		}
		return result;
	}

	/**
	 * Type guard that ensures to work with an asn1ts object no matter if we provide a BUffer from the transport layer or a asn1ts.Sequence
	 *
	 * @param getschema - Method to retrieve the schema in case the data argument is an unparsed buffer
	 * @param data - Buffer from the transport or an already parsed asn1ts.Sequence
	 * @param errors - List of parsing errors
	 * @param context - context that is provided along with all the decoding operation
	 * @param optional - true if the parameter is an optional parameter
	 * @returns - an asn1ts.Sequence object or undefined if an exception was catched (errors contains the error in that case)
	 */
	public static prepareASN1BERData(getschema: () => asn1ts.AsnSchemaType, data: Uint8Array | asn1ts.BaseBlock | undefined, errors: ConverterErrors, context: DecodeContext, optional?: boolean): asn1ts.AsnType | undefined {
		if (data == null) {
			if (!optional)
				errors.push(new ConverterError(ConverterErrorType.PROPERTY_MISSING, context.context, "property missing"));
			return undefined;
		} else {
			if (data instanceof Uint8Array) {
				try {
					const schema = getschema();
					const result = asn1ts.verifySchema(data, schema);
					if (!result.verified) {
						const message = JSON.stringify(result.errors);
						errors.push(new ConverterError(ConverterErrorType.PROPERTY_NULLORUNDEFINED, context.context, "Validating schema failed: " + message));
						return undefined;
					}
					return result.result;
				} catch (error) {
					let message = "Could not json asnjs ber data - ";
					if (error instanceof SyntaxError)
						message += error.message;
					errors.push(new ConverterError(ConverterErrorType.PROPERTY_NULLORUNDEFINED, context.context, message));
					return undefined;
				}
			}
		}
		return data;
	}

	/**
	 * Validate a param in a JSON object to meet an expected type and beeing existent
	 *
	 * @param data - A JSON object we are inspecting
	 * @param propertyName - Name of the property we are looking for
	 * @param expectedType - Type of object we expect
	 * @param errors - List of parsing errors
	 * @param context - context that is provided along with all the decoding operation
	 * @param optional - set to true if the parameter is optional (if optional, the parameter might be missing)
	 * @returns - true if the parameter in object data meets the expectations, or false other cases
	 */
	public static validateParam(data: object, propertyName: string, expectedType: "boolean" | "number" | "string" | "Date" | "Uint8Array" | "object", errors?: ConverterErrors, context?: IDecodeContext | IEncodeContext, optional?: boolean): boolean {
		if (!Object.prototype.hasOwnProperty.call(data, propertyName)) {
			if (errors && context) {
				if (!(optional === true))
					errors.push(new ConverterError(ConverterErrorType.PROPERTY_MISSING, context.context + "::" + propertyName, "property missing"));
			}
		} else {
			const property = (data as Record<string, unknown>)[propertyName];
			if (property === undefined || property === null) {
				if (!optional && errors && context)
					errors.push(new ConverterError(ConverterErrorType.PROPERTY_NULLORUNDEFINED, context.context + "::" + propertyName, "property null or undefined"));
				return false;
			}
			const type = typeof property;
			if (type === expectedType)
				return true;
			else if (type === "object") {
				if (expectedType === "Date" && property instanceof Date)
					return true;
				else if (expectedType === "Uint8Array" && property instanceof Uint8Array)
					return true;
				else if (expectedType === "object")
					return true;
			}
			if (errors && context)
				errors.push(new ConverterError(ConverterErrorType.PROPERTY_TYPEMISMATCH, context.context + "::" + propertyName, "expected type was " + expectedType + ", effective type is " + typeof property));
		}
		return false;
	}

	/**
	 * Validate a param in the JSON data object to meet an expected type and beeing existent and then fills it into the target field
	 *
	 * @param data - A JSON object we are inspecting
	 * @param target - the target object to write the validate parameter to
	 * @param propertyName - Name of the property we are looking for
	 * @param expectedType - Type of object we expect
	 * @param errors - List of parsing errors
	 * @param context - context that is provided along with all the decoding operation
	 * @param optional - set to true if the parameter is optional (if optional, the parameter might be missing)
	 * @returns - true if the parameter in object data meets the expectations, or false other cases
	 */
	public static fillJSONParam(data: object, target: object, propertyName: string, expectedType: "boolean" | "number" | "string" | "object" | "Date" | "Uint8Array", errors?: ConverterErrors, context?: DecodeContext | EncodeContext, optional?: boolean): boolean {
		const result = this.validateParam(data, propertyName, expectedType, errors, context, optional);
		if (result) {
			const t = target as Record<string, unknown>;
			const d = data as Record<string, unknown>;
			if (expectedType === "Date")
				t[propertyName] = (d[propertyName] as Date).toISOString();
			else if (expectedType === "Uint8Array")
				t[propertyName] = TSConverter.encode64(d[propertyName] as Uint8Array);
			else
				t[propertyName] = d[propertyName];
		}
		return result;
	}

	/**
	 * Fetches a param from the asn1 data object and puts it into the target object
	 *
	 * @param d - A asn1ts sequence object we are inspecting
	 * @param target - the target object to write the validate parameter to
	 * @param propertyName - Name of the property we are looking for
	 * @param expectedType - Type of object we expect
	 * @param errors - List of parsing errors
	 * @param context - context that is provided along with all the decoding operation
	 * @param optional - set to true if the parameter is optional (if optional, the parameter might be missing)
	 * @returns - true if the parameter in object data meets the expectations, or false other cases
	 */
	public static fillASN1Param(d: asn1ts.Sequence, target: object, propertyName: string, expectedType: "Boolean" | "Enumerated" | "Integer" | "Utf8String" | "OctetString" | "Real" | "Sequence" | "AsnSystemTime" | "Any" | "Null", errors: ConverterErrors, context: DecodeContext, optional?: boolean): boolean {
		let value: unknown;
		if (expectedType === "Boolean")
			value = d.getTypedValueByName(asn1ts.Boolean, propertyName)?.getValue();
		else if (expectedType === "Enumerated")
			value = d.getTypedValueByName(asn1ts.Enumerated, propertyName)?.getValue();
		else if (expectedType === "Integer")
			value = d.getTypedValueByName(asn1ts.Integer, propertyName)?.getValue();
		else if (expectedType === "Utf8String")
			value = d.getTypedValueByName(asn1ts.Utf8String, propertyName)?.getValue();
		else if (expectedType === "Real")
			value = d.getTypedValueByName(asn1ts.Real, propertyName)?.getValue();
		else if (expectedType === "Sequence")
			value = d.getTypedValueByName(asn1ts.Sequence, propertyName)?.getValue();
		else if (expectedType === "AsnSystemTime") {
			value = d.getTypedValueByName(asn1ts.Real, propertyName)?.getValue();
			if (value !== undefined)
				value = TSConverter.getDateTimeFromVariantTime(value as number);
		} else if (expectedType === "Any")
			value = d.getValueByName(propertyName);
		else if (expectedType === "Null")
			value = d.getTypedValueByName(asn1ts.Null, propertyName)?.getValue();
		else {
			errors.push(new ConverterError(ConverterErrorType.PROPERTY_TYPEMISMATCH, context.context + "::" + propertyName, `Unsupported data type ${expectedType}`));
			return false;
		}
		if (value !== undefined) {
			(target as Record<string, unknown>)[propertyName] = value;
			return true;
		}
		if (!optional) {
			if (d.getValueByName(propertyName))
				errors.push(new ConverterError(ConverterErrorType.PROPERTY_TYPEMISMATCH, context.context + "::" + propertyName, "property is of the wrong type"));
			else
				errors.push(new ConverterError(ConverterErrorType.PROPERTY_MISSING, context.context + "::" + propertyName, "property missing"));
		}
		return false;
	}

	/**
	 * Validate that data is of the expected type
	 *
	 * @param property - the property to validate
	 * @param propertyName - Name of the property we are currently validating
	 * @param expectedType - The expected type for param or boolean if we made an instanceof check where the function is called
	 * @param errors - List of parsing errors
	 * @param context - context that is provided along with all the decoding operation
	 * @param optional - set to true if the parameter is optional (if optional, the parameter might be missing)
	 * @returns - true if the parameter in object data meets the expectations, or false other cases
	 */
	public static validateParamType<T>(property: unknown, propertyName: string, expectedType: "boolean" | "number" | "object" | "string" | "Uint8Array" | "Date", errors?: ConverterErrors, context?: IContextBase, optional?: boolean): property is T {
		if (property === undefined && !optional) {
			if (errors && context)
				errors.push(new ConverterError(ConverterErrorType.PROPERTY_MISSING, context.context + "::" + propertyName, "property missing"));
		} else if (expectedType === "Uint8Array") {
			if (property instanceof Uint8Array)
				return true;
		} else if (expectedType === "Date") {
			if (property instanceof Date)
				return true;
		} else if (typeof property === expectedType)
			return true;

		if (errors && context)
			errors.push(new ConverterError(ConverterErrorType.PROPERTY_TYPEMISMATCH, context.context + "::" + propertyName, "expected type was " + expectedType + ", effective type is " + typeof property));

		return false;
	}

	/**
	 * Validate a param in a JSON object for existence
	 *
	 * @param data - A JSON object we are inspecting
	 * @param propertyName - Name of the property we are looking for
	 * @param errors - List of parsing errors
	 * @param context - context that is provided along with all the decoding operation
	 * @param optional - set to true if the parameter is optional (if optional, the parameter might be missing)
	 * @returns - true if the parameter in object data meets the expectations, or false other cases
	 */
	public static validateAnyParam(data: object, propertyName: string, errors?: ConverterErrors, context?: DecodeContext, optional?: boolean): boolean {
		if (!Object.prototype.hasOwnProperty.call(data, propertyName)) {
			if (errors && context) {
				if (!(optional === true))
					errors.push(new ConverterError(ConverterErrorType.PROPERTY_MISSING, context.context + "::" + propertyName, "property missing"));
			}
		} else {
			const property = (data as never)[propertyName];
			if (property == null) {
				if (errors && context)
					errors.push(new ConverterError(ConverterErrorType.PROPERTY_NULLORUNDEFINED, context.context + "::" + propertyName, "property null or undefined"));
			} else {
				const type = typeof property;
				if (type === "boolean" || type === "number" || type === "object" || type === "string")
					return this.validateParam(data, propertyName, type, errors, context, optional);
				else if (errors && context)
					errors.push(new ConverterError(ConverterErrorType.PROPERTY_TYPEMISMATCH, context.context + "::" + propertyName, "expected type was not found, effective type is " + type));
			}
		}
		return false;
	}

	/**
	 * Validate a param in a JSON object for existence
	 *
	 * @param data - A JSON object we are inspecting
	 * @param target - the target object to write the validate parameter to
	 * @param propertyName - Name of the property we are looking for
	 * @param errors - List of parsing errors
	 * @param context - context that is provided along with all the decoding operation
	 * @param optional - set to true if the parameter is optional (if optional, the parameter might be missing)
	 * @returns - true if the parameter in object data meets the expectations, or false other cases
	 */
	public static fillAnyParam(data: object, target: unknown, propertyName: string, errors?: ConverterErrors, context?: DecodeContext, optional?: boolean): boolean {
		const result = this.validateAnyParam(data, propertyName, errors, context, optional);
		if (result)
			(target as Record<string, unknown>)[propertyName] = (data as Record<string, unknown>)[propertyName];
		return result;
	}

	/**
	 * Validate a choice param in a JSON object to meet an expected type and beeing existent
	 *
	 * @param data - A JSON object we are inspecting
	 * @param propertyName - Name of the property we are looking for
	 * @param expectedType - Type of object we expect
	 * @param errors - List of parsing errors
	 * @param context - context that is provided along with all the decoding operation
	 * @returns - true if the parameter in object data meets the expectations, or false other cases
	 */
	public static validateChoiceParam(data: object, propertyName: string, expectedType: "boolean" | "number" | "object" | "string", errors?: ConverterErrors, context?: DecodeContext): boolean {
		if (Object.prototype.hasOwnProperty.call(data, propertyName)) {
			const datanever = data as never;
			if (datanever[propertyName] == null) {
				if (errors && context)
					errors.push(new ConverterError(ConverterErrorType.PROPERTY_NULLORUNDEFINED, context.context + "::" + propertyName, "property null or undefined"));
			} else if (typeof datanever[propertyName] !== expectedType) {
				if (errors && context)
					errors.push(new ConverterError(ConverterErrorType.PROPERTY_TYPEMISMATCH, context.context + "::" + propertyName, "expected type was " + expectedType + ", effective type is " + typeof (datanever[propertyName])));
			} else
				return true;
		}
		return false;
	}

	/**
	 * Adds a calling context to log encoding errors.
	 * As we travers through the object in the tree we always add a new context whenever we walk in a branch
	 * Thus the decoder always knows for logging where the parser is currently parsing content
	 *
	 * @param context - An existing handed over context or undefined if we freshly create one
	 * @param parametername - The name of the parameter we are currently processing
	 * @param objectName - Or the object name we are currently processing in case the parameter name is missing
	 * @returns - The new adopted or created DecodeContext
	 */
	public static addEncodeContext(context: IEncodeContext | undefined, parametername: string | undefined, objectName: string): IEncodeContext {
		if (!context)
			context = new EncodeContext();
		return TSConverter.addContext(context, parametername, objectName);
	}

	/**
	 * Adds a calling context to log decoding errors.
	 * As we travers through the object in the tree we always add a new context whenever we walk in a branch
	 * Thus the decoder always knows for logging where the parser is currently parsing content
	 *
	 * @param context - An existing handed over context or undefined if we freshly create one
	 * @param name - The name of the parameter we are currently processing
	 * @param objectName - Or the object name we are currently processing in case the parameter name is missing
	 * @returns - The new adopted or created DecodeContext
	 */
	public static addDecodeContext(context: IDecodeContext | undefined, name: string | undefined, objectName: string): IDecodeContext {
		if (!context)
			context = new DecodeContext();
		return TSConverter.addContext(context, name, objectName);
	}

	/**
	 * Adds a calling context to log decoding errors.
	 * As we travers through the object in the tree we always add a new context whenever we walk in a branch
	 * Thus the decoder always knows for logging where the parser is currently parsing content
	 *
	 * @param context - An existing handed over context or undefined if we freshly create one
	 * @param name - The name of the parameter we are currently processing
	 * @param objectName - Or the object name we are currently processing in case the parameter name is missing
	 * @returns - The new adopted or created DecodeContext
	 */
	private static addContext<T extends IContextBase>(context: T, name: string | undefined, objectName: string): T {
		if (context.context.length)
			context.context += "::";
		if (name !== undefined)
			context.context += name;
		else
			context.context += objectName;
		return context;
	}

	/**
	 * Adds a binary parameter (base64encoded) to the json string output
	 *
	 * @param property - Name of the property we are adding
	 * @param value - The value to add
	 * @param context - A to JSON Context that knows the context (e.g. indentation) while creating the output
	 * @returns - The encoded property:value pair as JSON string
	 */
	public static addBinaryParam(property: string, value: Uint8Array | undefined, context: EncodeContext): string {
		if (value == null || value.byteLength === 0)
			return "";
		return this.encode64(value);
	}

	/**
	 * Decodes base64 in a way that browsers and node support it
	 *
	 * @param base64data - The base64 data to decode
	 * @returns - The decoded base64 data
	 */
	public static decode64(base64data: string): Uint8Array {
		let paddingchars = 0;
		while (base64data.slice(-1) === "=") {
			paddingchars++;
			base64data = base64data.substring(0, base64data.length - 1);
		}
		const datalength = ((base64data.length * 3) - paddingchars) / 4;
		const binarydata = new Uint8Array(datalength);
		let j = 0;
		for (let i = 0; i < datalength; i += 3) {
			const e1 = this.base64chars.indexOf(base64data.charAt(j++));
			const e2 = this.base64chars.indexOf(base64data.charAt(j++));
			const e3 = this.base64chars.indexOf(base64data.charAt(j++));
			const e4 = this.base64chars.indexOf(base64data.charAt(j++));
			const c1 = (e1 << 2) | (e2 >> 4);
			const c2 = ((e2 & 15) << 4) | (e3 >> 2);
			const c3 = ((e3 & 3) << 6) | e4;
			binarydata[i] = c1;
			if (e3 !== 64)
				binarydata[i + 1] = c2;
			if (e4 !== 64)
				binarydata[i + 2] = c3;
		}
		return binarydata;
	}

	/**
	 * Encodes base64 in a way that browsers and node support it
	 *
	 * @param binarydata - The binary data to encode
	 * @returns - The encoded base64 data
	 */
	public static encode64(binarydata: Uint8Array): string {
		let base64data = "";
		const length = binarydata.byteLength;
		const padding = length % 3;
		const datalength = length - padding;

		for (let i = 0; i < datalength; i = i + 3) {
			const data1 = binarydata[i];
			const data2 = binarydata[i + 1];
			const data3 = binarydata[i + 2];
			if (data1 !== undefined && data2 !== undefined && data3 !== undefined) {
				const chunk = (data1 << 16) | (data2 << 8) | data3;
				const a = this.base64chars[(chunk & 16515072) >> 18];
				const b = this.base64chars[(chunk & 258048) >> 12];
				const c = this.base64chars[(chunk & 4032) >> 6];
				const d = this.base64chars[chunk & 63];
				if (a !== undefined && b !== undefined && c !== undefined && d !== undefined)
					base64data += a + b + c + d;
			}
		}
		if (padding === 1) {
			const chunk = binarydata[datalength];
			if (chunk !== undefined) {
				const a = this.base64chars[(chunk & 252) >> 2];
				const b = this.base64chars[(chunk & 3) << 4];
				if (a !== undefined && b !== undefined)
					base64data += a + b;
			}
		} else if (padding === 2) {
			const data1 = binarydata[datalength];
			const data2 = binarydata[datalength + 1];
			if (data1 !== undefined && data2 !== undefined) {
				const chunk = (data1 << 8) | data2;
				const a = this.base64chars[(chunk & 64512) >> 10];
				const b = this.base64chars[(chunk & 1008) >> 4];
				const c = this.base64chars[(chunk & 15) << 2];
				if (a !== undefined && b !== undefined && c !== undefined)
					base64data += a + b + c;
			}
		}
		return base64data;
	}

	/**
	 * Escapes a value
	 *
	 * @param str - A value to escape
	 * @returns - the escaped value
	 */
	private static escape(str: string): string {
		return str
			.replace(/[\\]/g, "\\\\")
			.replace(/["]/g, "\\\"")
			.replace(/[/]/g, "\\/")
			.replace(/[\b]/g, "\\b")
			.replace(/[\f]/g, "\\f")
			.replace(/[\n]/g, "\\n")
			.replace(/[\r]/g, "\\r")
			.replace(/[\t]/g, "\\t");
	}

	/**
	 * Patches any ASN1 Object to the notation how the snacc compiler deals with optional params
	 * asn1ts creates a constructed object with the value below (contains type information with it)
	 * the snacc compiler creates identifer octest that embed the value (no type information)
	 *
	 * @param element - the element to patch
	 * @param optionalID - the optional tag id under which the value is presented in the surrounding strucutre
	 * @returns the patched object
	 */
	public static makeOptional(element: asn1ts.BaseBlock, optionalID: number): asn1ts.BaseBlock {
		element.idBlock.tagClass = 3;
		element.idBlock.tagNumber = optionalID;
		return element;
	}

	/**
	 * Retrieves a Date object from a double (Windows Variant Time)
	 *
	 * @param value - the double value to convert
	 * @returns a Date object representing the the Windows Variant double value
	 */
	public static getDateTimeFromVariantTime(value: number): Date {
		/**
		 * A variant time is stored as an 8-byte real value (double), representing a date between
		 * January 1, 100 and December 31, 9999, inclusive. The value 2.0 represents January 1, 1900;
		 * 3.0 represents January 2, 1900, and so on. Adding 1 to the value increments the date by a day.
		 * The fractional part of the value represents the time of day. Therefore, 2.5 represents noon on
		 * January 1, 1900; 3.25 represents 6:00 A.M. on January 2, 1900, and so on. Negative numbers
		 * represent dates prior to December 30, 1899.
		 * The variant time resolves to one second. Any milliseconds in the input date are ignored.
		 */

		// We work with seconds and adopt that before the conversion to msec (ensures we get no msec in the time in the end)
		// Windows is not reporting milliseconds as through the fraction the value is not 100% accurate

		// What is the 31.12.1899 as unix time stamp?
		// console.log(new Date(Date.UTC(1899, 11, 30, 0, 0, 0, 0)).getTime());
		const variantTimeBegin = -2209161600;

		// And this is the double encoded offset from that value in msec days,timeofday
		const valueinseconds = value * 24 * 60 * 60;
		// Adopt the value by seconds (Math.round). The double value transports no msec
		const newTime = variantTimeBegin + Math.round(valueinseconds);

		return new Date(newTime * 1000);
	}

	/**
	 * Retrieves a double (Windows Variant Time) from a Date object
	 *
	 * @param value - the Date object to convert
	 * @returns a double value representing the Date object
	 */
	public static getVariantTimeFromDateTime(value: Date): number {
		/**
		 * A variant time is stored as an 8-byte real value (double), representing a date between
		 * January 1, 100 and December 31, 9999, inclusive. The value 2.0 represents January 1, 1900;
		 * 3.0 represents January 2, 1900, and so on. Adding 1 to the value increments the date by a day.
		 * The fractional part of the value represents the time of day. Therefore, 2.5 represents noon on
		 * January 1, 1900; 3.25 represents 6:00 A.M. on January 2, 1900, and so on. Negative numbers
		 * represent dates prior to December 30, 1899.
		 * The variant time resolves to one second. Any milliseconds in the input date are ignored.
		 */

		let time = value.getTime() / 1000;

		// What is the 31.12.1899 as unix time stamp?
		// console.log(new Date(Date.UTC(1899, 11, 30, 0, 0, 0, 0)).getTime());
		time += 2209161600;

		// Get the double valua by dividing it through the time of a day in seconds
		time /= 24 * 60 * 60;

		return time;
	}
}
