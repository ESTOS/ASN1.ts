/* eslint-disable @typescript-eslint/no-unused-vars */
import * as assert from "assert";
import * as asn1ts from "../src";
import * as pvtsutils from "pvtsutils";
import { SchemaContext } from "../src";
import { ETagClass } from "../src/TypeStore";

/**
 * Get a sequence with optional parameters
 *
 * @param getschema true to get the schema for the verification
 * @param bAddString true to set the string to the choice
 * @param bAddBoolean true to set the boolean to the choice
 * @param bAddInteger true to set the integer to the choice
 * @returns an asn1 sequence object containing the choice
 */
function getChoice(getschema: boolean, bAddString: boolean, bAddBoolean: boolean, bAddInteger: boolean): asn1ts.AsnType {

    if(getschema) {
        const choice = new asn1ts.Choice({name: "choice"});
        if (bAddString)
            choice.value.push(new asn1ts.Utf8String());
        if (bAddBoolean)
            choice.value.push(new asn1ts.Boolean());
        if (bAddInteger)
            choice.value.push(new asn1ts.Integer());
        const seq = new asn1ts.Sequence({
            name: "base",
            value: [choice]
        });
        return seq;
    } else {
        const seq = new asn1ts.Sequence({
            name: "base"
        });
        if (bAddString)
            seq.valueBlock.value.push(new asn1ts.Utf8String({value: "optionalstring" }));
        if (bAddBoolean)
            seq.valueBlock.value.push(new asn1ts.Boolean({value: true }));
        if (bAddInteger)
            seq.valueBlock.value.push(new asn1ts.Integer({value: 1 }));
        return seq;
    }
}


context("Asn1Choice implementation tests", () => {
    it("validate a sequence against a matching schema", () => {
        const seq = getChoice(false, true, false, false);
        const data = seq.toBER();
        const schema = getChoice(true, true, true, true);
        const result = asn1ts.verifySchema(data, schema);
        assert.ok(result.verified, "Schema verification failed");
        const value = result.result.getTypedValueByName(asn1ts.Utf8String, "choice");
        assert.ok(value, "Property not found");
        assert.equal(value.getValue(), "optionalstring");
    });

    it("validate a sequence against a non matching choice", () => {
        const seq = getChoice(false, true, false, false);
        const data = seq.toBER();
        const schema = getChoice(true, false, true, true);
        const result = asn1ts.verifySchema(data, schema);
        assert.equal(result.verified, false, "Schema verification succeede but should have failed");
        if(result.verified === false) {
            assert.equal(result.errors?.length, 1, "Error array did not contain the proper amount of errors");
            if(result.errors) {
                assert.equal(result.errors[0].context, "base:choice", "Wrong context");
                assert.equal(result.errors[0].error, 17, "Wrong error value");
            }
        }
    });

    it("test choice on root level (using a constructed item that embeds the choice)", () => {
        /** All choices would match the asn1 type but the type exposed the optional context-specific */
        /** Thus the context needs to be found by id and not by matching schema */
        const schema = new asn1ts.Constructed({
            name: "constructed",
            idBlock: {
                tagClass: ETagClass.CONTEXT_SPECIFIC,
            },
            value: [new asn1ts.Choice({
                value: [
                    new asn1ts.Sequence({name: "first",
                         idBlock: {optionalID: 1},
                         value: [
                            new asn1ts.Utf8String({name: "first"}),
                            new asn1ts.Boolean({name: "first", optional: true})
                        ]
                    }),
                    new asn1ts.Sequence({name: "second",
                         idBlock: {optionalID: 2},
                         value: [
                            new asn1ts.Utf8String({name: "second"}),
                            new asn1ts.Integer({name: "second", optional: true})
                        ]
                    }),
                    new asn1ts.Sequence({name: "third",
                         idBlock: {optionalID: 3},
                         value: [
                            new asn1ts.Utf8String({name: "third"}),
                            new asn1ts.Utf8String({name: "third", optional: true})
                        ]
                    }),
                ]
            })]
        });
        const seq = new asn1ts.Constructed({
            name: "constructed",
            idBlock: {
                tagClass: ETagClass.CONTEXT_SPECIFIC,
                tagNumber: 2,
            },
            value: [
                new asn1ts.Utf8String({value: "teststring"})
            ]
        });
        const data = seq.toBER();
        const hex = pvtsutils.Convert.ToHex(data);

        const context = new SchemaContext();
        context.debug = true;

        const result = asn1ts.verifySchema(data, schema, undefined, context);
        assert.equal(result.verified, true, "Schema verification failed");
        if (result.verified) {
            assert.equal(result.result.name, "second", "Choice option not found");
            const utf8 = result.result.getTypedValueByName(asn1ts.Utf8String, "second");
            assert.ok(utf8, "Sequence value not found");
            assert.equal(utf8.getValue(), "teststring", "Wrong value found");
        }
    });


});
