import "whatwg-fetch";

export var Buffer = window.Buffer || require("buffer-browserify").Buffer;
var bufferFill = require("buffer-fill");

export const process = {
    cwd: () => "",
    env: {},
};

function allocUnsafe(size) {
    if (typeof size !== "number") {
        throw new TypeError('"size" argument must be a number');
    }

    if (size < 0) {
        throw new RangeError('"size" argument must not be negative');
    }

    return new Buffer(size);
}

var toString = Object.prototype.toString;

function isArrayBuffer(input) {
    return toString.call(input).slice(8, -1) === "ArrayBuffer";
}

function fromArrayBuffer(obj, byteOffset, length) {
    byteOffset >>>= 0;

    var maxLength = obj.byteLength - byteOffset;

    if (maxLength < 0) {
        throw new RangeError("'offset' is out of bounds");
    }

    if (length === undefined) {
        length = maxLength;
    } else {
        length >>>= 0;

        if (length > maxLength) {
            throw new RangeError("'length' is out of bounds");
        }
    }

    return new Buffer(
        new Uint8Array(obj.slice(byteOffset, byteOffset + length))
    );
}

function fromString(string, encoding) {
    if (typeof encoding !== "string" || encoding === "") {
        encoding = "utf8";
    }

    if (!Buffer.isEncoding(encoding)) {
        throw new TypeError('"encoding" must be a valid string encoding');
    }

    return new Buffer(string, encoding);
}

function bufferFrom(value, encodingOrOffset, length) {
    if (typeof value === "number") {
        throw new TypeError('"value" argument must not be a number');
    }

    if (isArrayBuffer(value)) {
        return fromArrayBuffer(value, encodingOrOffset, length);
    }

    if (typeof value === "string") {
        return fromString(value, encodingOrOffset);
    }

    return new Buffer(value);
}

Buffer.alloc = function alloc(size, fill, encoding) {
    if (typeof size !== "number") {
        throw new TypeError('"size" argument must be a number');
    }

    if (size < 0) {
        throw new RangeError('"size" argument must not be negative');
    }

    var buffer = allocUnsafe(size);

    if (size === 0) {
        return buffer;
    }

    if (fill === undefined) {
        return bufferFill(buffer, 0);
    }

    if (typeof encoding !== "string") {
        encoding = undefined;
    }

    return bufferFill(buffer, fill, encoding);
};
Buffer.allocUnsafe = allocUnsafe;
Buffer.from = bufferFrom;
Object.defineProperty(Buffer.prototype, "buffer", {
    get: function myProperty() {
        return this;
    },
});
Object.defineProperty(Buffer.prototype, "byteOffset", {
    get: function myProperty() {
        return this.offset;
    },
});
Object.defineProperty(Buffer.prototype, "byteLength", {
    get: function myProperty() {
        return this.length;
    },
});
