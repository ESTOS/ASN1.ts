/* eslint-disable @typescript-eslint/no-unused-vars */
import * as assert from "assert";
import * as asn1ts from "../src";
import * as pvtsutils from "pvtsutils";

/**
 * Get a sequence with optional parameters
 *
 * @param getschema true to get the schema for the verification
 * @param value0 an optional paramter to embed into the sequence
 * @param value1 an optional paramter to embed into the sequence
 * @param value2 an optional paramter to embed into the sequence
 * @param brokensorted to test invalid sorted optional values
 * @returns the asn1 sequence object
 */
function getSequence(getschema: boolean, value0?: string, value1?: number, value2?: boolean, brokensorted?: boolean): asn1ts.Sequence {
    const seq = new asn1ts.Sequence({
        value: [
            new asn1ts.Utf8String({name: "string", ...(!getschema && { value: "string"}) }),
            new asn1ts.Boolean({name: "mytest", ...(!getschema && { value: true}) }),
        ]
    });

    const value = seq.valueBlock.value;
    if(brokensorted) {
        if (getschema || value0 !== undefined)
            value.push(new asn1ts.Utf8String({name: "optional0", ...(!getschema && { value: value0 }), idBlock: {optionalID: 0}}));
        if (getschema || value2 !== undefined)
            value.push(new asn1ts.Boolean({name: "optional2", ...(!getschema && { value: value2 }), idBlock: {optionalID: 2}}));
        if (getschema || value1 !== undefined)
            value.push(new asn1ts.Integer({name: "optional1", ...(!getschema && { value: value1 }), idBlock: {optionalID: 1}}));
    } else {
        if (getschema || value0 !== undefined)
            value.push(new asn1ts.Utf8String({name: "optional0", ...(!getschema && { value: value0 }), idBlock: {optionalID: 0}}));
        if (getschema || value1 !== undefined)
            value.push(new asn1ts.Integer({name: "optional1", ...(!getschema && { value: value1 }), idBlock: {optionalID: 1}}));
        if (getschema || value2 !== undefined)
            value.push(new asn1ts.Boolean({name: "optional2", ...(!getschema && { value: value2 }), idBlock: {optionalID: 2}}));
    }
    return seq;
}

/**
 * Gets a large sequence with different optional parameters
 *
 * Loops a value from 0 to maximum
 *
 * value%3 == 0 -> asn1ts.boolean { value: value%2 ? true : false }
 * value%3 == 1 -> asn1ts.Integer { value: value}
 * value%3 == 2 -> asn1ts.Utf8String { value: `${value}`}
 */
function getLargeSequence(getschema: boolean, maxium: number): asn1ts.Sequence {
        const seq = new asn1ts.Sequence({
            value: [
                new asn1ts.Utf8String({name: "string", ...(!getschema && { value: "string"}) }),
                new asn1ts.Boolean({name: "mytest", ...(!getschema && { value: true}) }),
            ]
        });
        for(let value = 0; value < maxium; value++) {
            const mode = value % 3;
            if (mode === 0)
                seq.valueBlock.value.push(new asn1ts.Boolean({name: `optional_${value}`, ...(!getschema && { value: value % 2 ? true : false }), idBlock: {optionalID: value}}));
            else if (mode === 1)
                seq.valueBlock.value.push(new asn1ts.Integer({name: `optional_${value}`, ...(!getschema && { value: value }), idBlock: {optionalID: value}}));
            else if (mode === 2)
                seq.valueBlock.value.push(new asn1ts.Utf8String({name: `optional_${value}`, ...(!getschema && { value: `${value}` }), idBlock: {optionalID: value}}));
        }
        return seq;
}

/** optional2 = true; */
const optional2Set = "300e0c06737472696e670101ff8201ff";
/** optional0 = "value1"; */
/** optional1 = 2; */
/** optional2 = false; */
const allOptionalsSet = "30190c06737472696e670101ff800676616c756531810102820100";
/** Loop value from 0 to 39 (modulo%3 defines Boolean value%2 ? true : false, Integer value, UTF8String "value") */
const multipleOptionalsSet = "3081960c06737472696e670101ff8001008101018201328301ff8401048501358601008701078801388901ff8a010a8b0231318c01008d010d8e0231348f01ff90011091023137920100930113940232309501ff960116970232339801009901199a0232369b01ff9c011c9d0232399e01009f1f011f9f200233329f2101ff9f2201229f230233359f2401009f2501259f260233389f2701ff";

