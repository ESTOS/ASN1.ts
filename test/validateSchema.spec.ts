/* eslint-disable @typescript-eslint/no-unused-vars */
import * as assert from "assert";
import * as asn1ts from "../src";
import * as pvtsutils from "pvtsutils";
import { HexBlockParams } from "../src";
import { ILocalIdentificationBlock } from "../src/internals/LocalIdentificationBlock";

/**
 * Converts an array buffer to hex notation
 *
 * @param buffer the array to convert
 * @returns the ArrayBuffer in hex string notation
 */
function typedArrayToBuffer(array: Uint8Array): ArrayBuffer {
    return array.buffer.slice(array.byteOffset, array.byteLength + array.byteOffset);
}

/**
 * Defines whether we want to get the schema definiton or a data strucutre
 * for the schema we define whether it shall contain the Extension that allows a strucutre to be larger than expected
 */
enum EGetSchemaOption {
    plain,
    extendable
}

/**
 * Gets a sample sequence with some optional parmeters for tests
 *
 * @param schemaOption true to get the schema for the verification
 * @param addoptionals true to add optionals to the sequence
 * @param recursive the sequence is embedded as sequence into another if you specify a recurive amount (1 means the root sequence contains another in the valueblock, if the value is negative the sequence is added optionally)
 * @param idblock the idblock if we are recursing and the sequence shall get added optionally
 * @returns the asn1 sequence object
 */
function getSequence(schemaOption: EGetSchemaOption | false, addoptionals?: boolean, recurive?: number, idBlock?: Partial<ILocalIdentificationBlock> & HexBlockParams): asn1ts.Sequence {
    const getData = schemaOption === false;

    const seq = new asn1ts.Sequence({
        name: "sequence",
        idBlock: idBlock,
        value: [
            new asn1ts.Utf8String({name: "string", ...(getData && { value: "string" }) }),
            new asn1ts.Integer({name: "integer", ...(getData && { value: 1 }) }),
            new asn1ts.Boolean({name: "boolean", ...(getData && { value: true }) }),
        ]
    });

    const value = seq.valueBlock.value;

    if(addoptionals) {
        value.push(new asn1ts.Utf8String({name: "optional0",  ...(getData && { value: "optional0" }), idBlock: {optionalID: 0}}));
        value.push(new asn1ts.Integer({name: "optional1",  ...(getData && { value: 2 }), idBlock: {optionalID: 1}}));
        value.push(new asn1ts.Boolean({name: "optional2",  ...(getData && { value: false }), idBlock: {optionalID: 2}}));
    }

    if(schemaOption === EGetSchemaOption.extendable)
        value.push(new asn1ts.Extension());

    if (recurive) {
        let idBlock: Partial<ILocalIdentificationBlock> & HexBlockParams | undefined = undefined;
        if(recurive > 0)
            recurive--;
        else {
            idBlock = { optionalID: addoptionals ? 3 : 0 };
            recurive++;
        }
        value.push(getSequence(schemaOption, addoptionals, recurive, idBlock));
    }

    return seq;
}

/** Sequence with optionals with child optional Child Sequence in two iterations */
const sampleSequence1 = "30610c06737472696e670201010101ff80096f7074696f6e616c30810102820100a3400c06737472696e670201010101ff80096f7074696f6e616c30810102820100a31f0c06737472696e670201010101ff80096f7074696f6e616c30810102820100";
/** Sequence with embedded value for an any schema compare */
const sampleSequence2 = "300e0c06737472696e670201010101ff";

