/* eslint-disable @typescript-eslint/no-unused-vars */
import * as assert from "assert";
import * as asn1ts from "../src.ts";
import * as pvtsutils from "pvtsutils";
import { SchemaContext } from "../src.ts";
import { ILocalIdentificationBlockParams } from "../src/internals/LocalIdentificationBlock.ts";
import { localFromBER } from "../src/parser.ts";
import { ETagClass } from "../src/TypeStore.ts";


/**
 * Gets a repeated schema
 *
 * @param type the type of object we want to get a repeated schema for
 * @returns the repeated schema
 */
function getRepeatedSchema(type: asn1ts.AsnType, params: asn1ts.SequenceOfParams): asn1ts.SequenceOf {
    return new asn1ts.SequenceOf({
        ...params,
        value: type
    });
}

/**
 * Gets a repeated value
 *
 * @param type the value we want to get a repeated sequence for
 * @returns the repeated schema
 */
function getRepeatedValue(type: asn1ts.AsnType, params: asn1ts.SequenceParams | undefined, amount: number): asn1ts.Sequence {
    const seq = new asn1ts.Sequence({
        ...params,
    });
    for (let iCount = 0; iCount < amount; iCount++) {
       seq.valueBlock.value.push(type);
    }
    return seq;
}

context("Asn1Repeated implementation tests", () => {
    it("validate a repeated simple against a matching schema", () => {
        const schema = getRepeatedSchema(new asn1ts.Integer(), {name: "mandatory"});
        const seq = getRepeatedValue(new asn1ts.Integer({value: 1}), undefined, 2);
        const data = seq.toBER();
        const result = asn1ts.verifySchema(data, schema);
        assert.equal(result.verified, true, "Schema verification failed");
        if (result.verified) {
            const sequence = result.result;
            if(!asn1ts.Sequence.typeGuard(sequence)) {
                assert("Result is not a sequence");
                return;
            }
            assert.equal(sequence?.name, "mandatory", "failed");
            assert.equal(sequence?.valueBlock.value.length, 2, "failed");
        }
    });
    it("validate a sequenced repeated values against a matching schema with optional repeated values 1", () => {
        const schema = new asn1ts.Sequence({
            name: "testseq",
            value: [
                new asn1ts.Utf8String({name: "string", value: "s1"}),
                new asn1ts.Integer({name: "integer", value: 1}),
                getRepeatedSchema(new asn1ts.Utf8String(), {name:"optional1", idBlock: {optionalID: 0}}),
                getRepeatedSchema(new asn1ts.Integer(), {name:"optional2", idBlock: {optionalID: 1}}),
            ]
        });
        const seq = new asn1ts.Sequence({
            value: [
                new asn1ts.Utf8String({value: "s1"}),
                new asn1ts.Integer({value: 1}),
                getRepeatedValue(new asn1ts.Utf8String({value:"string"}), {idBlock: { optionalID: 0}}, 2),
                getRepeatedValue(new asn1ts.Integer({value:1}), {idBlock: { optionalID: 1}}, 1)
            ]
        });
        const data = seq.toBER();
        const result = asn1ts.verifySchema(data, schema);
        if (result.verified) {
            assert.equal(result.result.name, "testseq", "failed");
            const value1 = result.result.getTypedValueByName(asn1ts.Utf8String, "string");
            assert.equal(value1.valueBlock.value, "s1", "failed");
            const value2 = result.result.getTypedValueByName(asn1ts.Integer, "integer");
            assert.equal(value2.valueBlock.value, 1, "failed");
            const optional1 = result.result.getTypedValueByName(asn1ts.Sequence, "optional1");
            assert.equal(optional1.valueBlock.value.length, 2, "failed");
            const optional2 = result.result.getTypedValueByName(asn1ts.Sequence, "optional2");
            assert.equal(optional2.valueBlock.value.length, 1, "failed");
        }
    });

    it("validate a sequenced repeated values against a matching schema with optional repeated values 2", () => {
        const schema = new asn1ts.Sequence({
            name: "testseq",
            value: [
                new asn1ts.Utf8String({name: "string", value: "s1"}),
                new asn1ts.Integer({name: "integer", value: 1}),
                getRepeatedSchema(new asn1ts.Utf8String(), {name:"optional1", idBlock: {optionalID: 0}}),
                getRepeatedSchema(new asn1ts.Integer(), {name:"optional2", idBlock: {optionalID: 1}}),
            ]
        });
        const seq = new asn1ts.Sequence({
            value: [
                new asn1ts.Utf8String({value: "s1"}),
                new asn1ts.Integer({value: 1}),
                getRepeatedValue(new asn1ts.Integer({value:1}), {idBlock: { optionalID: 0}}, 1)
            ]
        });
        const data = seq.toBER();
        const result = asn1ts.verifySchema(data, schema);
        if (result.verified) {
            assert.equal(result.result.name, "testseq", "failed");
            const value1 = result.result.getTypedValueByName(asn1ts.Utf8String, "string");
            assert.equal(value1.valueBlock.value, "s1", "failed");
            const value2 = result.result.getTypedValueByName(asn1ts.Integer, "integer");
            assert.equal(value2.valueBlock.value, 1, "failed");
            const optional1 = result.result.getTypedValueByName(asn1ts.Sequence, "optional1");
            assert.equal(optional1, undefined, "failed");
            const optional2 = result.result.getTypedValueByName(asn1ts.Sequence, "optional2");
            assert.equal(optional2.valueBlock.value.length, 1, "failed");
        }
    });
});
