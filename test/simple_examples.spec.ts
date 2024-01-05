/* eslint-disable @typescript-eslint/no-unused-vars */
import * as assert from "assert";
import * as asn1ts from "../src";

context("Simple examples from the readme.md", () => {
    it ("How to create a simple ASN structures", () => {
        // Creating a simple asn1 sequence
        const seq = new asn1ts.Sequence({
            value: [
                new asn1ts.Utf8String({ value: "string" }),
                new asn1ts.Integer({ value: 1 }),
                new asn1ts.Boolean({ value: true })
           ]
        });

        // Encode the data into an ArrayBuffer
        const encoded = seq.toBER();

        // 300e0c06737472696e670201010101ff
        const HexEncoded = Buffer.from(new Uint8Array(encoded)).toString("hex");
        assert.equal(HexEncoded, "300e0c06737472696e670201010101ff");
    });

    it ("How to validate data against a scheme", () => {
        // Creating a simple asn1 sequence
        const seq = new asn1ts.Sequence({
            value: [
                new asn1ts.Utf8String({ value: "string" }),
                new asn1ts.Integer({ value: 1 }),
                new asn1ts.Boolean({ value: true })
           ]
        });

        // Encode the data into an ArrayBuffer
        const encoded = seq.toBER();

        // Create the scheme we want to validate against
        const scheme = new asn1ts.Sequence({
            name: "sequence",
            value: [
                new asn1ts.Utf8String({name: "string_value"}),
                new asn1ts.Integer({name: "integer_value"}),
                new asn1ts.Boolean({name: "boolean_value"}),
            ]
        });

        // Verify the data against the schema
        const result = asn1ts.verifySchema(encoded, scheme);
        assert.equal(result.verified, true);
        if (result.verified) {
            // Schema has been verified, let´s get the property "integer_value"
            const asn1tsInteger = result.result.getTypedValueByName(asn1ts.Integer, "integer_value");
            assert.equal(asn1tsInteger.getValue(), 1);
        }
    });

    it ("How to use implicit optional properties (smaller footprint when asn1 encoded, the schema tells the decoder what it shall decode)", () => {
        // Creating a simple asn1 sequence with an implicitly encoded integer
        const seq = new asn1ts.Sequence({
            value: [
                new asn1ts.Utf8String({ value: "string" }),
                new asn1ts.Integer({ value: 2, idBlock: { optionalID: 0 } }),
           ]
        });

        // Encode the data into an ArrayBuffer
        const encoded = seq.toBER();

        // 300b0c06737472696e67800101
        console.log(Buffer.from(new Uint8Array(encoded)).toString("hex"));

        // Create the scheme we want to validate against
        const scheme = new asn1ts.Sequence({
            name: "sequence",
            value: [
                new asn1ts.Utf8String({name: "string_value"}),
                new asn1ts.Integer({name: "integer_value", idBlock: { optionalID: 0 }}),
            ]
        });

        // Verify the data against the schema
        const result = asn1ts.verifySchema(encoded, scheme);
        assert.equal(result.verified, true);
        if (result.verified) {
            // Schema has been verified, let´s get the property "integer_value"
            const asn1tsInteger = result.result.getTypedValueByName(asn1ts.Integer, "integer_value");
            assert.equal(asn1tsInteger.getValue(), 2);
        }
    });

});