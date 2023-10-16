/* eslint-disable @typescript-eslint/no-unused-vars */
import * as assert from "assert";
import * as asn1ts from "../src";
import * as pvtsutils from "pvtsutils";
import { ESchemaError, SchemaContext } from "../src";
import { ETagClass } from "../src/TypeStore";
import { Sequence } from "../build";
import { ROSEInvoke, ROSEMessage } from "./SNACCROSE";
import { ROSEMessage_Converter } from "./SNACCROSE_Converter";
import { ConverterErrors } from "./TSConverterBase";

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
            choice.value.push(new asn1ts.Utf8String({name: "stringdata"}));
        if (bAddBoolean)
            choice.value.push(new asn1ts.Boolean({name: "booleandata"}));
        if (bAddInteger)
            choice.value.push(new asn1ts.Integer({name: "integerdata"}));
        const seq = new asn1ts.Sequence({
            name: "base",
            value: [choice]
        });
        return seq;
    } else {
        const seq = new asn1ts.Sequence();
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

    it("Validate empty ROSEInvoke", () => {
        // ROSEMessage containing a ROSEInvoke (invokeID1, operationID 4100) with an empty argument
        // This is how we encode it
        const msg = new ROSEMessage();
        msg.invoke = new ROSEInvoke({
            operationID: 4100,
            invokeID: 1,
            linked_ID: 2,
            argument: new Sequence()
        });
        const errors = new ConverterErrors();
        const asn1Encoded = ROSEMessage_Converter.toBER(msg, errors) as asn1ts.Sequence;
        const payload = new Uint8Array(asn1Encoded.toBER());
        const hexPayLoad = pvtsutils.Convert.ToHex(payload); // expected a109020101020210043000

        const data = pvtsutils.Convert.FromHex(hexPayLoad);
        const schema = ROSEMessage.getASN1Schema();
        const result = asn1ts.verifySchema(data, schema);
        assert.ok(result.verified, "Schema verification failed");
        const invokeID = result.result.getTypedValueByName(asn1ts.Integer, "invokeID");
        const operationID = result.result.getTypedValueByName(asn1ts.Integer, "operationID");
        const linked_ID = result.result.getTypedValueByName(asn1ts.Integer, "linked_ID");
        const argument = result.result.getTypedValueByName(asn1ts.Sequence, "argument");
        assert.equal(invokeID.getValue(), 1);
        assert.equal(operationID.getValue(), 4100);
        assert.equal(linked_ID.getValue(), 2);
        assert.notEqual(argument, undefined);
    });
    it("validate a sequence against a matching schema", () => {
        const seq = getChoice(false, true, false, false);
        const data = seq.toBER();
        const schema = getChoice(true, true, true, true);
        const result = asn1ts.verifySchema(data, schema);
        assert.ok(result.verified, "Schema verification failed");
        const value = result.result.getTypedValueByName(asn1ts.Utf8String, "choice");
        assert.ok(value, "Property not found");
        assert.equal(value.choiceName, "stringdata");
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

    it("test context specific choice with correct repeated values", () => {
        const schema = new asn1ts.Choice({
            name: "choice",
            value: [
                new asn1ts.SequenceOf({value: new asn1ts.Integer, name: "integers1", idBlock: {optionalID: 1} }),
                new asn1ts.SequenceOf({value: new asn1ts.Utf8String, name: "strings1", idBlock: {optionalID: 2} }),
                new asn1ts.SetOf({value: new asn1ts.Integer, name: "integers2", idBlock: {optionalID: 3} }),
                new asn1ts.SetOf({value: new asn1ts.Utf8String, name: "strings2", idBlock: {optionalID: 4} }),
            ]
        });
        const seq = new asn1ts.Constructed({
            name: "constructed",
            idBlock: {
                tagClass: ETagClass.CONTEXT_SPECIFIC,
                tagNumber: 2,
            },
            value: [
                new asn1ts.Utf8String({value:"1"}),
                new asn1ts.Utf8String({value:"2"}),
                new asn1ts.Utf8String({value:"3"})
            ]
        });
        const data = seq.toBER();
        const hex = pvtsutils.Convert.ToHex(data);

        const context = new SchemaContext();
        context.debug = true;

        const result = asn1ts.verifySchema(data, schema, undefined, context);
        assert.equal(result.verified, true, "Schema verification failed");
        if (result.verified)
            assert.equal(result.result.name, "strings1");
    });

    it("test context specific choice with wrong repeated values", () => {
        const schema = new asn1ts.Choice({
            name: "choice",
            value: [
                new asn1ts.SequenceOf({value: new asn1ts.Integer, name: "integers1", idBlock: {optionalID: 1} }),
                new asn1ts.SequenceOf({value: new asn1ts.Utf8String, name: "strings1", idBlock: {optionalID: 2} }),
                new asn1ts.SetOf({value: new asn1ts.Integer, name: "integers2", idBlock: {optionalID: 3} }),
                new asn1ts.SetOf({value: new asn1ts.Utf8String, name: "strings2", idBlock: {optionalID: 4} }),
            ]
        });
        const seq = new asn1ts.Constructed({
            name: "constructed",
            idBlock: {
                tagClass: ETagClass.CONTEXT_SPECIFIC,
                tagNumber: 2,
            },
            value: [
                new asn1ts.Utf8String({value:"1"}),
                new asn1ts.Utf8String({value:"2"}),
                new asn1ts.Utf8String({value:"3"}),
                new asn1ts.Integer({value: 4})
            ]
        });
        const data = seq.toBER();
        const hex = pvtsutils.Convert.ToHex(data);

        const context = new SchemaContext();
        context.debug = true;

        const result = asn1ts.verifySchema(data, schema, undefined, context);
        assert.equal(result.verified, false, "Schema verification failed");
        if (!result.verified) {
            assert.equal(result.errors?.length, 1);
            if(result.errors) {
                const error = result.errors[0];
                assert.equal(error.error, ESchemaError.NO_MATCHING_DATA_FOR_CHOICE);
            }
        }
    });

    it("test regular choice with repeated values", () => {
        const schema = new asn1ts.Choice({
            value: [
                new asn1ts.SetOf({value: new asn1ts.Utf8String, name: "strings1"}),
                new asn1ts.SequenceOf({value: new asn1ts.Utf8String, name: "strings2"}),
            ]
        });
        const seq = new asn1ts.Sequence({
            value: [
                new asn1ts.Utf8String({value:"1"}),
                new asn1ts.Utf8String({value:"2"}),
                new asn1ts.Utf8String({value:"3"})
            ]
        });
        const data = seq.toBER();
        const hex = pvtsutils.Convert.ToHex(data);

        const context = new SchemaContext();
        context.debug = true;

        const result = asn1ts.verifySchema(data, schema, undefined, context);
        assert.equal(result.verified, true, "Schema verification failed");
        if (result.verified)
            assert.equal(result.result.name, "strings2");
    });

    it("test choice on root level", () => {
        /** All choices would match the asn1 type but the type exposed the optional context-specific */
        /** Thus the context needs to be found by id and not by matching schema */
        const schema = new asn1ts.Choice({
            name: "choice",
            value: [
                new asn1ts.Sequence({name: "firstoption",
                     idBlock: {optionalID: 1},
                     value: [
                        new asn1ts.Utf8String({name: "firststring"}),
                        new asn1ts.Boolean({name: "firstboolean", optional: true})
                    ]
                }),
                new asn1ts.Sequence({name: "secondoption",
                     idBlock: {optionalID: 2},
                     value: [
                        new asn1ts.Utf8String({name: "secondstring"}),
                        new asn1ts.Integer({name: "secondinteger", optional: true})
                    ]
                }),
                new asn1ts.Sequence({name: "thirdoption",
                     idBlock: {optionalID: 3},
                     value: [
                        new asn1ts.Utf8String({name: "thirdstring1"}),
                        new asn1ts.Utf8String({name: "thirdstring2", optional: true})
                    ]
                }),
            ]
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

        const result = asn1ts.verifySchema(data, schema, undefined, context);
        assert.equal(result.verified, true, "Schema verification failed");
        if (result.verified) {
            assert.equal(result.result.name, "secondoption");
            assert.equal(result.result.choiceName, "secondoption");
            const string = result.result.getTypedValueByName(asn1ts.Utf8String, "secondstring");
            assert.ok(string);
            assert.equal(string.getValue(), "teststring", "Wrong value found");
        }
    });


});