context("validateSchema implementation tests", () => {
    it ("ensure getSequence consistency", () => {
        const seq = getSequence(false, true, -2);
        const ber = seq.toBER();
        const hex = pvtsutils.Convert.ToHex(ber);
        assert.equal(hex, sampleSequence1);
    });

    it ("validate plain object against schema with optional params", () => {
        const seq = getSequence(false, true, -2);
        const ber = seq.toBER();
        const schema = getSequence(EGetSchemaOption.plain, true, -2);
        const result = asn1ts.verifySchema(ber, schema);
        assert.equal(result.verified, true, "Schema validation failed");
    });

    it ("validate an object matching the schema where the extension in the schema has not been set", () => {
        const seq = getSequence(false, false, -2);
        const ber = seq.toBER();
        const schema = getSequence(EGetSchemaOption.plain, false, -2);
        const result = asn1ts.verifySchema(ber, schema, new asn1ts.VerifyOptions(true));
        assert.equal(result.verified, true, "Schema validation failed but should have succeeded");
    });

    it ("validate an object matching the schema where the extension in the schema has been set", () => {
        const seq = getSequence(false, false, -2);
        const ber = seq.toBER();
        const schema = getSequence(EGetSchemaOption.extendable, false, -2);
        const result = asn1ts.verifySchema(ber, schema, new asn1ts.VerifyOptions(true));
        assert.equal(result.verified, true, "Schema validation failed but should have succeeded");
    });

    it ("validate an object larget than the schema where the extension in the schema has not been set", () => {
        const seq = getSequence(false, true, -2);
        const ber = seq.toBER();
        const schema = getSequence(EGetSchemaOption.plain, false, -2);
        const result = asn1ts.verifySchema(ber, schema, new asn1ts.VerifyOptions(true));
        assert.equal(result.verified, false, "Schema validation succeeded but should have failed");
        if(result.verified === false) {
            assert.equal(result.errors?.length, 1);
            assert.equal(result.errors?.at(0)?.error, asn1ts.ESchemaError.ASN1_IS_LARGER_THAN_SCHEMA);
        }
    });

    it ("validate an object larget than the schema where the extension in the schema has been set", () => {
        const seq = getSequence(false, true, -2);
        const ber = seq.toBER();
        const schema = getSequence(EGetSchemaOption.extendable, false, -2);
        const result = asn1ts.verifySchema(ber, schema, new asn1ts.VerifyOptions(true));
        assert.equal(result.verified, true, "Schema validation failed but should have succeeded");
    });

    it ("validate an object smaller than the schema where the extension in the schema has not been set", () => {
        const seq = getSequence(false, false);
        const ber = seq.toBER();
        const schema = getSequence(EGetSchemaOption.plain, false, 1);
        const result = asn1ts.verifySchema(ber, schema, new asn1ts.VerifyOptions(true));
        assert.equal(result.verified, false, "Schema validation succeeded but should have failed");
        if(result.verified === false) {
            assert.equal(result.errors?.length, 1);
            assert.equal(result.errors?.at(0)?.error, asn1ts.ESchemaError.MISMATCHING_OBJECT_LENGTH);
        }
    });

    it ("validate an object smaller than the schema where the extension in the schema has been set", () => {
        const seq = getSequence(false, false);
        const ber = seq.toBER();
        const schema = getSequence(EGetSchemaOption.extendable, false, 1);
        const result = asn1ts.verifySchema(ber, schema, new asn1ts.VerifyOptions(true));
        assert.equal(result.verified, false, "Schema validation succeeded but should have failed");
        if(result.verified === false) {
            assert.equal(result.errors?.length, 1);
            assert.equal(result.errors?.at(0)?.error, asn1ts.ESchemaError.MISMATCHING_OBJECT_LENGTH);
        }
    });

    it ("validate an recursive object with optional params against a matching schema and retriev the child sequence", () => {
        const seq = getSequence(false, true, -1);
        const ber = seq.toBER();
        const schema = getSequence(EGetSchemaOption.plain, true, -1);
        const result = asn1ts.verifySchema(ber, schema);
        assert.ok(result.verified, "Schema validation failed");
        const sequence = result.result;
        if(!asn1ts.Sequence.typeGuard(sequence)) {
            assert("Result is not a sequence");
            return;
        }
        assert.ok(sequence, "Schema validation result is not a sequence");
        if (sequence) {
            const child = sequence.getTypedValueByName(asn1ts.Sequence, "sequence");
            assert.ok(child, "Child not found");
            if (child) {
                const string = child.getTypedValueByName(asn1ts.Utf8String, "string");
                const integer = child.getTypedValueByName(asn1ts.Integer, "integer");
                const boolean = child.getTypedValueByName(asn1ts.Boolean, "boolean");
                assert.equal(string?.getValue(), "string");
                assert.equal(integer?.getValue(), 1);
                assert.equal(boolean?.getValue(), true);
                const optstring = child.getTypedValueByName(asn1ts.Utf8String, "optional0");
                const optinteger = child.getTypedValueByName(asn1ts.Integer, "optional1");
                const optboolean = child.getTypedValueByName(asn1ts.Boolean, "optional2");
                assert.equal(optstring?.getValue(), "optional0");
                assert.equal(optinteger?.getValue(), 2);
                assert.equal(optboolean?.getValue(), false);
            }
        }
    });

    it ("validate an object with a missing mandatory value with it´s schema", () => {
        const seq = getSequence(false, true, -1);
        const values = seq.valueBlock.value;
        const sizebefore = values.length;
        for (const value of values) {
            if (value.name === "integer") {
                const index = values.indexOf(value);
                values.splice(index, 1);
            }
        }
        assert.ok(sizebefore - 1 === values.length, "Element has not been removed (not found)");
        const ber = seq.toBER();
        const schema = getSequence(EGetSchemaOption.plain, true, -1);
        const result = asn1ts.verifySchema(ber, schema);
        assert.equal(result.verified, false, "Schema validated but it should fail");
        if(result.verified === false) {
            assert.equal(result.errors?.length, 1);
            assert.equal(result.errors?.at(0)?.error, asn1ts.ESchemaError.MISMATCHING_TAG_NUMBER);
        }
    });

    it ("validate an object with a schema where an in between element is missing", () => {
        const seq = getSequence(false, false, 0);
        const schema = getSequence(EGetSchemaOption.plain, false, 0);
        const values = schema.valueBlock.value;
        const sizebefore = values.length;
        for (const value of values) {
            if (value.name === "integer") {
                const index = values.indexOf(value);
                values.splice(index, 1);
            }
        }
        assert.ok(sizebefore - 1 === values.length, "Element has not been removed (not found)");
        const ber = seq.toBER();
        const result = asn1ts.verifySchema(ber, schema);
        assert.equal(result.verified, false, "Schema validated but it should fail");
        if(result.verified === false) {
            assert.equal(result.errors?.length, 2);
            assert.equal(result.errors?.at(0)?.error, asn1ts.ESchemaError.MISMATCHING_TAG_NUMBER);
            assert.equal(result.errors?.at(1)?.error, asn1ts.ESchemaError.ASN1_IS_LARGER_THAN_SCHEMA);
        }
    });

    it ("validate an object with a schema where the last elemet is missing", () => {
        const seq = getSequence(false, false, 0);
        const schema = getSequence(EGetSchemaOption.plain, false, 0);
        const values = schema.valueBlock.value;
        const sizebefore = values.length;
        values.pop();
        assert.ok(sizebefore - 1 === values.length, "Element has not been removed");
        const ber = seq.toBER();
        const result = asn1ts.verifySchema(ber, schema, new asn1ts.VerifyOptions(true));
        assert.equal(result.verified, false, "Schema validated but it should fail");
        if (!result.verified) {
            assert.equal(result.errors?.length, 1);
            assert.equal(result.errors?.at(0)?.error, 18);
            assert.equal(result.errors?.at(0)?.context, "sequence:UNIVERSAL-Boolean");
        }
    });

    it ("validate an object with a schema with multiple errors, continueOnError = true", () => {
        /** Create a sequence with two childs */
        const seq = getSequence(false);
        const seqChild1 = getSequence(false);
        seqChild1.name = "child1";
        seq.valueBlock.value.push(seqChild1);
        const seqChild2 = getSequence(false);
        seqChild2.name = "child2";
        seq.valueBlock.value.push(seqChild2);
        const ber = seq.toBER();

        /** Create a matching schema but remove elements in child1 and child2 */
        const schema = getSequence(false);
        const schemaChild1 = getSequence(false);
        schemaChild1.name = "child1";
        schemaChild1.valueBlock.value.pop();
        schema.valueBlock.value.push(schemaChild1);
        const schemaChild2 = getSequence(false);
        schemaChild2.name = "child2";
        schemaChild2.valueBlock.value.pop();
        schema.valueBlock.value.push(schemaChild2);

        const result = asn1ts.verifySchema(ber, schema, new asn1ts.VerifyOptions(true));

        assert.equal(result.verified, false, "Schema validated but it should fail");
        if (!result.verified) {
            assert.equal(result.errors?.length, 2);
            assert.equal(result.errors?.at(0)?.error, 18);
            assert.equal(result.errors?.at(0)?.context, "sequence:child1:UNIVERSAL-Boolean");
            assert.equal(result.errors?.at(1)?.error, 18);
            assert.equal(result.errors?.at(1)?.context, "sequence:child2:UNIVERSAL-Boolean");
        }
    });


    it ("validate an object with a schema with multiple errors, continueOnError = false", () => {
        /** Create a sequence with two childs */
        const seq = getSequence(false);
        const seqChild1 = getSequence(false);
        seqChild1.name = "child1";
        seq.valueBlock.value.push(seqChild1);
        const seqChild2 = getSequence(false);
        seqChild2.name = "child2";
        seq.valueBlock.value.push(seqChild2);
        const ber = seq.toBER();

        /** Create a matching schema but remove elements in child1 and child2 */
        const schema = getSequence(false);
        const schemaChild1 = getSequence(false);
        schemaChild1.name = "child1";
        schemaChild1.valueBlock.value.pop();
        schema.valueBlock.value.push(schemaChild1);
        const schemaChild2 = getSequence(false);
        schemaChild2.name = "child2";
        schemaChild2.valueBlock.value.pop();
        schema.valueBlock.value.push(schemaChild2);

        const result = asn1ts.verifySchema(ber, schema, new asn1ts.VerifyOptions(false));

        assert.equal(result.verified, false, "Schema validated but it should fail");
        if (!result.verified) {
            assert.equal(result.errors?.length, 1);
            assert.equal(result.errors?.at(0)?.error, 18);
            assert.equal(result.errors?.at(0)?.context, "sequence:child1:UNIVERSAL-Boolean");
        }
    });

    it ("validate an object against a schema with embedded any", () => {
          const payload = new asn1ts.Sequence({
            name: "payload",
            value: [
                new asn1ts.Utf8String({name: "string",  value: "string"  }),
                new asn1ts.Integer({name: "integer", value: 1 }),
                new asn1ts.Boolean({name: "boolean", value: true }),
            ]
        });
        const data = new asn1ts.Sequence({
            name: "body",
            value: [
                new asn1ts.Integer({value:1}),
                payload
            ]
        });

        const schema = new asn1ts.Sequence({
            name: "sequence",
            value: [
                new asn1ts.Integer({name: "int"}),
                new asn1ts.Any({name: "any"})
            ]
        });

        const ber = data.toBER();
        const result = asn1ts.verifySchema(ber, schema);
        assert.ok(result.verified, "Schema verification failed");
        if (result.verified && result.result instanceof asn1ts.Sequence) {
            const int = result.result.getTypedValueByName(asn1ts.Integer, "int");
            const any = result.result.getValueByName("any");
            assert.ok(int, "missing int value in result");
            assert.ok(any, "missing any value in result");
            assert.equal(int.getValue(), 1, "Wrong value");
            const data = pvtsutils.Convert.ToHex(typedArrayToBuffer(any.valueBeforeDecodeView));
            assert.equal(data, sampleSequence2);
        }
    });

});

