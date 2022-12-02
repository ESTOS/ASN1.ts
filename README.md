## ASN1.ts

[![License](https://img.shields.io/badge/license-BSD-green.svg?style=flat)](https://raw.githubusercontent.com/ESTOS/ASN1.ts/master/LICENSE) [![Test](https://github.com/estos/ASN1.js/actions/workflows/test.yml/badge.svg)](https://github.com/estos/ASN1.js/actions/workflows/test.yml) [![NPM version](https://badge.fury.io/js/ASN1.ts.svg)](http://badge.fury.io/js/ASN1.ts) [![Coverage Status](https://coveralls.io/repos/github/estos/ASN1.js/badge.svg?branch=master)](https://coveralls.io/github/ESTOS/ASN1.ts?branch=master)

Abstract Syntax Notation One (ASN.1) is a standard and notation that describes rules and structures for representing, encoding, transmitting, and decoding data in telecommunications and computer networking. [ASN1.ts] is a cross platform ASN1 library written in typescript. It supports encoding and (schema supported) decoding of ber encoded asn1 structures. ASN.1 is the basis of all X.509 related data structures and numerous other protocols used on the web.
Yury Strozhevsky, GMO GlobalSign and Peculiar Ventures are the authors of the library. estos extends this library as some bits and pieces have been missing. To get to know the additions see [What has been added by estos] below

## Introduction
[ASN1.ts] is the first library for [BER] encoding/decoding in Javascript designed for browser use. [BER] is the basic encoding rules for [ASN.1] that all others are based on, [DER] is the encoding rules used by PKI applications - it is a subset of [BER]. The [ASN1.ts] library was tested against [freely available ASN.1:2008 test suite], with some limitations related to JavaScript language. 

## Features of the library
* Based on latest features of JavaScript language from ES2015 standard;
* Fully object-oriented library. Inheritance is using everywhere inside the lib;
* Working with HTML5 data objects (ArrayBuffer, Uint8Array etc.);
* Working with all ASN.1:2008 types;
* Working with [BER] encoded data;
* All types inside the library constantly stores information about all ASN.1 sub blocks (tag block, length block or value block);
* User may have access to any byte inside any ASN.1 sub-block;
* Any sub-block may have unlimited length, as it described in ASN.1 standard (even "tag block");
* Ability to work with ASN.1 string date types (including all "international" strings like UniversalString, BMPString, UTF8String) by passing native JavaScript strings into constructors. And vice versa - all initially parsed data of ASN.1 string types right after decoding automatically converts into native JavaScript strings;
* Same with ASN.1 date-time types: for major types like UTCTime and GeneralizedTime there are automatic conversion between "JS date type - ASN.1 date-time type" + vice versa;
* Same with ASN.1 OBJECT-IDENTIFIER (OID) data-type: you can initialize OID by JavaScript string and can get string representation via calling "oid.valueBlock.toString()";
* Working with "easy-to-understand" ASN.1 schemas (pre-defined or built by user);
* Has special types to work with ASN.1 schemas:
  * Any
  * Choice
  * Repeated 
* User can name any block inside ASN.1 schema and easily get information by name;
* Ability to parse internal data inside a primitively encoded data types and automatically validate it against special schema;
* All types inside library are dynamic;
* All types can be initialized in static or dynamic ways.
* [ASN1.ts] fully tested against [ASN.1:2008 TestSuite].

## What has been added by estos
* Support for asn1 real
* Support for implicit properties (The ber encoded data points to the scheme to tell the decoder what it is)
* Schema validation of repeated values
* While validating data aginst a scheme: Take over attributes from the scheme into the parsed data e.g. the value name to be able to access those later by name)
* Getter methods to get values by name and to ensure that they are of a certain type (getValueByName, getTypeValueByName)
* The schema validation returns an array of errors with context to get to know where an error has occured
* Typeguard methods that ensure that an object is of a certain type (based on tagclass and tagnumber)
* Improved test coverage by usecases (not only based on generic test data) (e.g. choice, repeated, optionals, schema validation)

## Examples

When playing around an online asn1 ber decoder is a helpfull tool to have on hand.
e.g. https://lapo.it/asn1js

### How to create a simple ASN structures
```typescript
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
console.log(Buffer.from(new Uint8Array(encoded)).toString("hex"));
```

### How to validate data against a scheme
```typescript
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
if (result.verified) {
	// Schema has been verified, let´s get the property "integer_value"
	const asn1tsInteger = result.result.getTypedValueByName(asn1ts.Integer, "integer_value");
	if (asn1tsInteger) {
		// 1
		console.log(asn1tsInteger.getValue());
	}
} else {
	console.log(result.errors);
}
```

### How to use implicit optional properties (smaller footprint when asn1 encoded, the schema tells the decoder what it shall decode)
```typescript
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
if (result.verified) {
	// Schema has been verified, let´s get the property "integer_value"
	const asn1tsInteger = result.result.getTypedValueByName(asn1ts.Integer, "integer_value");
	if (asn1tsInteger) {
		// 2
		console.log(asn1tsInteger.getValue());
	}
} else {
	console.log(result.errors);
}
```

Check the test directory as these contain use case driven tests for different scenarios.

## Developing
* Use Visual Studio Code, have the "Mocha Test Explorer" installed

## Related source code 
* [asn1.js](https://github.com/PeculiarVentures/ASN1.js) - the "father" of [ASN1js] project;
* [C++ ASN1:2008 BER coder/decoder](https://github.com/YuryStrozhevsky/C-plus-plus-ASN.1-2008-coder-decoder) - the "father" of [ASN1js] project;
* [Freely available ASN.1:2008 test suite](https://github.com/YuryStrozhevsky/ASN1-2008-free-test-suite) - the suite which can help you to validate (and better understand) any ASN.1 coder/decoder;
* [NPM package for ASN.1:2008 test suite](https://github.com/YuryStrozhevsky/asn1-test-suite)

## Suitability
We are using asn1ts in combination with other asn1 ber encoders decoders. Interoperability is our daily business between different communication systems and devices. We are using a mixed product ecosystem where asn1 ber data is encoded decoded by the [esnacc] compiler as well as products from [Objective Systems].

There are several commercial products, enterprise solutions as well as open source project based on versions of ASN1js. You should, however, do your own code and security review before utilization in a production application before utilizing any open source library to ensure it will meet your needs.

## License
Copyright (c) 2014, [GMO GlobalSign](https://www.globalsign.com/)
Copyright (c) 2015-2022, [Peculiar Ventures](https://peculiarventures.com/)
Copyright (c) 2022, [estos GmbH](https://www.estos.de) for extensions and missing features (see README.md)
All rights reserved.

Author 2014-2018, [Yury Strozhevsky](https://www.strozhevsky.com/)
Author 2019-2022, [Peculiar Ventures](https://peculiarventures.com/)
Author from 2022, [estos GmbH](https://www.estos.de)

estos created a fork of the library, mainly written by Yury Strozhevsky and
Peculiar Ventures, in 2022 to add extensions, missing features. Details about those in the README.md

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice, this
  list of conditions and the following disclaimer in the documentation and/or
  other materials provided with the distribution.

* Neither the name of the copyright holder nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

[ASN.1]: https://en.wikipedia.org/wiki/Abstract_Syntax_Notation_One
[PKIjs]: https://pkijs.org/
[BER]: https://en.wikipedia.org/wiki/X.690#BER_encoding
[freely available ASN.1:2008 test suite]: https://www.strozhevsky.com/free_docs/free_asn1_testsuite_descr.pdf
[ASN.1:2008 TestSuite]: https://github.com/YuryStrozhevsky/asn1-test-suite
[esnacc]: http://esnacc.org/
[Objective Systems]: https://obj-sys.com/