context("Optional parameter implementation tests", () => {
    it ("encode sequence with one optional parameter set", () => {
        const seq = getSequence(false, undefined, undefined, true);
        const data = seq.toBER();
        const hex = pvtsutils.Convert.ToHex(data);
        assert.equal(hex, optional2Set);
    });

    it ("decode sequence with one optional set", () => {
        const buf = pvtsutils.Convert.FromHex(optional2Set);
        const schema = getSequence(true);
        const result = asn1ts.verifySchema(buf, schema);
        assert.ok(result.verified, "Could not verify encoded data with schema");
        const res2 = result.result.getTypedValueByName(asn1ts.Boolean, "optional2");
        assert.notEqual(res2, undefined, "Result undefined");
        if(res2)
            assert.equal(res2.getValue(), true, "Result not true");
    });

    it ("encode sequence with all optional parameters set", () => {
        const seq = getSequence(false, "value1", 2, false);
        const data = seq.toBER();
        const hex = pvtsutils.Convert.ToHex(data);
        assert.equal(hex, allOptionalsSet);
    });

    it ("decode sequence with all optionals set", () => {
        const buf = pvtsutils.Convert.FromHex(allOptionalsSet);
        const schema = getSequence(true);
        const result = asn1ts.verifySchema(buf, schema);
        assert.ok(result.verified, "Could not verify encoded data with schema");
        const res0 = result.result.getTypedValueByName(asn1ts.Utf8String, "optional0");
        const res1 = result.result.getTypedValueByName(asn1ts.Integer, "optional1");
        const res2 = result.result.getTypedValueByName(asn1ts.Boolean, "optional2");
        assert.notEqual(res0, undefined, "Result0 undefined");
        assert.notEqual(res1, undefined, "Result1 undefined");
        assert.notEqual(res2, undefined, "Result2 undefined");
        if (res0)
            assert.equal(res0.getValue(), "value1", "Result0 invalid result value");
        if (res1)
            assert.equal(res1.getValue(), 2, "Result1 invalid result value");
        if (res2)
            assert.equal(res2.getValue(), false, "Result2 invalid result value");
    });

    it ("encode a sequence with optional parameters > 31 (multiple tag number fields)", () => {
        const seq = getLargeSequence(false, 40);
        const data = seq.toBER();
        const hex = pvtsutils.Convert.ToHex(data);
        assert.equal(hex, multipleOptionalsSet);
    });

    it ("decode a sequence with optional parameters > 31 (multiple tag number fields)", () => {
        const buf = pvtsutils.Convert.FromHex(multipleOptionalsSet);
        const schema = getLargeSequence(true, 40);
        const result = asn1ts.verifySchema(buf, schema);
        assert.ok(result.verified, "Could not verify encoded data with schema");
        for(let value = 0; value < 40; value++) {
            const mode = value % 3;
            if (mode === 0) {
                const property = result.result.getTypedValueByName(asn1ts.Boolean, `optional_${value}`);
                assert.notEqual(property, undefined, "Missing value in result");
                if (property)
                    assert.equal(property.getValue(), value % 2 ? true : false, "Value did not match the expected");
            } else if (mode === 1) {
                const property = result.result.getTypedValueByName(asn1ts.Integer, `optional_${value}`);
                assert.notEqual(property, undefined, "Missing value in result");
                if (property)
                    assert.equal(property.getValue(), value, "Value did not match the expected");
              /**  value.push(new asn1ts.Integer({name: `optional_${iOptional}`, ...(!getschema && { value: iOptional }), idBlock: {optionalID: iOptional}})); */
            }else if (mode === 2) {
                const property = result.result.getTypedValueByName(asn1ts.Utf8String, `optional_${value}`);
                assert.notEqual(property, undefined, "Missing value in result");
                if (property)
                    assert.equal(property.getValue(), `${value}`, "Value did not match the expected");
            }
        }
    });


    it ("access existing optional property by name", () => {
        const buf = pvtsutils.Convert.FromHex(optional2Set);
        const schema = getSequence(true);
        const result = asn1ts.verifySchema(buf, schema);
        assert.ok(result.verified, "Could not verify encoded data with schema");
        const obj = result.result.getValueByName("optional2");
        assert.ok(obj !== undefined, "Object not found");
    });

    it ("access existing optional property by name and type", () => {
        const buf = pvtsutils.Convert.FromHex(optional2Set);
        const schema = getSequence(true);
        const result = asn1ts.verifySchema(buf, schema);
        assert.ok(result.verified, "Could not verify encoded data with schema");
        const obj = result.result.getTypedValueByName(asn1ts.Boolean, "optional2");
        assert.ok(obj !== undefined, "Object not found");
        if (obj)
            assert.equal(obj.getValue(), true, "Property not true");
    });

    it ("access not existing optional property by name", () => {
        const buf = pvtsutils.Convert.FromHex(optional2Set);
        const schema = getSequence(true);
        const result = asn1ts.verifySchema(buf, schema);
        assert.ok(result.verified, "Could not verify encoded data with schema");
        const obj = result.result.getValueByName("optional1");
        assert.equal(obj, undefined, "Object not undefined");
    });

    it ("access not existing optional property by name and type by wrong name", () => {
        const buf = pvtsutils.Convert.FromHex(optional2Set);
        const schema = getSequence(true);
        const result = asn1ts.verifySchema(buf, schema);
        assert.ok(result.verified, "Could not verify encoded data with schema");
        const obj = result.result.getTypedValueByName(asn1ts.Boolean, "optional1");
        assert.equal(obj, undefined, "Object not undefined");
    });

    it ("access not existing optional property by name and type by wrong type", () => {
        const buf = pvtsutils.Convert.FromHex(optional2Set);
        const schema = getSequence(true);
        const result = asn1ts.verifySchema(buf, schema);
        assert.ok(result.verified, "Could not verify encoded data with schema");
        const obj = result.result.getTypedValueByName(asn1ts.Utf8String, "optional2");
        assert.equal(obj, undefined, "Object not undefined");
    });


    it ("not ordered optionals in schema", () => {
        const schema = getSequence(true, undefined, undefined, undefined, true);
        const data = getSequence(false, "string", 1, true, false);
        const encoded = data.toBER();
        const result = asn1ts.verifySchema(encoded, schema);
        assert.ok(result.verified, "Could not verify encoded data with schema");
        const obj1 = result.result.getTypedValueByName(asn1ts.Utf8String, "optional0");
        const obj2 = result.result.getTypedValueByName(asn1ts.Integer, "optional1");
        const obj3 = result.result.getTypedValueByName(asn1ts.Boolean, "optional2");
        assert.notEqual(obj1, undefined, "Object not undefined");
        if(obj1)
            assert.equal(obj1.getValue(), "string", "wrong value");
        assert.notEqual(obj2, undefined, "Object not undefined");
        if(obj2)
            assert.equal(obj2.getValue(), 1, "wrong value");
        assert.notEqual(obj3, undefined, "Object not undefined");
        if(obj3)
            assert.equal(obj3.getValue(), true, "wrong value");
    });
});

