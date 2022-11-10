/* eslint-disable @typescript-eslint/no-unused-vars */
import * as assert from "assert";
import { HexBlockParams } from "../build";
import * as asn1js from "../src";
import { ILocalIdentificationBlock } from "../src/internals/LocalIdentificationBlock";

/**
 * Converts an array buffer to hex notation
 *
 * @param buffer - the buffer to convert
 * @returns the buffer in hex string notation
 */
function buf2hex(buffer: ArrayBuffer): string {
	return [...new Uint8Array(buffer)]
		.map(x => x.toString(16).padStart(2, "0"))
		.join(" ");
}

/**
 * Converts a hex string to an array buffer
 *
 * @param hex - the hex string (with our without spaces)
 * @returns the converted hex buffer as array
 */
function hex2buf(hex: string): Uint8Array {
    const bytes = new Array<number>();
    hex = hex.replace(/ /g, "");
    hex.replace(/../g, (pair: string) => {
        bytes.push(parseInt(pair, 16));
        return "";
    });

    return new Uint8Array(bytes);
}

/**
 * Gets a sample sequence with some optional parmeters for tests
 *
 * @param getschema - true to get the schema for the verification
 * @param addoptionals - true to add optionals to the sequence
 * @param recursive - the sequence is embedded as sequence into another if you specify a recurive amount (1 means the root sequence contains another in the valueblock, if the value is negative the sequence is added optionally)
 * @param idblock - the idblock if we are recursing and the sequence shall get added optionally
 * @returns the asn1 sequence object
 */
function getSequence(getschema: boolean, addoptionals?: boolean, recurive?: number, idBlock?: Partial<ILocalIdentificationBlock> & HexBlockParams): asn1js.Sequence {
    const seq = new asn1js.Sequence({
        name: "sequence",
        idBlock: idBlock,
        value: [
            new asn1js.Utf8String({name: "string", ...(!getschema && { value: "string" }) }),
            new asn1js.Integer({name: "integer", ...(!getschema && { value: 1 }) }),
            new asn1js.Boolean({name: "boolean", ...(!getschema && { value: true }) }),
        ]
    });

    const value = seq.valueBlock.value;

    if(addoptionals) {
        value.push(new asn1js.Utf8String({name: "optional0",  ...(!getschema && { value: "optional0" }), idBlock: {optionalID: 0}}));
        value.push(new asn1js.Integer({name: "optional1",  ...(!getschema && { value: 2 }), idBlock: {optionalID: 1}}));
        value.push(new asn1js.Boolean({name: "optional2",  ...(!getschema && { value: false }), idBlock: {optionalID: 2}}));
    }

    if (recurive) {
        let idBlock: Partial<ILocalIdentificationBlock> & HexBlockParams | undefined = undefined;
        if(recurive > 0)
            recurive--;
        else {
            idBlock = { optionalID: addoptionals ? 3 : 0 };
            recurive++;
        }
        value.push(getSequence(getschema, addoptionals, recurive, idBlock));
    }


    return seq;
}

// Sequence with optionals with child optional Child Sequence in two iterations
const sampleSequence = "30 61 0c 06 73 74 72 69 6e 67 02 01 01 01 01 ff 80 09 6f 70 74 69 6f 6e 61 6c 30 81 01 02 82 01 00 a3 40 0c 06 73 74 72 69 6e 67 02 01 01 01 01 ff 80 09 6f 70 74 69 6f 6e 61 6c 30 81 01 02 82 01 00 a3 1f 0c 06 73 74 72 69 6e 67 02 01 01 01 01 ff 80 09 6f 70 74 69 6f 6e 61 6c 30 81 01 02 82 01 00";

context("validateSchema implementation tests", () => {
    it ("ensure getSequence consistency", () => {
        const seq = getSequence(false, true, -2);
        const ber = seq.toBER();
        const hex = buf2hex(ber);
        assert.equal(hex, sampleSequence);
    });

    it ("validate plain object agains schema with optional params", () => {
        const seq = getSequence(false, true, -2);
        const ber = seq.toBER();
        const schema = getSequence(true);
        const result = asn1js.verifySchema(ber, schema);
        assert.ok(result.verified, "Schema validation failed");
    });

    it ("validate an recursive object with optional params against a plain schema (without optionals)", () => {
        const seq = getSequence(false, true, -2);
        const ber = seq.toBER();
        const schema = getSequence(true);
        const result = asn1js.verifySchema(ber, schema);
        assert.ok(result.verified, "Schema validation failed");
    });

    it ("validate an recursive object with optional params against a matching schema and retriev the child sequence", () => {
        const seq = getSequence(false, true, -1);
        const ber = seq.toBER();
        const schema = getSequence(true, true, -1);
        const result = asn1js.verifySchema(ber, schema);
        assert.ok(result.verified, "Schema validation failed");
        const sequence = result.result.getAsSequence();
        assert.ok(sequence, "Schema validation result is not a sequence");
        if (sequence) {
            const child = sequence.getTypedValueByName(asn1js.Sequence, "sequence");
            assert.ok(child, "Child not found");
            if (child) {
                const string = child.getTypedValueByName(asn1js.Utf8String, "string");
                const integer = child.getTypedValueByName(asn1js.Integer, "integer");
                const boolean = child.getTypedValueByName(asn1js.Boolean, "boolean");
                assert.equal(string?.getValue(), "string");
                assert.equal(integer?.getValue(), 1);
                assert.equal(boolean?.getValue(), true);
                const optstring = child.getTypedValueByName(asn1js.Utf8String, "optional0");
                const optinteger = child.getTypedValueByName(asn1js.Integer, "optional1");
                const optboolean = child.getTypedValueByName(asn1js.Boolean, "optional2");
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
        for (const value of seq.valueBlock.value) {
            if (value.name === "integer") {
                const index = seq.valueBlock.value.indexOf(value);
                seq.valueBlock.value.splice(index, 1);
            }
        }
        assert.ok(sizebefore - 1 === values.length, "Element has not been removed (not found)");
        const ber = seq.toBER();
        const schema = getSequence(true, true, -1);
        const result = asn1js.verifySchema(ber, schema);
        assert.equal(result.verified, false, "Schema validated but it should fail");
    });

});
