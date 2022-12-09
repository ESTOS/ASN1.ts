import * as assert from "assert";
import * as asn1ts from "../src";
import * as pvtsutils from "pvtsutils";

/**
 * Encodes a number value as real and returns the BER hex notation of it
 *
 * @param value the value to encode
 * @returns the hex BER encoded value
 */
function encodeReal(value: number): string {
    const real = new asn1ts.Real({value});
    const data = real.toBER();
    return pvtsutils.Convert.ToHex(data);
}

/**
 * Decodes a BER hex encoded number and returns the number value or undefined on failure
 *
 * @param value the hex BER encoded value
 * @returns the number value or undefined on error
 */
function decodeReal(value: string): number | undefined {
    const data = pvtsutils.Convert.FromHex(value);
    const result = asn1ts.fromBER(data);
    if(result.result instanceof asn1ts.Real)
        return result.result.valueBlock.value;
    return undefined;
}

context("Asn1Real implementation tests", () => {
    it("decode asnreal -0.128 base 2, objective systems created", () => {
        const testValue = -0.128;
        const resultValue = decodeReal("0909c0cb04189374bc6a7f");
        assert.equal(testValue, resultValue, "Result value does not match expected value");
    });

    it("decode asnreal 0.128 base 2, objective systems created", () => {
        const testValue = 0.128;
        const resultValue = decodeReal("090980cb04189374bc6a7f");
        assert.equal(testValue, resultValue, "Result value does not match expected value");
    });

    it("decode asnreal -128 base 2, objective systems created", () => {
        const testValue = -128;
        const resultValue = decodeReal("0903c00701");
        assert.equal(testValue, resultValue, "Result value does not match expected value");
    });

    it("decode asnreal 128 base 2, objective systems created", () => {
        const testValue = 128;
        const resultValue = decodeReal("0903800701");
        assert.equal(testValue, resultValue, "Result value does not match expected value");
    });

    it("decode asnreal -129 base 2, objective systems created", () => {
        const testValue = -129;
        const resultValue = decodeReal("0903c00081");
        assert.equal(testValue, resultValue, "Result value does not match expected value");
    });

    it("decode asnreal 129 base 2, objective systems created", () => {
        const testValue = 129;
        const resultValue = decodeReal("0903800081");
        assert.equal(testValue, resultValue, "Result value does not match expected value");
    });

    it("decode asnreal 32639 base 2, objective systems created", () => {
        const testValue = 32639;
        const resultValue = decodeReal("090480007f7f");
        assert.equal(testValue, resultValue, "Result value does not match expected value");
    });
    it("decode asnreal -32639 base 2, objective systems created", () => {
        const testValue = -32639;
        const resultValue = decodeReal("0904c0007f7f");
        assert.equal(testValue, resultValue, "Result value does not match expected value");
    });

    it("decode asnreal 32640 base 2, objective systems created", () => {
        const testValue = 32640;
        const resultValue = decodeReal("09038007ff");
        assert.equal(testValue, resultValue, "Result value does not match expected value");
    });

    it("decode asnreal -32640 base 2, objective systems created", () => {
        const testValue = -32640;
        const resultValue = decodeReal("0903c007ff");
        assert.equal(testValue, resultValue, "Result value does not match expected value");
    });

    it("decode asnreal 9e+45 base 2, objective systems created", () => {
        const testValue = 9e45;
        const resultValue = decodeReal("09 09 80 65 0c 9c 97 77 25 e4 19");
        assert.equal(testValue, resultValue, "Result value does not match expected value");
    });

    it("decode asnreal 9e-45 base 2, objective systems created", () => {
        const testValue = 9e-45;
        const resultValue = decodeReal("09 0a 81 ff 3d 01 9b 0c 1e 2d e5 81");
        assert.equal(testValue, resultValue, "Result value does not match expected value");
    });

    it("decode asnreal -9e+45 base 2, objective systems created", () => {
        const testValue = -9e45;
        const resultValue = decodeReal("09 09 c0 65 0c 9c 97 77 25 e4 19");
        assert.equal(testValue, resultValue, "Result value does not match expected value");
    });

    it("decode asnreal -9e-45 base 2, objective systems created", () => {
        const testValue = -9e-45;
        const resultValue = decodeReal("09 0a c1 ff 3d 01 9b 0c 1e 2d e5 81");
        assert.equal(testValue, resultValue, "Result value does not match expected value");
    });

    it("decode asnreal +∞, objective systems created", () => {
        const testValue = Number.POSITIVE_INFINITY;
        const resultValue = decodeReal("09 01 40");
        assert.equal(testValue, resultValue, "Result value does not match expected value");
    });

    it("decode asnreal -∞, objective systems created", () => {
        const testValue = Number.NEGATIVE_INFINITY;
        const resultValue = decodeReal("09 01 41");
        assert.equal(testValue, resultValue, "Result value does not match expected value");
    });

    it("decode asnreal NaN, objective systems created", () => {
        const testValue = Number.NaN;
        const resultValue = decodeReal("09 01 42");
        assert.equal(testValue, resultValue, "Result value does not match expected value");
    });


    it("encode & decode asnreal 0.128 base 2", () => {
        const testValue = 0.128;
        const encoded = encodeReal(testValue);
        const resultValue = decodeReal(encoded);
        assert.equal(testValue, resultValue, "Result value does not match expected value");
    });

    it("encode & decode asnreal -0.128 base 2", () => {
        const testValue = -0.128;
        const encoded = encodeReal(testValue);
        const resultValue = decodeReal(encoded);
        assert.equal(testValue, resultValue, "Result value does not match expected value");
    });

    it("encode & decode asnreal 128 base 2", () => {
        const testValue = 128;
        const encoded = encodeReal(testValue);
        const resultValue = decodeReal(encoded);
        assert.equal(testValue, resultValue, "Result value does not match expected value");
    });

    it("encode & decode asnreal -128 base 2", () => {
        const testValue = -128;
        const encoded = encodeReal(testValue);
        const resultValue = decodeReal(encoded);
        assert.equal(testValue, resultValue, "Result value does not match expected value");
    });

    it("encode & decode asnreal 129 base 2", () => {
        const testValue = 129;
        const encoded = encodeReal(testValue);
        const resultValue = decodeReal(encoded);
        assert.equal(testValue, resultValue, "Result value does not match expected value");
    });

    it("encode & decode asnreal -129 base 2", () => {
        const testValue = -129;
        const encoded = encodeReal(testValue);
        const resultValue = decodeReal(encoded);
        assert.equal(testValue, resultValue, "Result value does not match expected value");
    });

    it("encode & decode asnreal 32639 base 2", () => {
        const testValue = 32639;
        const encoded = encodeReal(testValue);
        const resultValue = decodeReal(encoded);
        assert.equal(testValue, resultValue, "Result value does not match expected value");
    });

    it("encode & decode asnreal -32639 base 2", () => {
        const testValue = -32639;
        const encoded = encodeReal(testValue);
        const resultValue = decodeReal(encoded);
        assert.equal(testValue, resultValue, "Result value does not match expected value");
    });

    it("encode & decode asnreal 32640 base 2", () => {
        const testValue = 32640;
        const encoded = encodeReal(testValue);
        const resultValue = decodeReal(encoded);
        assert.equal(testValue, resultValue, "Result value does not match expected value");
    });

    it("encode & decode asnreal -32640 base 2", () => {
        const testValue = -32640;
        const encoded = encodeReal(testValue);
        const resultValue = decodeReal(encoded);
        assert.equal(testValue, resultValue, "Result value does not match expected value");
    });

    it("encode & decode asnreal 9e+45 base 2", () => {
        const testValue = 9e+45;
        const encoded = encodeReal(testValue);
        const resultValue = decodeReal(encoded);
        assert.equal(testValue, resultValue, "Result value does not match expected value");
    });

    it("encode & decode asnreal -9e+45 base 2", () => {
        const testValue = -9e+45;
        const encoded = encodeReal(testValue);
        const resultValue = decodeReal(encoded);
        assert.equal(testValue, resultValue, "Result value does not match expected value");
    });

    it("encode & decode asnreal 9e-45 base 2", () => {
        const testValue = 9e-45;
        const encoded = encodeReal(testValue);
        const resultValue = decodeReal(encoded);
        assert.equal(testValue, resultValue, "Result value does not match expected value");
    });


    it("encode & decode asnreal -9e-45 base 2", () => {
        const testValue = -9e-45;
        const encoded = encodeReal(testValue);
        const resultValue = decodeReal(encoded);
        assert.equal(testValue, resultValue, "Result value does not match expected value");
    });

    /*
        it("encode & decode asnreal random 1.000.000 iterations", () => {
            for(let iCount = 0; iCount < 1000000; iCount++) {
                let testValue = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
                if(Math.floor(Math.random() * 2) === 0)
                    testValue *= -1;
                if(Math.floor(Math.random() * 2) === 0) {
                    const divider = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
                        testValue /= divider;
                }
                const encoded = encodeReal(testValue);
                const resultValue = decodeReal(encoded);
                if(iCount % 10000 == 0)
                    console.log(`${Math.round(iCount * 100 / 1000000)}% - ${testValue} => ${encoded}`);
                assert.equal(testValue, resultValue, `Result value ${resultValue} does not match expected value ${testValue}`);
            }
        });
    */
});
