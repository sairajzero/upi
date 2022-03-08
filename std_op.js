(typeof global !== "undefined" ? global : window).cryptocoin = floGlobals.blockchain;
/*  Util Libraries required for Standard operations
    All credits for these codes belong to their respective creators, moderators and owners.
    For more info on licence for these codes, visit respective source.
*/
'use strict';
//Crypto.js
(function(GLOBAL) {
    // Global Crypto object
    var Crypto = GLOBAL.Crypto = {};
    /*!
     * Crypto-JS v2.5.4  Crypto.js
     * http://code.google.com/p/crypto-js/
     * Copyright (c) 2009-2013, Jeff Mott. All rights reserved.
     * http://code.google.com/p/crypto-js/wiki/License
     */
    (function() {

        var base64map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

        // Crypto utilities
        var util = Crypto.util = {

            // Bit-wise rotate left
            rotl: function(n, b) {
                return (n << b) | (n >>> (32 - b));
            },

            // Bit-wise rotate right
            rotr: function(n, b) {
                return (n << (32 - b)) | (n >>> b);
            },

            // Swap big-endian to little-endian and vice versa
            endian: function(n) {

                // If number given, swap endian
                if (n.constructor == Number) {
                    return util.rotl(n, 8) & 0x00FF00FF |
                        util.rotl(n, 24) & 0xFF00FF00;
                }

                // Else, assume array and swap all items
                for (var i = 0; i < n.length; i++)
                    n[i] = util.endian(n[i]);
                return n;

            },

            // Generate an array of any length of random bytes
            randomBytes: function(n) {
                for (var bytes = []; n > 0; n--)
                    bytes.push(Math.floor(Math.random() * 256));
                return bytes;
            },

            // Convert a byte array to big-endian 32-bit words
            bytesToWords: function(bytes) {
                for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8)
                    words[b >>> 5] |= (bytes[i] & 0xFF) << (24 - b % 32);
                return words;
            },

            // Convert big-endian 32-bit words to a byte array
            wordsToBytes: function(words) {
                for (var bytes = [], b = 0; b < words.length * 32; b += 8)
                    bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
                return bytes;
            },

            // Convert a byte array to a hex string
            bytesToHex: function(bytes) {
                for (var hex = [], i = 0; i < bytes.length; i++) {
                    hex.push((bytes[i] >>> 4).toString(16));
                    hex.push((bytes[i] & 0xF).toString(16));
                }
                return hex.join("");
            },

            // Convert a hex string to a byte array
            hexToBytes: function(hex) {
                for (var bytes = [], c = 0; c < hex.length; c += 2)
                    bytes.push(parseInt(hex.substr(c, 2), 16));
                return bytes;
            },

            // Convert a byte array to a base-64 string
            bytesToBase64: function(bytes) {
                for (var base64 = [], i = 0; i < bytes.length; i += 3) {
                    var triplet = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
                    for (var j = 0; j < 4; j++) {
                        if (i * 8 + j * 6 <= bytes.length * 8)
                            base64.push(base64map.charAt((triplet >>> 6 * (3 - j)) & 0x3F));
                        else base64.push("=");
                    }
                }

                return base64.join("");
            },

            // Convert a base-64 string to a byte array
            base64ToBytes: function(base64) {
                // Remove non-base-64 characters
                base64 = base64.replace(/[^A-Z0-9+\/]/ig, "");

                for (var bytes = [], i = 0, imod4 = 0; i < base64.length; imod4 = ++i % 4) {
                    if (imod4 == 0) continue;
                    bytes.push(((base64map.indexOf(base64.charAt(i - 1)) & (Math.pow(2, -2 * imod4 + 8) - 1)) << (imod4 * 2)) |
                        (base64map.indexOf(base64.charAt(i)) >>> (6 - imod4 * 2)));
                }

                return bytes;
            }

        };

        // Crypto character encodings
        var charenc = Crypto.charenc = {};

        // UTF-8 encoding
        var UTF8 = charenc.UTF8 = {

            // Convert a string to a byte array
            stringToBytes: function(str) {
                return Binary.stringToBytes(unescape(encodeURIComponent(str)));
            },

            // Convert a byte array to a string
            bytesToString: function(bytes) {
                return decodeURIComponent(escape(Binary.bytesToString(bytes)));
            }

        };

        // Binary encoding
        var Binary = charenc.Binary = {

            // Convert a string to a byte array
            stringToBytes: function(str) {
                for (var bytes = [], i = 0; i < str.length; i++)
                    bytes.push(str.charCodeAt(i) & 0xFF);
                return bytes;
            },

            // Convert a byte array to a string
            bytesToString: function(bytes) {
                for (var str = [], i = 0; i < bytes.length; i++)
                    str.push(String.fromCharCode(bytes[i]));
                return str.join("");
            }

        };

    })();
    //Adding SHA1 to fix basic PKBDF2
    /*
     * Crypto-JS v2.5.4
     * http://code.google.com/p/crypto-js/
     * (c) 2009-2012 by Jeff Mott. All rights reserved.
     * http://code.google.com/p/crypto-js/wiki/License
     */
    (function() {

        // Shortcuts
        var C = Crypto,
            util = C.util,
            charenc = C.charenc,
            UTF8 = charenc.UTF8,
            Binary = charenc.Binary;

        // Public API
        var SHA1 = C.SHA1 = function(message, options) {
            var digestbytes = util.wordsToBytes(SHA1._sha1(message));
            return options && options.asBytes ? digestbytes :
                options && options.asString ? Binary.bytesToString(digestbytes) :
                util.bytesToHex(digestbytes);
        };

        // The core
        SHA1._sha1 = function(message) {

            // Convert to byte array
            if (message.constructor == String) message = UTF8.stringToBytes(message);
            /* else, assume byte array already */

            var m = util.bytesToWords(message),
                l = message.length * 8,
                w = [],
                H0 = 1732584193,
                H1 = -271733879,
                H2 = -1732584194,
                H3 = 271733878,
                H4 = -1009589776;

            // Padding
            m[l >> 5] |= 0x80 << (24 - l % 32);
            m[((l + 64 >>> 9) << 4) + 15] = l;

            for (var i = 0; i < m.length; i += 16) {

                var a = H0,
                    b = H1,
                    c = H2,
                    d = H3,
                    e = H4;

                for (var j = 0; j < 80; j++) {

                    if (j < 16) w[j] = m[i + j];
                    else {
                        var n = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16];
                        w[j] = (n << 1) | (n >>> 31);
                    }

                    var t = ((H0 << 5) | (H0 >>> 27)) + H4 + (w[j] >>> 0) + (
                        j < 20 ? (H1 & H2 | ~H1 & H3) + 1518500249 :
                        j < 40 ? (H1 ^ H2 ^ H3) + 1859775393 :
                        j < 60 ? (H1 & H2 | H1 & H3 | H2 & H3) - 1894007588 :
                        (H1 ^ H2 ^ H3) - 899497514);

                    H4 = H3;
                    H3 = H2;
                    H2 = (H1 << 30) | (H1 >>> 2);
                    H1 = H0;
                    H0 = t;

                }

                H0 += a;
                H1 += b;
                H2 += c;
                H3 += d;
                H4 += e;

            }

            return [H0, H1, H2, H3, H4];

        };

        // Package private blocksize
        SHA1._blocksize = 16;

        SHA1._digestsize = 20;

    })();

    //Added to make PKBDF2 work
    /*
     * Crypto-JS v2.5.4
     * http://code.google.com/p/crypto-js/
     * (c) 2009-2012 by Jeff Mott. All rights reserved.
     * http://code.google.com/p/crypto-js/wiki/License
     */
    (function() {

        // Shortcuts
        var C = Crypto,
            util = C.util,
            charenc = C.charenc,
            UTF8 = charenc.UTF8,
            Binary = charenc.Binary;

        C.HMAC = function(hasher, message, key, options) {

            // Convert to byte arrays
            if (message.constructor == String) message = UTF8.stringToBytes(message);
            if (key.constructor == String) key = UTF8.stringToBytes(key);
            /* else, assume byte arrays already */

            // Allow arbitrary length keys
            if (key.length > hasher._blocksize * 4)
                key = hasher(key, {
                    asBytes: true
                });

            // XOR keys with pad constants
            var okey = key.slice(0),
                ikey = key.slice(0);
            for (var i = 0; i < hasher._blocksize * 4; i++) {
                okey[i] ^= 0x5C;
                ikey[i] ^= 0x36;
            }

            var hmacbytes = hasher(okey.concat(hasher(ikey.concat(message), {
                asBytes: true
            })), {
                asBytes: true
            });

            return options && options.asBytes ? hmacbytes :
                options && options.asString ? Binary.bytesToString(hmacbytes) :
                util.bytesToHex(hmacbytes);

        };

    })();


    //crypto-sha256-hmac.js
    /*
     * Crypto-JS v2.5.4
     * http://code.google.com/p/crypto-js/
     * (c) 2009-2012 by Jeff Mott. All rights reserved.
     * http://code.google.com/p/crypto-js/wiki/License
     */
    (function() {
        var d = Crypto,
            k = d.util,
            g = d.charenc,
            b = g.UTF8,
            a = g.Binary,
            c = [1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221,
                3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580,
                3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986,
                2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895,
                666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037,
                2730485921,
                2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734,
                506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222,
                2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298
            ],
            e = d.SHA256 = function(b, c) {
                var f = k.wordsToBytes(e._sha256(b));
                return c && c.asBytes ? f : c && c.asString ? a.bytesToString(f) : k.bytesToHex(f)
            };
        e._sha256 = function(a) {
            a.constructor == String && (a = b.stringToBytes(a));
            var e = k.bytesToWords(a),
                f = a.length * 8,
                a = [1779033703, 3144134277,
                    1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225
                ],
                d = [],
                g, m, r, i, n, o, s, t, h, l, j;
            e[f >> 5] |= 128 << 24 - f % 32;
            e[(f + 64 >> 9 << 4) + 15] = f;
            for (t = 0; t < e.length; t += 16) {
                f = a[0];
                g = a[1];
                m = a[2];
                r = a[3];
                i = a[4];
                n = a[5];
                o = a[6];
                s = a[7];
                for (h = 0; h < 64; h++) {
                    h < 16 ? d[h] = e[h + t] : (l = d[h - 15], j = d[h - 2], d[h] = ((l << 25 | l >>> 7) ^
                        (l << 14 | l >>> 18) ^ l >>> 3) + (d[h - 7] >>> 0) + ((j << 15 | j >>> 17) ^
                        (j << 13 | j >>> 19) ^ j >>> 10) + (d[h - 16] >>> 0));
                    j = f & g ^ f & m ^ g & m;
                    var u = (f << 30 | f >>> 2) ^ (f << 19 | f >>> 13) ^ (f << 10 | f >>> 22);
                    l = (s >>> 0) + ((i << 26 | i >>> 6) ^ (i << 21 | i >>> 11) ^ (i << 7 | i >>> 25)) +
                        (i & n ^ ~i & o) + c[h] + (d[h] >>> 0);
                    j = u + j;
                    s = o;
                    o = n;
                    n = i;
                    i = r + l >>> 0;
                    r = m;
                    m = g;
                    g = f;
                    f = l + j >>> 0
                }
                a[0] += f;
                a[1] += g;
                a[2] += m;
                a[3] += r;
                a[4] += i;
                a[5] += n;
                a[6] += o;
                a[7] += s
            }
            return a
        };
        e._blocksize = 16;
        e._digestsize = 32
    })();
    (function() {
        var d = Crypto,
            k = d.util,
            g = d.charenc,
            b = g.UTF8,
            a = g.Binary;
        d.HMAC = function(c, e, d, g) {
            e.constructor == String && (e = b.stringToBytes(e));
            d.constructor == String && (d = b.stringToBytes(d));
            d.length > c._blocksize * 4 && (d = c(d, {
                asBytes: !0
            }));
            for (var f = d.slice(0), d = d.slice(0), q = 0; q < c._blocksize * 4; q++) f[q] ^= 92, d[q] ^=
                54;
            c = c(f.concat(c(d.concat(e), {
                asBytes: !0
            })), {
                asBytes: !0
            });
            return g && g.asBytes ? c : g && g.asString ? a.bytesToString(c) : k.bytesToHex(c)
        }
    })();
})(typeof global !== "undefined" ? global : window);

//SecureRandom.js
(function(GLOBAL) {

    const getRandomValues = function(buf) {
        if (typeof require === 'function') {
            var bytes = require('crypto').randomBytes(buf.length);
            buf.set(bytes)
            return buf;
        } else if (GLOBAL.crypto && GLOBAL.crypto.getRandomValues)
            return GLOBAL.crypto.getRandomValues(buf);
        else
            return null;
    }

    /*!
     * Random number generator with ArcFour PRNG
     *
     * NOTE: For best results, put code like
     * <body onclick='SecureRandom.seedTime();' onkeypress='SecureRandom.seedTime();'>
     * in your main HTML document.
     *
     * Copyright Tom Wu, bitaddress.org  BSD License.
     * http://www-cs-students.stanford.edu/~tjw/jsbn/LICENSE
     */

    // Constructor function of Global SecureRandom object
    var sr = GLOBAL.SecureRandom = function() {};

    // Properties
    sr.state;
    sr.pool;
    sr.pptr;
    sr.poolCopyOnInit;

    // Pool size must be a multiple of 4 and greater than 32.
    // An array of bytes the size of the pool will be passed to init()
    sr.poolSize = 256;

    // --- object methods ---

    // public method
    // ba: byte array
    sr.prototype.nextBytes = function(ba) {
        var i;
        if (getRandomValues && GLOBAL.Uint8Array) {
            try {
                var rvBytes = new Uint8Array(ba.length);
                getRandomValues(rvBytes);
                for (i = 0; i < ba.length; ++i)
                    ba[i] = sr.getByte() ^ rvBytes[i];
                return;
            } catch (e) {
                alert(e);
            }
        }
        for (i = 0; i < ba.length; ++i) ba[i] = sr.getByte();
    };


    // --- static methods ---

    // Mix in the current time (w/milliseconds) into the pool
    // NOTE: this method should be called from body click/keypress event handlers to increase entropy
    sr.seedTime = function() {
        sr.seedInt(new Date().getTime());
    }

    sr.getByte = function() {
        if (sr.state == null) {
            sr.seedTime();
            sr.state = sr.ArcFour(); // Plug in your RNG constructor here
            sr.state.init(sr.pool);
            sr.poolCopyOnInit = [];
            for (sr.pptr = 0; sr.pptr < sr.pool.length; ++sr.pptr)
                sr.poolCopyOnInit[sr.pptr] = sr.pool[sr.pptr];
            sr.pptr = 0;
        }
        // TODO: allow reseeding after first request
        return sr.state.next();
    }

    // Mix in a 32-bit integer into the pool
    sr.seedInt = function(x) {
        sr.seedInt8(x);
        sr.seedInt8((x >> 8));
        sr.seedInt8((x >> 16));
        sr.seedInt8((x >> 24));
    }

    // Mix in a 16-bit integer into the pool
    sr.seedInt16 = function(x) {
        sr.seedInt8(x);
        sr.seedInt8((x >> 8));
    }

    // Mix in a 8-bit integer into the pool
    sr.seedInt8 = function(x) {
        sr.pool[sr.pptr++] ^= x & 255;
        if (sr.pptr >= sr.poolSize) sr.pptr -= sr.poolSize;
    }

    // Arcfour is a PRNG
    sr.ArcFour = function() {
        function Arcfour() {
            this.i = 0;
            this.j = 0;
            this.S = new Array();
        }

        // Initialize arcfour context from key, an array of ints, each from [0..255]
        function ARC4init(key) {
            var i, j, t;
            for (i = 0; i < 256; ++i)
                this.S[i] = i;
            j = 0;
            for (i = 0; i < 256; ++i) {
                j = (j + this.S[i] + key[i % key.length]) & 255;
                t = this.S[i];
                this.S[i] = this.S[j];
                this.S[j] = t;
            }
            this.i = 0;
            this.j = 0;
        }

        function ARC4next() {
            var t;
            this.i = (this.i + 1) & 255;
            this.j = (this.j + this.S[this.i]) & 255;
            t = this.S[this.i];
            this.S[this.i] = this.S[this.j];
            this.S[this.j] = t;
            return this.S[(t + this.S[this.i]) & 255];
        }

        Arcfour.prototype.init = ARC4init;
        Arcfour.prototype.next = ARC4next;

        return new Arcfour();
    };


    // Initialize the pool with junk if needed.
    if (sr.pool == null) {
        sr.pool = new Array();
        sr.pptr = 0;
        var t;
        if (getRandomValues && GLOBAL.Uint8Array) {
            try {
                // Use webcrypto if available
                var ua = new Uint8Array(sr.poolSize);
                getRandomValues(ua);
                for (t = 0; t < sr.poolSize; ++t)
                    sr.pool[sr.pptr++] = ua[t];
            } catch (e) {
                alert(e);
            }
        }
        while (sr.pptr < sr.poolSize) { // extract some randomness from Math.random()
            t = Math.floor(65536 * Math.random());
            sr.pool[sr.pptr++] = t >>> 8;
            sr.pool[sr.pptr++] = t & 255;
        }
        sr.pptr = Math.floor(sr.poolSize * Math.random());
        sr.seedTime();
        // entropy
        var entropyStr = "";
        // screen size and color depth: ~4.8 to ~5.4 bits
        entropyStr += (GLOBAL.screen.height * GLOBAL.screen.width * GLOBAL.screen.colorDepth);
        entropyStr += (GLOBAL.screen.availHeight * GLOBAL.screen.availWidth * GLOBAL.screen.pixelDepth);
        // time zone offset: ~4 bits
        var dateObj = new Date();
        var timeZoneOffset = dateObj.getTimezoneOffset();
        entropyStr += timeZoneOffset;
        // user agent: ~8.3 to ~11.6 bits
        entropyStr += navigator.userAgent;
        // browser plugin details: ~16.2 to ~21.8 bits
        var pluginsStr = "";
        for (var i = 0; i < navigator.plugins.length; i++) {
            pluginsStr += navigator.plugins[i].name + " " + navigator.plugins[i].filename + " " + navigator.plugins[i].description + " " + navigator.plugins[i].version + ", ";
        }
        var mimeTypesStr = "";
        for (var i = 0; i < navigator.mimeTypes.length; i++) {
            mimeTypesStr += navigator.mimeTypes[i].description + " " + navigator.mimeTypes[i].type + " " + navigator.mimeTypes[i].suffixes + ", ";
        }
        entropyStr += pluginsStr + mimeTypesStr;
        // cookies and storage: 1 bit
        entropyStr += navigator.cookieEnabled + typeof(sessionStorage) + typeof(localStorage);
        // language: ~7 bit
        entropyStr += navigator.language;
        // history: ~2 bit
        entropyStr += GLOBAL.history.length;
        // location
        entropyStr += GLOBAL.location;

        var entropyBytes = Crypto.SHA256(entropyStr, {
            asBytes: true
        });
        for (var i = 0; i < entropyBytes.length; i++) {
            sr.seedInt8(entropyBytes[i]);
        }
    }
})(typeof global !== "undefined" ? global : window);

//ripemd160.js
(function(GLOBAL) {

    /*
    CryptoJS v3.1.2
    code.google.com/p/crypto-js
    (c) 2009-2013 by Jeff Mott. All rights reserved.
    code.google.com/p/crypto-js/wiki/License
    */
    /** @preserve
    (c) 2012 by Cédric Mesnil. All rights reserved.
    Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
        - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
        - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
    */

    // Constants table
    var zl = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
        7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
        3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
        1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
        4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13
    ];
    var zr = [
        5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
        6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
        15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
        8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
        12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
    ];
    var sl = [
        11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
        7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
        11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
        11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
        9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6
    ];
    var sr = [
        8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
        9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
        9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
        15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
        8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11
    ];

    var hl = [0x00000000, 0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xA953FD4E];
    var hr = [0x50A28BE6, 0x5C4DD124, 0x6D703EF3, 0x7A6D76E9, 0x00000000];

    var bytesToWords = function(bytes) {
        var words = [];
        for (var i = 0, b = 0; i < bytes.length; i++, b += 8) {
            words[b >>> 5] |= bytes[i] << (24 - b % 32);
        }
        return words;
    };

    var wordsToBytes = function(words) {
        var bytes = [];
        for (var b = 0; b < words.length * 32; b += 8) {
            bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
        }
        return bytes;
    };

    var processBlock = function(H, M, offset) {

        // Swap endian
        for (var i = 0; i < 16; i++) {
            var offset_i = offset + i;
            var M_offset_i = M[offset_i];

            // Swap
            M[offset_i] = (
                (((M_offset_i << 8) | (M_offset_i >>> 24)) & 0x00ff00ff) |
                (((M_offset_i << 24) | (M_offset_i >>> 8)) & 0xff00ff00)
            );
        }

        // Working variables
        var al, bl, cl, dl, el;
        var ar, br, cr, dr, er;

        ar = al = H[0];
        br = bl = H[1];
        cr = cl = H[2];
        dr = dl = H[3];
        er = el = H[4];
        // Computation
        var t;
        for (var i = 0; i < 80; i += 1) {
            t = (al + M[offset + zl[i]]) | 0;
            if (i < 16) {
                t += f1(bl, cl, dl) + hl[0];
            } else if (i < 32) {
                t += f2(bl, cl, dl) + hl[1];
            } else if (i < 48) {
                t += f3(bl, cl, dl) + hl[2];
            } else if (i < 64) {
                t += f4(bl, cl, dl) + hl[3];
            } else { // if (i<80) {
                t += f5(bl, cl, dl) + hl[4];
            }
            t = t | 0;
            t = rotl(t, sl[i]);
            t = (t + el) | 0;
            al = el;
            el = dl;
            dl = rotl(cl, 10);
            cl = bl;
            bl = t;

            t = (ar + M[offset + zr[i]]) | 0;
            if (i < 16) {
                t += f5(br, cr, dr) + hr[0];
            } else if (i < 32) {
                t += f4(br, cr, dr) + hr[1];
            } else if (i < 48) {
                t += f3(br, cr, dr) + hr[2];
            } else if (i < 64) {
                t += f2(br, cr, dr) + hr[3];
            } else { // if (i<80) {
                t += f1(br, cr, dr) + hr[4];
            }
            t = t | 0;
            t = rotl(t, sr[i]);
            t = (t + er) | 0;
            ar = er;
            er = dr;
            dr = rotl(cr, 10);
            cr = br;
            br = t;
        }
        // Intermediate hash value
        t = (H[1] + cl + dr) | 0;
        H[1] = (H[2] + dl + er) | 0;
        H[2] = (H[3] + el + ar) | 0;
        H[3] = (H[4] + al + br) | 0;
        H[4] = (H[0] + bl + cr) | 0;
        H[0] = t;
    };

    function f1(x, y, z) {
        return ((x) ^ (y) ^ (z));
    }

    function f2(x, y, z) {
        return (((x) & (y)) | ((~x) & (z)));
    }

    function f3(x, y, z) {
        return (((x) | (~(y))) ^ (z));
    }

    function f4(x, y, z) {
        return (((x) & (z)) | ((y) & (~(z))));
    }

    function f5(x, y, z) {
        return ((x) ^ ((y) | (~(z))));
    }

    function rotl(x, n) {
        return (x << n) | (x >>> (32 - n));
    }

    GLOBAL.ripemd160 = function ripemd160(message) {
        var H = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];

        var m = bytesToWords(message);

        var nBitsLeft = message.length * 8;
        var nBitsTotal = message.length * 8;

        // Add padding
        m[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
        m[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
            (((nBitsTotal << 8) | (nBitsTotal >>> 24)) & 0x00ff00ff) |
            (((nBitsTotal << 24) | (nBitsTotal >>> 8)) & 0xff00ff00)
        );

        for (var i = 0; i < m.length; i += 16) {
            processBlock(H, m, i);
        }

        // Swap endian
        for (var i = 0; i < 5; i++) {
            // Shortcut
            var H_i = H[i];

            // Swap
            H[i] = (((H_i << 8) | (H_i >>> 24)) & 0x00ff00ff) |
                (((H_i << 24) | (H_i >>> 8)) & 0xff00ff00);
        }

        var digestbytes = wordsToBytes(H);
        return digestbytes;
    }
})(typeof global !== "undefined" ? global : window);

//BigInteger.js
(function(GLOBAL) {
    // Upstream 'BigInteger' here:
    // Original Author: http://www-cs-students.stanford.edu/~tjw/jsbn/
    // Follows 'jsbn' on Github: https://github.com/jasondavies/jsbn
    // Review and Testing: https://github.com/cryptocoinjs/bigi/
    /*!
     * Basic JavaScript BN library - subset useful for RSA encryption. v1.4
     *
     * Copyright (c) 2005  Tom Wu
     * All Rights Reserved.
     * BSD License
     * http://www-cs-students.stanford.edu/~tjw/jsbn/LICENSE
     *
     * Copyright Stephan Thomas
     * Copyright pointbiz
     */

    // (public) Constructor function of Global BigInteger object
    var BigInteger = GLOBAL.BigInteger = function BigInteger(a, b, c) {
        if (!(this instanceof BigInteger))
            return new BigInteger(a, b, c);

        if (a != null)
            if ("number" == typeof a) this.fromNumber(a, b, c);
            else if (b == null && "string" != typeof a) this.fromString(a, 256);
        else this.fromString(a, b);
    };

    // Bits per digit
    var dbits;

    // JavaScript engine analysis
    var canary = 0xdeadbeefcafe;
    var j_lm = ((canary & 0xffffff) == 0xefcafe);

    // return new, unset BigInteger
    function nbi() {
        return new BigInteger(null);
    }

    // am: Compute w_j += (x*this_i), propagate carries,
    // c is initial carry, returns final carry.
    // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
    // We need to select the fastest one that works in this environment.

    // am1: use a single mult and divide to get the high bits,
    // max digit bits should be 26 because
    // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
    function am1(i, x, w, j, c, n) {
        while (--n >= 0) {
            var v = x * this[i++] + w[j] + c;
            c = Math.floor(v / 0x4000000);
            w[j++] = v & 0x3ffffff;
        }
        return c;
    }
    // am2 avoids a big mult-and-extract completely.
    // Max digit bits should be <= 30 because we do bitwise ops
    // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
    function am2(i, x, w, j, c, n) {
        var xl = x & 0x7fff,
            xh = x >> 15;
        while (--n >= 0) {
            var l = this[i] & 0x7fff;
            var h = this[i++] >> 15;
            var m = xh * l + h * xl;
            l = xl * l + ((m & 0x7fff) << 15) + w[j] + (c & 0x3fffffff);
            c = (l >>> 30) + (m >>> 15) + xh * h + (c >>> 30);
            w[j++] = l & 0x3fffffff;
        }
        return c;
    }
    // Alternately, set max digit bits to 28 since some
    // browsers slow down when dealing with 32-bit numbers.
    function am3(i, x, w, j, c, n) {
        var xl = x & 0x3fff,
            xh = x >> 14;
        while (--n >= 0) {
            var l = this[i] & 0x3fff;
            var h = this[i++] >> 14;
            var m = xh * l + h * xl;
            l = xl * l + ((m & 0x3fff) << 14) + w[j] + c;
            c = (l >> 28) + (m >> 14) + xh * h;
            w[j++] = l & 0xfffffff;
        }
        return c;
    }
    if (j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
        BigInteger.prototype.am = am2;
        dbits = 30;
    } else if (j_lm && (navigator.appName != "Netscape")) {
        BigInteger.prototype.am = am1;
        dbits = 26;
    } else { // Mozilla/Netscape seems to prefer am3
        BigInteger.prototype.am = am3;
        dbits = 28;
    }

    BigInteger.prototype.DB = dbits;
    BigInteger.prototype.DM = ((1 << dbits) - 1);
    BigInteger.prototype.DV = (1 << dbits);

    var BI_FP = 52;
    BigInteger.prototype.FV = Math.pow(2, BI_FP);
    BigInteger.prototype.F1 = BI_FP - dbits;
    BigInteger.prototype.F2 = 2 * dbits - BI_FP;

    // Digit conversions
    var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
    var BI_RC = new Array();
    var rr, vv;
    rr = "0".charCodeAt(0);
    for (vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
    rr = "a".charCodeAt(0);
    for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
    rr = "A".charCodeAt(0);
    for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

    function int2char(n) {
        return BI_RM.charAt(n);
    }

    function intAt(s, i) {
        var c = BI_RC[s.charCodeAt(i)];
        return (c == null) ? -1 : c;
    }



    // return bigint initialized to value
    function nbv(i) {
        var r = nbi();
        r.fromInt(i);
        return r;
    }


    // returns bit length of the integer x
    function nbits(x) {
        var r = 1,
            t;
        if ((t = x >>> 16) != 0) {
            x = t;
            r += 16;
        }
        if ((t = x >> 8) != 0) {
            x = t;
            r += 8;
        }
        if ((t = x >> 4) != 0) {
            x = t;
            r += 4;
        }
        if ((t = x >> 2) != 0) {
            x = t;
            r += 2;
        }
        if ((t = x >> 1) != 0) {
            x = t;
            r += 1;
        }
        return r;
    }







    // (protected) copy this to r
    BigInteger.prototype.copyTo = function(r) {
        for (var i = this.t - 1; i >= 0; --i) r[i] = this[i];
        r.t = this.t;
        r.s = this.s;
    };


    // (protected) set from integer value x, -DV <= x < DV
    BigInteger.prototype.fromInt = function(x) {
        this.t = 1;
        this.s = (x < 0) ? -1 : 0;
        if (x > 0) this[0] = x;
        else if (x < -1) this[0] = x + this.DV;
        else this.t = 0;
    };

    // (protected) set from string and radix
    BigInteger.prototype.fromString = function(s, b) {
        var k;
        if (b == 16) k = 4;
        else if (b == 8) k = 3;
        else if (b == 256) k = 8; // byte array
        else if (b == 2) k = 1;
        else if (b == 32) k = 5;
        else if (b == 4) k = 2;
        else {
            this.fromRadix(s, b);
            return;
        }
        this.t = 0;
        this.s = 0;
        var i = s.length,
            mi = false,
            sh = 0;
        while (--i >= 0) {
            var x = (k == 8) ? s[i] & 0xff : intAt(s, i);
            if (x < 0) {
                if (s.charAt(i) == "-") mi = true;
                continue;
            }
            mi = false;
            if (sh == 0)
                this[this.t++] = x;
            else if (sh + k > this.DB) {
                this[this.t - 1] |= (x & ((1 << (this.DB - sh)) - 1)) << sh;
                this[this.t++] = (x >> (this.DB - sh));
            } else
                this[this.t - 1] |= x << sh;
            sh += k;
            if (sh >= this.DB) sh -= this.DB;
        }
        if (k == 8 && (s[0] & 0x80) != 0) {
            this.s = -1;
            if (sh > 0) this[this.t - 1] |= ((1 << (this.DB - sh)) - 1) << sh;
        }
        this.clamp();
        if (mi) BigInteger.ZERO.subTo(this, this);
    };


    // (protected) clamp off excess high words
    BigInteger.prototype.clamp = function() {
        var c = this.s & this.DM;
        while (this.t > 0 && this[this.t - 1] == c) --this.t;
    };

    // (protected) r = this << n*DB
    BigInteger.prototype.dlShiftTo = function(n, r) {
        var i;
        for (i = this.t - 1; i >= 0; --i) r[i + n] = this[i];
        for (i = n - 1; i >= 0; --i) r[i] = 0;
        r.t = this.t + n;
        r.s = this.s;
    };

    // (protected) r = this >> n*DB
    BigInteger.prototype.drShiftTo = function(n, r) {
        for (var i = n; i < this.t; ++i) r[i - n] = this[i];
        r.t = Math.max(this.t - n, 0);
        r.s = this.s;
    };


    // (protected) r = this << n
    BigInteger.prototype.lShiftTo = function(n, r) {
        var bs = n % this.DB;
        var cbs = this.DB - bs;
        var bm = (1 << cbs) - 1;
        var ds = Math.floor(n / this.DB),
            c = (this.s << bs) & this.DM,
            i;
        for (i = this.t - 1; i >= 0; --i) {
            r[i + ds + 1] = (this[i] >> cbs) | c;
            c = (this[i] & bm) << bs;
        }
        for (i = ds - 1; i >= 0; --i) r[i] = 0;
        r[ds] = c;
        r.t = this.t + ds + 1;
        r.s = this.s;
        r.clamp();
    };


    // (protected) r = this >> n
    BigInteger.prototype.rShiftTo = function(n, r) {
        r.s = this.s;
        var ds = Math.floor(n / this.DB);
        if (ds >= this.t) {
            r.t = 0;
            return;
        }
        var bs = n % this.DB;
        var cbs = this.DB - bs;
        var bm = (1 << bs) - 1;
        r[0] = this[ds] >> bs;
        for (var i = ds + 1; i < this.t; ++i) {
            r[i - ds - 1] |= (this[i] & bm) << cbs;
            r[i - ds] = this[i] >> bs;
        }
        if (bs > 0) r[this.t - ds - 1] |= (this.s & bm) << cbs;
        r.t = this.t - ds;
        r.clamp();
    };


    // (protected) r = this - a
    BigInteger.prototype.subTo = function(a, r) {
        var i = 0,
            c = 0,
            m = Math.min(a.t, this.t);
        while (i < m) {
            c += this[i] - a[i];
            r[i++] = c & this.DM;
            c >>= this.DB;
        }
        if (a.t < this.t) {
            c -= a.s;
            while (i < this.t) {
                c += this[i];
                r[i++] = c & this.DM;
                c >>= this.DB;
            }
            c += this.s;
        } else {
            c += this.s;
            while (i < a.t) {
                c -= a[i];
                r[i++] = c & this.DM;
                c >>= this.DB;
            }
            c -= a.s;
        }
        r.s = (c < 0) ? -1 : 0;
        if (c < -1) r[i++] = this.DV + c;
        else if (c > 0) r[i++] = c;
        r.t = i;
        r.clamp();
    };


    // (protected) r = this * a, r != this,a (HAC 14.12)
    // "this" should be the larger one if appropriate.
    BigInteger.prototype.multiplyTo = function(a, r) {
        var x = this.abs(),
            y = a.abs();
        var i = x.t;
        r.t = i + y.t;
        while (--i >= 0) r[i] = 0;
        for (i = 0; i < y.t; ++i) r[i + x.t] = x.am(0, y[i], r, i, 0, x.t);
        r.s = 0;
        r.clamp();
        if (this.s != a.s) BigInteger.ZERO.subTo(r, r);
    };


    // (protected) r = this^2, r != this (HAC 14.16)
    BigInteger.prototype.squareTo = function(r) {
        var x = this.abs();
        var i = r.t = 2 * x.t;
        while (--i >= 0) r[i] = 0;
        for (i = 0; i < x.t - 1; ++i) {
            var c = x.am(i, x[i], r, 2 * i, 0, 1);
            if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV) {
                r[i + x.t] -= x.DV;
                r[i + x.t + 1] = 1;
            }
        }
        if (r.t > 0) r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1);
        r.s = 0;
        r.clamp();
    };



    // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
    // r != q, this != m.  q or r may be null.
    BigInteger.prototype.divRemTo = function(m, q, r) {
        var pm = m.abs();
        if (pm.t <= 0) return;
        var pt = this.abs();
        if (pt.t < pm.t) {
            if (q != null) q.fromInt(0);
            if (r != null) this.copyTo(r);
            return;
        }
        if (r == null) r = nbi();
        var y = nbi(),
            ts = this.s,
            ms = m.s;
        var nsh = this.DB - nbits(pm[pm.t - 1]); // normalize modulus
        if (nsh > 0) {
            pm.lShiftTo(nsh, y);
            pt.lShiftTo(nsh, r);
        } else {
            pm.copyTo(y);
            pt.copyTo(r);
        }
        var ys = y.t;
        var y0 = y[ys - 1];
        if (y0 == 0) return;
        var yt = y0 * (1 << this.F1) + ((ys > 1) ? y[ys - 2] >> this.F2 : 0);
        var d1 = this.FV / yt,
            d2 = (1 << this.F1) / yt,
            e = 1 << this.F2;
        var i = r.t,
            j = i - ys,
            t = (q == null) ? nbi() : q;
        y.dlShiftTo(j, t);
        if (r.compareTo(t) >= 0) {
            r[r.t++] = 1;
            r.subTo(t, r);
        }
        BigInteger.ONE.dlShiftTo(ys, t);
        t.subTo(y, y); // "negative" y so we can replace sub with am later
        while (y.t < ys) y[y.t++] = 0;
        while (--j >= 0) {
            // Estimate quotient digit
            var qd = (r[--i] == y0) ? this.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2);
            if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) { // Try it out
                y.dlShiftTo(j, t);
                r.subTo(t, r);
                while (r[i] < --qd) r.subTo(t, r);
            }
        }
        if (q != null) {
            r.drShiftTo(ys, q);
            if (ts != ms) BigInteger.ZERO.subTo(q, q);
        }
        r.t = ys;
        r.clamp();
        if (nsh > 0) r.rShiftTo(nsh, r); // Denormalize remainder
        if (ts < 0) BigInteger.ZERO.subTo(r, r);
    };


    // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
    // justification:
    //         xy == 1 (mod m)
    //         xy =  1+km
    //   xy(2-xy) = (1+km)(1-km)
    // x[y(2-xy)] = 1-k^2m^2
    // x[y(2-xy)] == 1 (mod m^2)
    // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
    // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
    // JS multiply "overflows" differently from C/C++, so care is needed here.
    BigInteger.prototype.invDigit = function() {
        if (this.t < 1) return 0;
        var x = this[0];
        if ((x & 1) == 0) return 0;
        var y = x & 3; // y == 1/x mod 2^2
        y = (y * (2 - (x & 0xf) * y)) & 0xf; // y == 1/x mod 2^4
        y = (y * (2 - (x & 0xff) * y)) & 0xff; // y == 1/x mod 2^8
        y = (y * (2 - (((x & 0xffff) * y) & 0xffff))) & 0xffff; // y == 1/x mod 2^16
        // last step - calculate inverse mod DV directly;
        // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
        y = (y * (2 - x * y % this.DV)) % this.DV; // y == 1/x mod 2^dbits
        // we really want the negative inverse, and -DV < y < DV
        return (y > 0) ? this.DV - y : -y;
    };


    // (protected) true iff this is even
    BigInteger.prototype.isEven = function() {
        return ((this.t > 0) ? (this[0] & 1) : this.s) == 0;
    };


    // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
    BigInteger.prototype.exp = function(e, z) {
        if (e > 0xffffffff || e < 1) return BigInteger.ONE;
        var r = nbi(),
            r2 = nbi(),
            g = z.convert(this),
            i = nbits(e) - 1;
        g.copyTo(r);
        while (--i >= 0) {
            z.sqrTo(r, r2);
            if ((e & (1 << i)) > 0) z.mulTo(r2, g, r);
            else {
                var t = r;
                r = r2;
                r2 = t;
            }
        }
        return z.revert(r);
    };


    // (public) return string representation in given radix
    BigInteger.prototype.toString = function(b) {
        if (this.s < 0) return "-" + this.negate().toString(b);
        var k;
        if (b == 16) k = 4;
        else if (b == 8) k = 3;
        else if (b == 2) k = 1;
        else if (b == 32) k = 5;
        else if (b == 4) k = 2;
        else return this.toRadix(b);
        var km = (1 << k) - 1,
            d, m = false,
            r = "",
            i = this.t;
        var p = this.DB - (i * this.DB) % k;
        if (i-- > 0) {
            if (p < this.DB && (d = this[i] >> p) > 0) {
                m = true;
                r = int2char(d);
            }
            while (i >= 0) {
                if (p < k) {
                    d = (this[i] & ((1 << p) - 1)) << (k - p);
                    d |= this[--i] >> (p += this.DB - k);
                } else {
                    d = (this[i] >> (p -= k)) & km;
                    if (p <= 0) {
                        p += this.DB;
                        --i;
                    }
                }
                if (d > 0) m = true;
                if (m) r += int2char(d);
            }
        }
        return m ? r : "0";
    };


    // (public) -this
    BigInteger.prototype.negate = function() {
        var r = nbi();
        BigInteger.ZERO.subTo(this, r);
        return r;
    };

    // (public) |this|
    BigInteger.prototype.abs = function() {
        return (this.s < 0) ? this.negate() : this;
    };

    // (public) return + if this > a, - if this < a, 0 if equal
    BigInteger.prototype.compareTo = function(a) {
        var r = this.s - a.s;
        if (r != 0) return r;
        var i = this.t;
        r = i - a.t;
        if (r != 0) return (this.s < 0) ? -r : r;
        while (--i >= 0)
            if ((r = this[i] - a[i]) != 0) return r;
        return 0;
    }

    // (public) return the number of bits in "this"
    BigInteger.prototype.bitLength = function() {
        if (this.t <= 0) return 0;
        return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ (this.s & this.DM));
    };

    // (public) this mod a
    BigInteger.prototype.mod = function(a) {
        var r = nbi();
        this.abs().divRemTo(a, null, r);
        if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r, r);
        return r;
    }

    // (public) this^e % m, 0 <= e < 2^32
    BigInteger.prototype.modPowInt = function(e, m) {
        var z;
        if (e < 256 || m.isEven()) z = new Classic(m);
        else z = new Montgomery(m);
        return this.exp(e, z);
    };

    // "constants"
    BigInteger.ZERO = nbv(0);
    BigInteger.ONE = nbv(1);







    // Copyright (c) 2005-2009  Tom Wu
    // All Rights Reserved.
    // See "LICENSE" for details.
    // Extended JavaScript BN functions, required for RSA private ops.
    // Version 1.1: new BigInteger("0", 10) returns "proper" zero
    // Version 1.2: square() API, isProbablePrime fix


    // return index of lowest 1-bit in x, x < 2^31
    function lbit(x) {
        if (x == 0) return -1;
        var r = 0;
        if ((x & 0xffff) == 0) {
            x >>= 16;
            r += 16;
        }
        if ((x & 0xff) == 0) {
            x >>= 8;
            r += 8;
        }
        if ((x & 0xf) == 0) {
            x >>= 4;
            r += 4;
        }
        if ((x & 3) == 0) {
            x >>= 2;
            r += 2;
        }
        if ((x & 1) == 0) ++r;
        return r;
    }

    // return number of 1 bits in x
    function cbit(x) {
        var r = 0;
        while (x != 0) {
            x &= x - 1;
            ++r;
        }
        return r;
    }

    var lowprimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83,
        89,
        97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191,
        193,
        197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307,
        311,
        313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431,
        433,
        439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563,
        569,
        571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677,
        683,
        691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823,
        827,
        829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967,
        971,
        977, 983, 991, 997
    ];
    var lplim = (1 << 26) / lowprimes[lowprimes.length - 1];



    // (protected) return x s.t. r^x < DV
    BigInteger.prototype.chunkSize = function(r) {
        return Math.floor(Math.LN2 * this.DB / Math.log(r));
    };

    // (protected) convert to radix string
    BigInteger.prototype.toRadix = function(b) {
        if (b == null) b = 10;
        if (this.signum() == 0 || b < 2 || b > 36) return "0";
        var cs = this.chunkSize(b);
        var a = Math.pow(b, cs);
        var d = nbv(a),
            y = nbi(),
            z = nbi(),
            r = "";
        this.divRemTo(d, y, z);
        while (y.signum() > 0) {
            r = (a + z.intValue()).toString(b).substr(1) + r;
            y.divRemTo(d, y, z);
        }
        return z.intValue().toString(b) + r;
    };

    // (protected) convert from radix string
    BigInteger.prototype.fromRadix = function(s, b) {
        this.fromInt(0);
        if (b == null) b = 10;
        var cs = this.chunkSize(b);
        var d = Math.pow(b, cs),
            mi = false,
            j = 0,
            w = 0;
        for (var i = 0; i < s.length; ++i) {
            var x = intAt(s, i);
            if (x < 0) {
                if (s.charAt(i) == "-" && this.signum() == 0) mi = true;
                continue;
            }
            w = b * w + x;
            if (++j >= cs) {
                this.dMultiply(d);
                this.dAddOffset(w, 0);
                j = 0;
                w = 0;
            }
        }
        if (j > 0) {
            this.dMultiply(Math.pow(b, j));
            this.dAddOffset(w, 0);
        }
        if (mi) BigInteger.ZERO.subTo(this, this);
    };

    // (protected) alternate constructor
    BigInteger.prototype.fromNumber = function(a, b, c) {
        if ("number" == typeof b) {
            // new BigInteger(int,int,RNG)
            if (a < 2) this.fromInt(1);
            else {
                this.fromNumber(a, c);
                if (!this.testBit(a - 1)) // force MSB set
                    this.bitwiseTo(BigInteger.ONE.shiftLeft(a - 1), op_or, this);
                if (this.isEven()) this.dAddOffset(1, 0); // force odd
                while (!this.isProbablePrime(b)) {
                    this.dAddOffset(2, 0);
                    if (this.bitLength() > a) this.subTo(BigInteger.ONE.shiftLeft(a - 1), this);
                }
            }
        } else {
            // new BigInteger(int,RNG)
            var x = new Array(),
                t = a & 7;
            x.length = (a >> 3) + 1;
            b.nextBytes(x);
            if (t > 0) x[0] &= ((1 << t) - 1);
            else x[0] = 0;
            this.fromString(x, 256);
        }
    };

    // (protected) r = this op a (bitwise)
    BigInteger.prototype.bitwiseTo = function(a, op, r) {
        var i, f, m = Math.min(a.t, this.t);
        for (i = 0; i < m; ++i) r[i] = op(this[i], a[i]);
        if (a.t < this.t) {
            f = a.s & this.DM;
            for (i = m; i < this.t; ++i) r[i] = op(this[i], f);
            r.t = this.t;
        } else {
            f = this.s & this.DM;
            for (i = m; i < a.t; ++i) r[i] = op(f, a[i]);
            r.t = a.t;
        }
        r.s = op(this.s, a.s);
        r.clamp();
    };

    // (protected) this op (1<<n)
    BigInteger.prototype.changeBit = function(n, op) {
        var r = BigInteger.ONE.shiftLeft(n);
        this.bitwiseTo(r, op, r);
        return r;
    };

    // (protected) r = this + a
    BigInteger.prototype.addTo = function(a, r) {
        var i = 0,
            c = 0,
            m = Math.min(a.t, this.t);
        while (i < m) {
            c += this[i] + a[i];
            r[i++] = c & this.DM;
            c >>= this.DB;
        }
        if (a.t < this.t) {
            c += a.s;
            while (i < this.t) {
                c += this[i];
                r[i++] = c & this.DM;
                c >>= this.DB;
            }
            c += this.s;
        } else {
            c += this.s;
            while (i < a.t) {
                c += a[i];
                r[i++] = c & this.DM;
                c >>= this.DB;
            }
            c += a.s;
        }
        r.s = (c < 0) ? -1 : 0;
        if (c > 0) r[i++] = c;
        else if (c < -1) r[i++] = this.DV + c;
        r.t = i;
        r.clamp();
    };

    // (protected) this *= n, this >= 0, 1 < n < DV
    BigInteger.prototype.dMultiply = function(n) {
        this[this.t] = this.am(0, n - 1, this, 0, 0, this.t);
        ++this.t;
        this.clamp();
    };

    // (protected) this += n << w words, this >= 0
    BigInteger.prototype.dAddOffset = function(n, w) {
        if (n == 0) return;
        while (this.t <= w) this[this.t++] = 0;
        this[w] += n;
        while (this[w] >= this.DV) {
            this[w] -= this.DV;
            if (++w >= this.t) this[this.t++] = 0;
            ++this[w];
        }
    };

    // (protected) r = lower n words of "this * a", a.t <= n
    // "this" should be the larger one if appropriate.
    BigInteger.prototype.multiplyLowerTo = function(a, n, r) {
        var i = Math.min(this.t + a.t, n);
        r.s = 0; // assumes a,this >= 0
        r.t = i;
        while (i > 0) r[--i] = 0;
        var j;
        for (j = r.t - this.t; i < j; ++i) r[i + this.t] = this.am(0, a[i], r, i, 0, this.t);
        for (j = Math.min(a.t, n); i < j; ++i) this.am(0, a[i], r, i, 0, n - i);
        r.clamp();
    };


    // (protected) r = "this * a" without lower n words, n > 0
    // "this" should be the larger one if appropriate.
    BigInteger.prototype.multiplyUpperTo = function(a, n, r) {
        --n;
        var i = r.t = this.t + a.t - n;
        r.s = 0; // assumes a,this >= 0
        while (--i >= 0) r[i] = 0;
        for (i = Math.max(n - this.t, 0); i < a.t; ++i)
            r[this.t + i - n] = this.am(n - i, a[i], r, 0, 0, this.t + i - n);
        r.clamp();
        r.drShiftTo(1, r);
    };

    // (protected) this % n, n < 2^26
    BigInteger.prototype.modInt = function(n) {
        if (n <= 0) return 0;
        var d = this.DV % n,
            r = (this.s < 0) ? n - 1 : 0;
        if (this.t > 0)
            if (d == 0) r = this[0] % n;
            else
                for (var i = this.t - 1; i >= 0; --i) r = (d * r + this[i]) % n;
        return r;
    };


    // (protected) true if probably prime (HAC 4.24, Miller-Rabin)
    BigInteger.prototype.millerRabin = function(t) {
        var n1 = this.subtract(BigInteger.ONE);
        var k = n1.getLowestSetBit();
        if (k <= 0) return false;
        var r = n1.shiftRight(k);
        t = (t + 1) >> 1;
        if (t > lowprimes.length) t = lowprimes.length;
        var a = nbi();
        for (var i = 0; i < t; ++i) {
            //Pick bases at random, instead of starting at 2
            a.fromInt(lowprimes[Math.floor(Math.random() * lowprimes.length)]);
            var y = a.modPow(r, this);
            if (y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
                var j = 1;
                while (j++ < k && y.compareTo(n1) != 0) {
                    y = y.modPowInt(2, this);
                    if (y.compareTo(BigInteger.ONE) == 0) return false;
                }
                if (y.compareTo(n1) != 0) return false;
            }
        }
        return true;
    };



    // (public)
    BigInteger.prototype.clone = function() {
        var r = nbi();
        this.copyTo(r);
        return r;
    };

    // (public) return value as integer
    BigInteger.prototype.intValue = function() {
        if (this.s < 0) {
            if (this.t == 1) return this[0] - this.DV;
            else if (this.t == 0) return -1;
        } else if (this.t == 1) return this[0];
        else if (this.t == 0) return 0;
        // assumes 16 < DB < 32
        return ((this[1] & ((1 << (32 - this.DB)) - 1)) << this.DB) | this[0];
    };


    // (public) return value as byte
    BigInteger.prototype.byteValue = function() {
        return (this.t == 0) ? this.s : (this[0] << 24) >> 24;
    };

    // (public) return value as short (assumes DB>=16)
    BigInteger.prototype.shortValue = function() {
        return (this.t == 0) ? this.s : (this[0] << 16) >> 16;
    };

    // (public) 0 if this == 0, 1 if this > 0
    BigInteger.prototype.signum = function() {
        if (this.s < 0) return -1;
        else if (this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
        else return 1;
    };


    // (public) convert to bigendian byte array
    BigInteger.prototype.toByteArray = function() {
        var i = this.t,
            r = new Array();
        r[0] = this.s;
        var p = this.DB - (i * this.DB) % 8,
            d, k = 0;
        if (i-- > 0) {
            if (p < this.DB && (d = this[i] >> p) != (this.s & this.DM) >> p)
                r[k++] = d | (this.s << (this.DB - p));
            while (i >= 0) {
                if (p < 8) {
                    d = (this[i] & ((1 << p) - 1)) << (8 - p);
                    d |= this[--i] >> (p += this.DB - 8);
                } else {
                    d = (this[i] >> (p -= 8)) & 0xff;
                    if (p <= 0) {
                        p += this.DB;
                        --i;
                    }
                }
                if ((d & 0x80) != 0) d |= -256;
                if (k == 0 && (this.s & 0x80) != (d & 0x80)) ++k;
                if (k > 0 || d != this.s) r[k++] = d;
            }
        }
        return r;
    };

    BigInteger.prototype.equals = function(a) {
        return (this.compareTo(a) == 0);
    };
    BigInteger.prototype.min = function(a) {
        return (this.compareTo(a) < 0) ? this : a;
    };
    BigInteger.prototype.max = function(a) {
        return (this.compareTo(a) > 0) ? this : a;
    };

    // (public) this & a
    function op_and(x, y) {
        return x & y;
    }
    BigInteger.prototype.and = function(a) {
        var r = nbi();
        this.bitwiseTo(a, op_and, r);
        return r;
    };

    // (public) this | a
    function op_or(x, y) {
        return x | y;
    }
    BigInteger.prototype.or = function(a) {
        var r = nbi();
        this.bitwiseTo(a, op_or, r);
        return r;
    };

    // (public) this ^ a
    function op_xor(x, y) {
        return x ^ y;
    }
    BigInteger.prototype.xor = function(a) {
        var r = nbi();
        this.bitwiseTo(a, op_xor, r);
        return r;
    };

    // (public) this & ~a
    function op_andnot(x, y) {
        return x & ~y;
    }
    BigInteger.prototype.andNot = function(a) {
        var r = nbi();
        this.bitwiseTo(a, op_andnot, r);
        return r;
    };

    // (public) ~this
    BigInteger.prototype.not = function() {
        var r = nbi();
        for (var i = 0; i < this.t; ++i) r[i] = this.DM & ~this[i];
        r.t = this.t;
        r.s = ~this.s;
        return r;
    };

    // (public) this << n
    BigInteger.prototype.shiftLeft = function(n) {
        var r = nbi();
        if (n < 0) this.rShiftTo(-n, r);
        else this.lShiftTo(n, r);
        return r;
    };

    // (public) this >> n
    BigInteger.prototype.shiftRight = function(n) {
        var r = nbi();
        if (n < 0) this.lShiftTo(-n, r);
        else this.rShiftTo(n, r);
        return r;
    };

    // (public) returns index of lowest 1-bit (or -1 if none)
    BigInteger.prototype.getLowestSetBit = function() {
        for (var i = 0; i < this.t; ++i)
            if (this[i] != 0) return i * this.DB + lbit(this[i]);
        if (this.s < 0) return this.t * this.DB;
        return -1;
    };

    // (public) return number of set bits
    BigInteger.prototype.bitCount = function() {
        var r = 0,
            x = this.s & this.DM;
        for (var i = 0; i < this.t; ++i) r += cbit(this[i] ^ x);
        return r;
    };

    // (public) true iff nth bit is set
    BigInteger.prototype.testBit = function(n) {
        var j = Math.floor(n / this.DB);
        if (j >= this.t) return (this.s != 0);
        return ((this[j] & (1 << (n % this.DB))) != 0);
    };

    // (public) this | (1<<n)
    BigInteger.prototype.setBit = function(n) {
        return this.changeBit(n, op_or);
    };
    // (public) this & ~(1<<n)
    BigInteger.prototype.clearBit = function(n) {
        return this.changeBit(n, op_andnot);
    };
    // (public) this ^ (1<<n)
    BigInteger.prototype.flipBit = function(n) {
        return this.changeBit(n, op_xor);
    };
    // (public) this + a
    BigInteger.prototype.add = function(a) {
        var r = nbi();
        this.addTo(a, r);
        return r;
    };
    // (public) this - a
    BigInteger.prototype.subtract = function(a) {
        var r = nbi();
        this.subTo(a, r);
        return r;
    };
    // (public) this * a
    BigInteger.prototype.multiply = function(a) {
        var r = nbi();
        this.multiplyTo(a, r);
        return r;
    };
    // (public) this / a
    BigInteger.prototype.divide = function(a) {
        var r = nbi();
        this.divRemTo(a, r, null);
        return r;
    };
    // (public) this % a
    BigInteger.prototype.remainder = function(a) {
        var r = nbi();
        this.divRemTo(a, null, r);
        return r;
    };
    // (public) [this/a,this%a]
    BigInteger.prototype.divideAndRemainder = function(a) {
        var q = nbi(),
            r = nbi();
        this.divRemTo(a, q, r);
        return new Array(q, r);
    };

    // (public) this^e % m (HAC 14.85)
    BigInteger.prototype.modPow = function(e, m) {
        var i = e.bitLength(),
            k, r = nbv(1),
            z;
        if (i <= 0) return r;
        else if (i < 18) k = 1;
        else if (i < 48) k = 3;
        else if (i < 144) k = 4;
        else if (i < 768) k = 5;
        else k = 6;
        if (i < 8)
            z = new Classic(m);
        else if (m.isEven())
            z = new Barrett(m);
        else
            z = new Montgomery(m);

        // precomputation
        var g = new Array(),
            n = 3,
            k1 = k - 1,
            km = (1 << k) - 1;
        g[1] = z.convert(this);
        if (k > 1) {
            var g2 = nbi();
            z.sqrTo(g[1], g2);
            while (n <= km) {
                g[n] = nbi();
                z.mulTo(g2, g[n - 2], g[n]);
                n += 2;
            }
        }

        var j = e.t - 1,
            w, is1 = true,
            r2 = nbi(),
            t;
        i = nbits(e[j]) - 1;
        while (j >= 0) {
            if (i >= k1) w = (e[j] >> (i - k1)) & km;
            else {
                w = (e[j] & ((1 << (i + 1)) - 1)) << (k1 - i);
                if (j > 0) w |= e[j - 1] >> (this.DB + i - k1);
            }

            n = k;
            while ((w & 1) == 0) {
                w >>= 1;
                --n;
            }
            if ((i -= n) < 0) {
                i += this.DB;
                --j;
            }
            if (is1) { // ret == 1, don't bother squaring or multiplying it
                g[w].copyTo(r);
                is1 = false;
            } else {
                while (n > 1) {
                    z.sqrTo(r, r2);
                    z.sqrTo(r2, r);
                    n -= 2;
                }
                if (n > 0) z.sqrTo(r, r2);
                else {
                    t = r;
                    r = r2;
                    r2 = t;
                }
                z.mulTo(r2, g[w], r);
            }

            while (j >= 0 && (e[j] & (1 << i)) == 0) {
                z.sqrTo(r, r2);
                t = r;
                r = r2;
                r2 = t;
                if (--i < 0) {
                    i = this.DB - 1;
                    --j;
                }
            }
        }
        return z.revert(r);
    };

    // (public) 1/this % m (HAC 14.61)
    BigInteger.prototype.modInverse = function(m) {
        var ac = m.isEven();
        if (this.signum() === 0) throw new Error('division by zero');
        if ((this.isEven() && ac) || m.signum() == 0) return BigInteger.ZERO;
        var u = m.clone(),
            v = this.clone();
        var a = nbv(1),
            b = nbv(0),
            c = nbv(0),
            d = nbv(1);
        while (u.signum() != 0) {
            while (u.isEven()) {
                u.rShiftTo(1, u);
                if (ac) {
                    if (!a.isEven() || !b.isEven()) {
                        a.addTo(this, a);
                        b.subTo(m, b);
                    }
                    a.rShiftTo(1, a);
                } else if (!b.isEven()) b.subTo(m, b);
                b.rShiftTo(1, b);
            }
            while (v.isEven()) {
                v.rShiftTo(1, v);
                if (ac) {
                    if (!c.isEven() || !d.isEven()) {
                        c.addTo(this, c);
                        d.subTo(m, d);
                    }
                    c.rShiftTo(1, c);
                } else if (!d.isEven()) d.subTo(m, d);
                d.rShiftTo(1, d);
            }
            if (u.compareTo(v) >= 0) {
                u.subTo(v, u);
                if (ac) a.subTo(c, a);
                b.subTo(d, b);
            } else {
                v.subTo(u, v);
                if (ac) c.subTo(a, c);
                d.subTo(b, d);
            }
        }
        if (v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO;
        while (d.compareTo(m) >= 0) d.subTo(m, d);
        while (d.signum() < 0) d.addTo(m, d);
        return d;
    };


    // (public) this^e
    BigInteger.prototype.pow = function(e) {
        return this.exp(e, new NullExp());
    };

    // (public) gcd(this,a) (HAC 14.54)
    BigInteger.prototype.gcd = function(a) {
        var x = (this.s < 0) ? this.negate() : this.clone();
        var y = (a.s < 0) ? a.negate() : a.clone();
        if (x.compareTo(y) < 0) {
            var t = x;
            x = y;
            y = t;
        }
        var i = x.getLowestSetBit(),
            g = y.getLowestSetBit();
        if (g < 0) return x;
        if (i < g) g = i;
        if (g > 0) {
            x.rShiftTo(g, x);
            y.rShiftTo(g, y);
        }
        while (x.signum() > 0) {
            if ((i = x.getLowestSetBit()) > 0) x.rShiftTo(i, x);
            if ((i = y.getLowestSetBit()) > 0) y.rShiftTo(i, y);
            if (x.compareTo(y) >= 0) {
                x.subTo(y, x);
                x.rShiftTo(1, x);
            } else {
                y.subTo(x, y);
                y.rShiftTo(1, y);
            }
        }
        if (g > 0) y.lShiftTo(g, y);
        return y;
    };

    // (public) test primality with certainty >= 1-.5^t
    BigInteger.prototype.isProbablePrime = function(t) {
        var i, x = this.abs();
        if (x.t == 1 && x[0] <= lowprimes[lowprimes.length - 1]) {
            for (i = 0; i < lowprimes.length; ++i)
                if (x[0] == lowprimes[i]) return true;
            return false;
        }
        if (x.isEven()) return false;
        i = 1;
        while (i < lowprimes.length) {
            var m = lowprimes[i],
                j = i + 1;
            while (j < lowprimes.length && m < lplim) m *= lowprimes[j++];
            m = x.modInt(m);
            while (i < j)
                if (m % lowprimes[i++] == 0) return false;
        }
        return x.millerRabin(t);
    };


    // JSBN-specific extension

    // (public) this^2
    BigInteger.prototype.square = function() {
        var r = nbi();
        this.squareTo(r);
        return r;
    };


    // NOTE: BigInteger interfaces not implemented in jsbn:
    // BigInteger(int signum, byte[] magnitude)
    // double doubleValue()
    // float floatValue()
    // int hashCode()
    // long longValue()
    // static BigInteger valueOf(long val)



    // Copyright Stephan Thomas (start) --- //
    // https://raw.github.com/bitcoinjs/bitcoinjs-lib/07f9d55ccb6abd962efb6befdd37671f85ea4ff9/src/util.js
    // BigInteger monkey patching
    BigInteger.valueOf = nbv;

    /**
     * Returns a byte array representation of the big integer.
     *
     * This returns the absolute of the contained value in big endian
     * form. A value of zero results in an empty array.
     */
    BigInteger.prototype.toByteArrayUnsigned = function() {
        var ba = this.abs().toByteArray();
        if (ba.length) {
            if (ba[0] == 0) {
                ba = ba.slice(1);
            }
            return ba.map(function(v) {
                return (v < 0) ? v + 256 : v;
            });
        } else {
            // Empty array, nothing to do
            return ba;
        }
    };

    /**
     * Turns a byte array into a big integer.
     *
     * This function will interpret a byte array as a big integer in big
     * endian notation and ignore leading zeros.
     */
    BigInteger.fromByteArrayUnsigned = function(ba) {
        if (!ba.length) {
            return ba.valueOf(0);
        } else if (ba[0] & 0x80) {
            // Prepend a zero so the BigInteger class doesn't mistake this
            // for a negative integer.
            return new BigInteger([0].concat(ba));
        } else {
            return new BigInteger(ba);
        }
    };

    /**
     * Converts big integer to signed byte representation.
     *
     * The format for this value uses a the most significant bit as a sign
     * bit. If the most significant bit is already occupied by the
     * absolute value, an extra byte is prepended and the sign bit is set
     * there.
     *
     * Examples:
     *
     *      0 =>     0x00
     *      1 =>     0x01
     *     -1 =>     0x81
     *    127 =>     0x7f
     *   -127 =>     0xff
     *    128 =>   0x0080
     *   -128 =>   0x8080
     *    255 =>   0x00ff
     *   -255 =>   0x80ff
     *  16300 =>   0x3fac
     * -16300 =>   0xbfac
     *  62300 => 0x00f35c
     * -62300 => 0x80f35c
     */
    BigInteger.prototype.toByteArraySigned = function() {
        var val = this.abs().toByteArrayUnsigned();
        var neg = this.compareTo(BigInteger.ZERO) < 0;

        if (neg) {
            if (val[0] & 0x80) {
                val.unshift(0x80);
            } else {
                val[0] |= 0x80;
            }
        } else {
            if (val[0] & 0x80) {
                val.unshift(0x00);
            }
        }

        return val;
    };

    /**
     * Parse a signed big integer byte representation.
     *
     * For details on the format please see BigInteger.toByteArraySigned.
     */
    BigInteger.fromByteArraySigned = function(ba) {
        // Check for negative value
        if (ba[0] & 0x80) {
            // Remove sign bit
            ba[0] &= 0x7f;

            return BigInteger.fromByteArrayUnsigned(ba).negate();
        } else {
            return BigInteger.fromByteArrayUnsigned(ba);
        }
    };
    // Copyright Stephan Thomas (end) --- //




    // ****** REDUCTION ******* //

    // Modular reduction using "classic" algorithm
    var Classic = GLOBAL.Classic = function Classic(m) {
        this.m = m;
    }
    Classic.prototype.convert = function(x) {
        if (x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
        else return x;
    };
    Classic.prototype.revert = function(x) {
        return x;
    };
    Classic.prototype.reduce = function(x) {
        x.divRemTo(this.m, null, x);
    };
    Classic.prototype.mulTo = function(x, y, r) {
        x.multiplyTo(y, r);
        this.reduce(r);
    };
    Classic.prototype.sqrTo = function(x, r) {
        x.squareTo(r);
        this.reduce(r);
    };





    // Montgomery reduction
    var Montgomery = GLOBAL.Montgomery = function Montgomery(m) {
        this.m = m;
        this.mp = m.invDigit();
        this.mpl = this.mp & 0x7fff;
        this.mph = this.mp >> 15;
        this.um = (1 << (m.DB - 15)) - 1;
        this.mt2 = 2 * m.t;
    }
    // xR mod m
    Montgomery.prototype.convert = function(x) {
        var r = nbi();
        x.abs().dlShiftTo(this.m.t, r);
        r.divRemTo(this.m, null, r);
        if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r, r);
        return r;
    }
    // x/R mod m
    Montgomery.prototype.revert = function(x) {
        var r = nbi();
        x.copyTo(r);
        this.reduce(r);
        return r;
    };
    // x = x/R mod m (HAC 14.32)
    Montgomery.prototype.reduce = function(x) {
        while (x.t <= this.mt2) // pad x so am has enough room later
            x[x.t++] = 0;
        for (var i = 0; i < this.m.t; ++i) {
            // faster way of calculating u0 = x[i]*mp mod DV
            var j = x[i] & 0x7fff;
            var u0 = (j * this.mpl + (((j * this.mph + (x[i] >> 15) * this.mpl) & this.um) << 15)) & x.DM;
            // use am to combine the multiply-shift-add into one call
            j = i + this.m.t;
            x[j] += this.m.am(0, u0, x, i, 0, this.m.t);
            // propagate carry
            while (x[j] >= x.DV) {
                x[j] -= x.DV;
                x[++j]++;
            }
        }
        x.clamp();
        x.drShiftTo(this.m.t, x);
        if (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
    };
    // r = "xy/R mod m"; x,y != r
    Montgomery.prototype.mulTo = function(x, y, r) {
        x.multiplyTo(y, r);
        this.reduce(r);
    };
    // r = "x^2/R mod m"; x != r
    Montgomery.prototype.sqrTo = function(x, r) {
        x.squareTo(r);
        this.reduce(r);
    };





    // A "null" reducer
    var NullExp = GLOBAL.NullExp = function NullExp() {}
    NullExp.prototype.convert = function(x) {
        return x;
    };
    NullExp.prototype.revert = function(x) {
        return x;
    };
    NullExp.prototype.mulTo = function(x, y, r) {
        x.multiplyTo(y, r);
    };
    NullExp.prototype.sqrTo = function(x, r) {
        x.squareTo(r);
    };





    // Barrett modular reduction
    var Barrett = GLOBAL.Barrett = function Barrett(m) {
        // setup Barrett
        this.r2 = nbi();
        this.q3 = nbi();
        BigInteger.ONE.dlShiftTo(2 * m.t, this.r2);
        this.mu = this.r2.divide(m);
        this.m = m;
    }
    Barrett.prototype.convert = function(x) {
        if (x.s < 0 || x.t > 2 * this.m.t) return x.mod(this.m);
        else if (x.compareTo(this.m) < 0) return x;
        else {
            var r = nbi();
            x.copyTo(r);
            this.reduce(r);
            return r;
        }
    };
    Barrett.prototype.revert = function(x) {
        return x;
    };
    // x = x mod m (HAC 14.42)
    Barrett.prototype.reduce = function(x) {
        x.drShiftTo(this.m.t - 1, this.r2);
        if (x.t > this.m.t + 1) {
            x.t = this.m.t + 1;
            x.clamp();
        }
        this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3);
        this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2);
        while (x.compareTo(this.r2) < 0) x.dAddOffset(1, this.m.t + 1);
        x.subTo(this.r2, x);
        while (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
    };
    // r = x*y mod m; x,y != r
    Barrett.prototype.mulTo = function(x, y, r) {
        x.multiplyTo(y, r);
        this.reduce(r);
    };
    // r = x^2 mod m; x != r
    Barrett.prototype.sqrTo = function(x, r) {
        x.squareTo(r);
        this.reduce(r);
    };

    // BigInteger interfaces not implemented in jsbn:

    // BigInteger(int signum, byte[] magnitude)
    // double doubleValue()
    // float floatValue()
    // int hashCode()
    // long longValue()
    // static BigInteger valueOf(long val)
})(typeof global !== "undefined" ? global : window);

//ellipticcurve.js
(function(GLOBAL) {
    /*!
     * Basic Javascript Elliptic Curve implementation
     * Ported loosely from BouncyCastle's Java EC code
     * Only Fp curves implemented for now
     *
     * Copyright Tom Wu, bitaddress.org  BSD License.
     * http://www-cs-students.stanford.edu/~tjw/jsbn/LICENSE
     */
    // Constructor function of Global EllipticCurve object
    var ec = GLOBAL.EllipticCurve = function() {};

    // ----------------
    // ECFieldElementFp constructor
    // q instanceof BigInteger
    // x instanceof BigInteger
    ec.FieldElementFp = function(q, x) {
        this.x = x;
        // TODO if(x.compareTo(q) >= 0) error
        this.q = q;
    };

    ec.FieldElementFp.prototype.equals = function(other) {
        if (other == this) return true;
        return (this.q.equals(other.q) && this.x.equals(other.x));
    };

    ec.FieldElementFp.prototype.toBigInteger = function() {
        return this.x;
    };

    ec.FieldElementFp.prototype.negate = function() {
        return new ec.FieldElementFp(this.q, this.x.negate().mod(this.q));
    };

    ec.FieldElementFp.prototype.add = function(b) {
        return new ec.FieldElementFp(this.q, this.x.add(b.toBigInteger()).mod(this.q));
    };

    ec.FieldElementFp.prototype.subtract = function(b) {
        return new ec.FieldElementFp(this.q, this.x.subtract(b.toBigInteger()).mod(this.q));
    };

    ec.FieldElementFp.prototype.multiply = function(b) {
        return new ec.FieldElementFp(this.q, this.x.multiply(b.toBigInteger()).mod(this.q));
    };

    ec.FieldElementFp.prototype.square = function() {
        return new ec.FieldElementFp(this.q, this.x.square().mod(this.q));
    };

    ec.FieldElementFp.prototype.divide = function(b) {
        return new ec.FieldElementFp(this.q, this.x.multiply(b.toBigInteger().modInverse(this.q)).mod(
            this.q));
    };

    ec.FieldElementFp.prototype.getByteLength = function() {
        return Math.floor((this.toBigInteger().bitLength() + 7) / 8);
    };

    // D.1.4 91
    /**
     * return a sqrt root - the routine verifies that the calculation
     * returns the right value - if none exists it returns null.
     *
     * Copyright (c) 2000 - 2011 The Legion Of The Bouncy Castle (http://www.bouncycastle.org)
     * Ported to JavaScript by bitaddress.org
     */
    ec.FieldElementFp.prototype.sqrt = function() {
        if (!this.q.testBit(0)) throw new Error("even value of q");

        // p mod 4 == 3
        if (this.q.testBit(1)) {
            // z = g^(u+1) + p, p = 4u + 3
            var z = new ec.FieldElementFp(this.q, this.x.modPow(this.q.shiftRight(2).add(BigInteger.ONE),
                this.q));
            return z.square().equals(this) ? z : null;
        }

        // p mod 4 == 1
        var qMinusOne = this.q.subtract(BigInteger.ONE);
        var legendreExponent = qMinusOne.shiftRight(1);
        if (!(this.x.modPow(legendreExponent, this.q).equals(BigInteger.ONE))) return null;
        var u = qMinusOne.shiftRight(2);
        var k = u.shiftLeft(1).add(BigInteger.ONE);
        var Q = this.x;
        var fourQ = Q.shiftLeft(2).mod(this.q);
        var U, V;

        do {
            var rand = new SecureRandom();
            var P;
            do {
                P = new BigInteger(this.q.bitLength(), rand);
            }
            while (P.compareTo(this.q) >= 0 || !(P.multiply(P).subtract(fourQ).modPow(legendreExponent,
                    this.q).equals(qMinusOne)));

            var result = ec.FieldElementFp.fastLucasSequence(this.q, P, Q, k);

            U = result[0];
            V = result[1];
            if (V.multiply(V).mod(this.q).equals(fourQ)) {
                // Integer division by 2, mod q
                if (V.testBit(0)) {
                    V = V.add(this.q);
                }
                V = V.shiftRight(1);
                return new ec.FieldElementFp(this.q, V);
            }
        }
        while (U.equals(BigInteger.ONE) || U.equals(qMinusOne));

        return null;
    };
    /*!
     * Crypto-JS 2.5.4 BlockModes.js
     * contribution from Simon Greatrix
     */

    (function(C) {

        // Create pad namespace
        var C_pad = C.pad = {};

        // Calculate the number of padding bytes required.
        function _requiredPadding(cipher, message) {
            var blockSizeInBytes = cipher._blocksize * 4;
            var reqd = blockSizeInBytes - message.length % blockSizeInBytes;
            return reqd;
        }

        // Remove padding when the final byte gives the number of padding bytes.
        var _unpadLength = function(cipher, message, alg, padding) {
            var pad = message.pop();
            if (pad == 0) {
                throw new Error("Invalid zero-length padding specified for " + alg +
                    ". Wrong cipher specification or key used?");
            }
            var maxPad = cipher._blocksize * 4;
            if (pad > maxPad) {
                throw new Error("Invalid padding length of " + pad +
                    " specified for " + alg +
                    ". Wrong cipher specification or key used?");
            }
            for (var i = 1; i < pad; i++) {
                var b = message.pop();
                if (padding != undefined && padding != b) {
                    throw new Error("Invalid padding byte of 0x" + b.toString(16) +
                        " specified for " + alg +
                        ". Wrong cipher specification or key used?");
                }
            }
        };

        // No-operation padding, used for stream ciphers
        C_pad.NoPadding = {
            pad: function(cipher, message) {},
            unpad: function(cipher, message) {}
        };

        // Zero Padding.
        //
        // If the message is not an exact number of blocks, the final block is
        // completed with 0x00 bytes. There is no unpadding.
        C_pad.ZeroPadding = {
            pad: function(cipher, message) {
                var blockSizeInBytes = cipher._blocksize * 4;
                var reqd = message.length % blockSizeInBytes;
                if (reqd != 0) {
                    for (reqd = blockSizeInBytes - reqd; reqd > 0; reqd--) {
                        message.push(0x00);
                    }
                }
            },

            unpad: function(cipher, message) {
                while (message[message.length - 1] == 0) {
                    message.pop();
                }
            }
        };

        // ISO/IEC 7816-4 padding.
        //
        // Pads the plain text with an 0x80 byte followed by as many 0x00
        // bytes are required to complete the block.
        C_pad.iso7816 = {
            pad: function(cipher, message) {
                var reqd = _requiredPadding(cipher, message);
                message.push(0x80);
                for (; reqd > 1; reqd--) {
                    message.push(0x00);
                }
            },

            unpad: function(cipher, message) {
                var padLength;
                for (padLength = cipher._blocksize * 4; padLength > 0; padLength--) {
                    var b = message.pop();
                    if (b == 0x80) return;
                    if (b != 0x00) {
                        throw new Error("ISO-7816 padding byte must be 0, not 0x" + b.toString(16) +
                            ". Wrong cipher specification or key used?");
                    }
                }
                throw new Error(
                    "ISO-7816 padded beyond cipher block size. Wrong cipher specification or key used?"
                );
            }
        };

        // ANSI X.923 padding
        //
        // The final block is padded with zeros except for the last byte of the
        // last block which contains the number of padding bytes.
        C_pad.ansix923 = {
            pad: function(cipher, message) {
                var reqd = _requiredPadding(cipher, message);
                for (var i = 1; i < reqd; i++) {
                    message.push(0x00);
                }
                message.push(reqd);
            },

            unpad: function(cipher, message) {
                _unpadLength(cipher, message, "ANSI X.923", 0);
            }
        };

        // ISO 10126
        //
        // The final block is padded with random bytes except for the last
        // byte of the last block which contains the number of padding bytes.
        C_pad.iso10126 = {
            pad: function(cipher, message) {
                var reqd = _requiredPadding(cipher, message);
                for (var i = 1; i < reqd; i++) {
                    message.push(Math.floor(Math.random() * 256));
                }
                message.push(reqd);
            },

            unpad: function(cipher, message) {
                _unpadLength(cipher, message, "ISO 10126", undefined);
            }
        };

        // PKCS7 padding
        //
        // PKCS7 is described in RFC 5652. Padding is in whole bytes. The
        // value of each added byte is the number of bytes that are added,
        // i.e. N bytes, each of value N are added.
        C_pad.pkcs7 = {
            pad: function(cipher, message) {
                var reqd = _requiredPadding(cipher, message);
                for (var i = 0; i < reqd; i++) {
                    message.push(reqd);
                }
            },

            unpad: function(cipher, message) {
                _unpadLength(cipher, message, "PKCS 7", message[message.length - 1]);
            }
        };

        // Create mode namespace
        var C_mode = C.mode = {};

        /**
         * Mode base "class".
         */
        var Mode = C_mode.Mode = function(padding) {
            if (padding) {
                this._padding = padding;
            }
        };

        Mode.prototype = {
            encrypt: function(cipher, m, iv) {
                this._padding.pad(cipher, m);
                this._doEncrypt(cipher, m, iv);
            },

            decrypt: function(cipher, m, iv) {
                this._doDecrypt(cipher, m, iv);
                this._padding.unpad(cipher, m);
            },

            // Default padding
            _padding: C_pad.iso7816
        };


        /**
         * Electronic Code Book mode.
         * 
         * ECB applies the cipher directly against each block of the input.
         * 
         * ECB does not require an initialization vector.
         */
        var ECB = C_mode.ECB = function() {
            // Call parent constructor
            Mode.apply(this, arguments);
        };

        // Inherit from Mode
        var ECB_prototype = ECB.prototype = new Mode;

        // Concrete steps for Mode template
        ECB_prototype._doEncrypt = function(cipher, m, iv) {
            var blockSizeInBytes = cipher._blocksize * 4;
            // Encrypt each block
            for (var offset = 0; offset < m.length; offset += blockSizeInBytes) {
                cipher._encryptblock(m, offset);
            }
        };
        ECB_prototype._doDecrypt = function(cipher, c, iv) {
            var blockSizeInBytes = cipher._blocksize * 4;
            // Decrypt each block
            for (var offset = 0; offset < c.length; offset += blockSizeInBytes) {
                cipher._decryptblock(c, offset);
            }
        };

        // ECB never uses an IV
        ECB_prototype.fixOptions = function(options) {
            options.iv = [];
        };


        /**
         * Cipher block chaining
         * 
         * The first block is XORed with the IV. Subsequent blocks are XOR with the
         * previous cipher output.
         */
        var CBC = C_mode.CBC = function() {
            // Call parent constructor
            Mode.apply(this, arguments);
        };

        // Inherit from Mode
        var CBC_prototype = CBC.prototype = new Mode;

        // Concrete steps for Mode template
        CBC_prototype._doEncrypt = function(cipher, m, iv) {
            var blockSizeInBytes = cipher._blocksize * 4;

            // Encrypt each block
            for (var offset = 0; offset < m.length; offset += blockSizeInBytes) {
                if (offset == 0) {
                    // XOR first block using IV
                    for (var i = 0; i < blockSizeInBytes; i++)
                        m[i] ^= iv[i];
                } else {
                    // XOR this block using previous crypted block
                    for (var i = 0; i < blockSizeInBytes; i++)
                        m[offset + i] ^= m[offset + i - blockSizeInBytes];
                }
                // Encrypt block
                cipher._encryptblock(m, offset);
            }
        };
        CBC_prototype._doDecrypt = function(cipher, c, iv) {
            var blockSizeInBytes = cipher._blocksize * 4;

            // At the start, the previously crypted block is the IV
            var prevCryptedBlock = iv;

            // Decrypt each block
            for (var offset = 0; offset < c.length; offset += blockSizeInBytes) {
                // Save this crypted block
                var thisCryptedBlock = c.slice(offset, offset + blockSizeInBytes);
                // Decrypt block
                cipher._decryptblock(c, offset);
                // XOR decrypted block using previous crypted block
                for (var i = 0; i < blockSizeInBytes; i++) {
                    c[offset + i] ^= prevCryptedBlock[i];
                }
                prevCryptedBlock = thisCryptedBlock;
            }
        };


        /**
         * Cipher feed back
         * 
         * The cipher output is XORed with the plain text to produce the cipher output,
         * which is then fed back into the cipher to produce a bit pattern to XOR the
         * next block with.
         * 
         * This is a stream cipher mode and does not require padding.
         */
        var CFB = C_mode.CFB = function() {
            // Call parent constructor
            Mode.apply(this, arguments);
        };

        // Inherit from Mode
        var CFB_prototype = CFB.prototype = new Mode;

        // Override padding
        CFB_prototype._padding = C_pad.NoPadding;

        // Concrete steps for Mode template
        CFB_prototype._doEncrypt = function(cipher, m, iv) {
            var blockSizeInBytes = cipher._blocksize * 4,
                keystream = iv.slice(0);

            // Encrypt each byte
            for (var i = 0; i < m.length; i++) {

                var j = i % blockSizeInBytes;
                if (j == 0) cipher._encryptblock(keystream, 0);

                m[i] ^= keystream[j];
                keystream[j] = m[i];
            }
        };
        CFB_prototype._doDecrypt = function(cipher, c, iv) {
            var blockSizeInBytes = cipher._blocksize * 4,
                keystream = iv.slice(0);

            // Encrypt each byte
            for (var i = 0; i < c.length; i++) {

                var j = i % blockSizeInBytes;
                if (j == 0) cipher._encryptblock(keystream, 0);

                var b = c[i];
                c[i] ^= keystream[j];
                keystream[j] = b;
            }
        };


        /**
         * Output feed back
         * 
         * The cipher repeatedly encrypts its own output. The output is XORed with the
         * plain text to produce the cipher text.
         * 
         * This is a stream cipher mode and does not require padding.
         */
        var OFB = C_mode.OFB = function() {
            // Call parent constructor
            Mode.apply(this, arguments);
        };

        // Inherit from Mode
        var OFB_prototype = OFB.prototype = new Mode;

        // Override padding
        OFB_prototype._padding = C_pad.NoPadding;

        // Concrete steps for Mode template
        OFB_prototype._doEncrypt = function(cipher, m, iv) {

            var blockSizeInBytes = cipher._blocksize * 4,
                keystream = iv.slice(0);

            // Encrypt each byte
            for (var i = 0; i < m.length; i++) {

                // Generate keystream
                if (i % blockSizeInBytes == 0)
                    cipher._encryptblock(keystream, 0);

                // Encrypt byte
                m[i] ^= keystream[i % blockSizeInBytes];

            }
        };
        OFB_prototype._doDecrypt = OFB_prototype._doEncrypt;

        /**
         * Counter
         * @author Gergely Risko
         *
         * After every block the last 4 bytes of the IV is increased by one
         * with carry and that IV is used for the next block.
         *
         * This is a stream cipher mode and does not require padding.
         */
        var CTR = C_mode.CTR = function() {
            // Call parent constructor
            Mode.apply(this, arguments);
        };

        // Inherit from Mode
        var CTR_prototype = CTR.prototype = new Mode;

        // Override padding
        CTR_prototype._padding = C_pad.NoPadding;

        CTR_prototype._doEncrypt = function(cipher, m, iv) {
            var blockSizeInBytes = cipher._blocksize * 4;
            var counter = iv.slice(0);

            for (var i = 0; i < m.length;) {
                // do not lose iv
                var keystream = counter.slice(0);

                // Generate keystream for next block
                cipher._encryptblock(keystream, 0);

                // XOR keystream with block
                for (var j = 0; i < m.length && j < blockSizeInBytes; j++, i++) {
                    m[i] ^= keystream[j];
                }

                // Increase counter
                if (++(counter[blockSizeInBytes - 1]) == 256) {
                    counter[blockSizeInBytes - 1] = 0;
                    if (++(counter[blockSizeInBytes - 2]) == 256) {
                        counter[blockSizeInBytes - 2] = 0;
                        if (++(counter[blockSizeInBytes - 3]) == 256) {
                            counter[blockSizeInBytes - 3] = 0;
                            ++(counter[blockSizeInBytes - 4]);
                        }
                    }
                }
            }
        };
        CTR_prototype._doDecrypt = CTR_prototype._doEncrypt;

    })(Crypto);

    /*!
     * Crypto-JS v2.5.4  PBKDF2.js
     * http://code.google.com/p/crypto-js/
     * Copyright (c) 2009-2013, Jeff Mott. All rights reserved.
     * http://code.google.com/p/crypto-js/wiki/License
     */
    (function() {

        // Shortcuts
        var C = Crypto,
            util = C.util,
            charenc = C.charenc,
            UTF8 = charenc.UTF8,
            Binary = charenc.Binary;

        C.PBKDF2 = function(password, salt, keylen, options) {

            // Convert to byte arrays
            if (password.constructor == String) password = UTF8.stringToBytes(password);
            if (salt.constructor == String) salt = UTF8.stringToBytes(salt);
            /* else, assume byte arrays already */

            // Defaults
            var hasher = options && options.hasher || C.SHA1,
                iterations = options && options.iterations || 1;

            // Pseudo-random function
            function PRF(password, salt) {
                return C.HMAC(hasher, salt, password, {
                    asBytes: true
                });
            }

            // Generate key
            var derivedKeyBytes = [],
                blockindex = 1;
            while (derivedKeyBytes.length < keylen) {
                var block = PRF(password, salt.concat(util.wordsToBytes([blockindex])));
                for (var u = block, i = 1; i < iterations; i++) {
                    u = PRF(password, u);
                    for (var j = 0; j < block.length; j++) block[j] ^= u[j];
                }
                derivedKeyBytes = derivedKeyBytes.concat(block);
                blockindex++;
            }

            // Truncate excess bytes
            derivedKeyBytes.length = keylen;

            return options && options.asBytes ? derivedKeyBytes :
                options && options.asString ? Binary.bytesToString(derivedKeyBytes) :
                util.bytesToHex(derivedKeyBytes);

        };

    })();

    /*
     * Copyright (c) 2010-2011 Intalio Pte, All Rights Reserved
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    // https://github.com/cheongwy/node-scrypt-js
    (function() {

        var MAX_VALUE = 2147483647;
        var workerUrl = null;

        //function scrypt(byte[] passwd, byte[] salt, int N, int r, int p, int dkLen)
        /*
         * N = Cpu cost
         * r = Memory cost
         * p = parallelization cost
         * 
         */
        GLOBAL.Crypto_scrypt = function(passwd, salt, N, r, p, dkLen, callback) {
            if (N == 0 || (N & (N - 1)) != 0) throw Error("N must be > 0 and a power of 2");

            if (N > MAX_VALUE / 128 / r) throw Error("Parameter N is too large");
            if (r > MAX_VALUE / 128 / p) throw Error("Parameter r is too large");

            var PBKDF2_opts = {
                iterations: 1,
                hasher: Crypto.SHA256,
                asBytes: true
            };

            var B = Crypto.PBKDF2(passwd, salt, p * 128 * r, PBKDF2_opts);

            try {
                var i = 0;
                var worksDone = 0;
                var makeWorker = function() {
                    if (!workerUrl) {
                        var code = '(' + scryptCore.toString() + ')()';
                        var blob;
                        try {
                            blob = new Blob([code], {
                                type: "text/javascript"
                            });
                        } catch (e) {
                            GLOBAL.BlobBuilder = GLOBAL.BlobBuilder || GLOBAL.WebKitBlobBuilder ||
                                GLOBAL.MozBlobBuilder ||
                                GLOBAL.MSBlobBuilder;
                            blob = new BlobBuilder();
                            blob.append(code);
                            blob = blob.getBlob("text/javascript");
                        }
                        workerUrl = URL.createObjectURL(blob);
                    }
                    var worker = new Worker(workerUrl);
                    worker.onmessage = function(event) {
                        var Bi = event.data[0],
                            Bslice = event.data[1];
                        worksDone++;

                        if (i < p) {
                            worker.postMessage([N, r, p, B, i++]);
                        }

                        var length = Bslice.length,
                            destPos = Bi * 128 * r,
                            srcPos = 0;
                        while (length--) {
                            B[destPos++] = Bslice[srcPos++];
                        }

                        if (worksDone == p) {
                            callback(Crypto.PBKDF2(passwd, B, dkLen, PBKDF2_opts));
                        }
                    };
                    return worker;
                };
                var workers = [makeWorker(), makeWorker()];
                workers[0].postMessage([N, r, p, B, i++]);
                if (p > 1) {
                    workers[1].postMessage([N, r, p, B, i++]);
                }
            } catch (e) {
                GLOBAL.setTimeout(function() {
                    scryptCore();
                    callback(Crypto.PBKDF2(passwd, B, dkLen, PBKDF2_opts));
                }, 0);
            }

            // using this function to enclose everything needed to create a worker (but also invokable directly for synchronous use)
            function scryptCore() {
                var XY = [],
                    V = [];

                if (typeof B === 'undefined') {
                    onmessage = function(event) {
                        var data = event.data;
                        var N = data[0],
                            r = data[1],
                            p = data[2],
                            B = data[3],
                            i = data[4];

                        var Bslice = [];
                        arraycopy32(B, i * 128 * r, Bslice, 0, 128 * r);
                        smix(Bslice, 0, r, N, V, XY);

                        postMessage([i, Bslice]);
                    };
                } else {
                    for (var i = 0; i < p; i++) {
                        smix(B, i * 128 * r, r, N, V, XY);
                    }
                }

                function smix(B, Bi, r, N, V, XY) {
                    var Xi = 0;
                    var Yi = 128 * r;
                    var i;

                    arraycopy32(B, Bi, XY, Xi, Yi);

                    for (i = 0; i < N; i++) {
                        arraycopy32(XY, Xi, V, i * Yi, Yi);
                        blockmix_salsa8(XY, Xi, Yi, r);
                    }

                    for (i = 0; i < N; i++) {
                        var j = integerify(XY, Xi, r) & (N - 1);
                        blockxor(V, j * Yi, XY, Xi, Yi);
                        blockmix_salsa8(XY, Xi, Yi, r);
                    }

                    arraycopy32(XY, Xi, B, Bi, Yi);
                }

                function blockmix_salsa8(BY, Bi, Yi, r) {
                    var X = [];
                    var i;

                    arraycopy32(BY, Bi + (2 * r - 1) * 64, X, 0, 64);

                    for (i = 0; i < 2 * r; i++) {
                        blockxor(BY, i * 64, X, 0, 64);
                        salsa20_8(X);
                        arraycopy32(X, 0, BY, Yi + (i * 64), 64);
                    }

                    for (i = 0; i < r; i++) {
                        arraycopy32(BY, Yi + (i * 2) * 64, BY, Bi + (i * 64), 64);
                    }

                    for (i = 0; i < r; i++) {
                        arraycopy32(BY, Yi + (i * 2 + 1) * 64, BY, Bi + (i + r) * 64, 64);
                    }
                }

                function R(a, b) {
                    return (a << b) | (a >>> (32 - b));
                }

                function salsa20_8(B) {
                    var B32 = new Array(32);
                    var x = new Array(32);
                    var i;

                    for (i = 0; i < 16; i++) {
                        B32[i] = (B[i * 4 + 0] & 0xff) << 0;
                        B32[i] |= (B[i * 4 + 1] & 0xff) << 8;
                        B32[i] |= (B[i * 4 + 2] & 0xff) << 16;
                        B32[i] |= (B[i * 4 + 3] & 0xff) << 24;
                    }

                    arraycopy(B32, 0, x, 0, 16);

                    for (i = 8; i > 0; i -= 2) {
                        x[4] ^= R(x[0] + x[12], 7);
                        x[8] ^= R(x[4] + x[0], 9);
                        x[12] ^= R(x[8] + x[4], 13);
                        x[0] ^= R(x[12] + x[8], 18);
                        x[9] ^= R(x[5] + x[1], 7);
                        x[13] ^= R(x[9] + x[5], 9);
                        x[1] ^= R(x[13] + x[9], 13);
                        x[5] ^= R(x[1] + x[13], 18);
                        x[14] ^= R(x[10] + x[6], 7);
                        x[2] ^= R(x[14] + x[10], 9);
                        x[6] ^= R(x[2] + x[14], 13);
                        x[10] ^= R(x[6] + x[2], 18);
                        x[3] ^= R(x[15] + x[11], 7);
                        x[7] ^= R(x[3] + x[15], 9);
                        x[11] ^= R(x[7] + x[3], 13);
                        x[15] ^= R(x[11] + x[7], 18);
                        x[1] ^= R(x[0] + x[3], 7);
                        x[2] ^= R(x[1] + x[0], 9);
                        x[3] ^= R(x[2] + x[1], 13);
                        x[0] ^= R(x[3] + x[2], 18);
                        x[6] ^= R(x[5] + x[4], 7);
                        x[7] ^= R(x[6] + x[5], 9);
                        x[4] ^= R(x[7] + x[6], 13);
                        x[5] ^= R(x[4] + x[7], 18);
                        x[11] ^= R(x[10] + x[9], 7);
                        x[8] ^= R(x[11] + x[10], 9);
                        x[9] ^= R(x[8] + x[11], 13);
                        x[10] ^= R(x[9] + x[8], 18);
                        x[12] ^= R(x[15] + x[14], 7);
                        x[13] ^= R(x[12] + x[15], 9);
                        x[14] ^= R(x[13] + x[12], 13);
                        x[15] ^= R(x[14] + x[13], 18);
                    }

                    for (i = 0; i < 16; ++i) B32[i] = x[i] + B32[i];

                    for (i = 0; i < 16; i++) {
                        var bi = i * 4;
                        B[bi + 0] = (B32[i] >> 0 & 0xff);
                        B[bi + 1] = (B32[i] >> 8 & 0xff);
                        B[bi + 2] = (B32[i] >> 16 & 0xff);
                        B[bi + 3] = (B32[i] >> 24 & 0xff);
                    }
                }

                function blockxor(S, Si, D, Di, len) {
                    var i = len >> 6;
                    while (i--) {
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];

                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];

                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];

                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];

                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];

                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];

                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];

                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                        D[Di++] ^= S[Si++];
                    }
                }

                function integerify(B, bi, r) {
                    var n;

                    bi += (2 * r - 1) * 64;

                    n = (B[bi + 0] & 0xff) << 0;
                    n |= (B[bi + 1] & 0xff) << 8;
                    n |= (B[bi + 2] & 0xff) << 16;
                    n |= (B[bi + 3] & 0xff) << 24;

                    return n;
                }

                function arraycopy(src, srcPos, dest, destPos, length) {
                    while (length--) {
                        dest[destPos++] = src[srcPos++];
                    }
                }

                function arraycopy32(src, srcPos, dest, destPos, length) {
                    var i = length >> 5;
                    while (i--) {
                        dest[destPos++] = src[srcPos++];
                        dest[destPos++] = src[srcPos++];
                        dest[destPos++] = src[srcPos++];
                        dest[destPos++] = src[srcPos++];
                        dest[destPos++] = src[srcPos++];
                        dest[destPos++] = src[srcPos++];
                        dest[destPos++] = src[srcPos++];
                        dest[destPos++] = src[srcPos++];

                        dest[destPos++] = src[srcPos++];
                        dest[destPos++] = src[srcPos++];
                        dest[destPos++] = src[srcPos++];
                        dest[destPos++] = src[srcPos++];
                        dest[destPos++] = src[srcPos++];
                        dest[destPos++] = src[srcPos++];
                        dest[destPos++] = src[srcPos++];
                        dest[destPos++] = src[srcPos++];

                        dest[destPos++] = src[srcPos++];
                        dest[destPos++] = src[srcPos++];
                        dest[destPos++] = src[srcPos++];
                        dest[destPos++] = src[srcPos++];
                        dest[destPos++] = src[srcPos++];
                        dest[destPos++] = src[srcPos++];
                        dest[destPos++] = src[srcPos++];
                        dest[destPos++] = src[srcPos++];

                        dest[destPos++] = src[srcPos++];
                        dest[destPos++] = src[srcPos++];
                        dest[destPos++] = src[srcPos++];
                        dest[destPos++] = src[srcPos++];
                        dest[destPos++] = src[srcPos++];
                        dest[destPos++] = src[srcPos++];
                        dest[destPos++] = src[srcPos++];
                        dest[destPos++] = src[srcPos++];
                    }
                }
            } // scryptCore
        }; // GLOBAL.Crypto_scrypt
    })();

    /*!
     * Crypto-JS v2.5.4  AES.js
     * http://code.google.com/p/crypto-js/
     * Copyright (c) 2009-2013, Jeff Mott. All rights reserved.
     * http://code.google.com/p/crypto-js/wiki/License
     */
    (function() {

        // Shortcuts
        var C = Crypto,
            util = C.util,
            charenc = C.charenc,
            UTF8 = charenc.UTF8;

        // Precomputed SBOX
        var SBOX = [0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5,
            0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
            0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0,
            0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
            0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc,
            0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
            0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a,
            0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
            0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0,
            0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
            0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b,
            0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
            0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85,
            0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
            0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5,
            0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
            0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17,
            0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
            0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88,
            0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
            0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c,
            0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
            0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9,
            0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
            0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6,
            0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
            0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e,
            0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
            0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94,
            0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
            0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68,
            0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
        ];

        // Compute inverse SBOX lookup table
        for (var INVSBOX = [], i = 0; i < 256; i++) INVSBOX[SBOX[i]] = i;

        // Compute multiplication in GF(2^8) lookup tables
        var MULT2 = [],
            MULT3 = [],
            MULT9 = [],
            MULTB = [],
            MULTD = [],
            MULTE = [];

        function xtime(a, b) {
            for (var result = 0, i = 0; i < 8; i++) {
                if (b & 1) result ^= a;
                var hiBitSet = a & 0x80;
                a = (a << 1) & 0xFF;
                if (hiBitSet) a ^= 0x1b;
                b >>>= 1;
            }
            return result;
        }

        for (var i = 0; i < 256; i++) {
            MULT2[i] = xtime(i, 2);
            MULT3[i] = xtime(i, 3);
            MULT9[i] = xtime(i, 9);
            MULTB[i] = xtime(i, 0xB);
            MULTD[i] = xtime(i, 0xD);
            MULTE[i] = xtime(i, 0xE);
        }

        // Precomputed RCon lookup
        var RCON = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];

        // Inner state
        var state = [
                [],
                [],
                [],
                []
            ],
            keylength,
            nrounds,
            keyschedule;

        var AES = C.AES = {

            /**
             * Public API
             */

            encrypt: function(message, password, options) {

                options = options || {};

                // Determine mode
                var mode = options.mode || new C.mode.OFB;

                // Allow mode to override options
                if (mode.fixOptions) mode.fixOptions(options);

                var

                    // Convert to bytes if message is a string
                    m = (
                        message.constructor == String ?
                        UTF8.stringToBytes(message) :
                        message
                    ),

                    // Generate random IV
                    iv = options.iv || util.randomBytes(AES._blocksize * 4),

                    // Generate key
                    k = (
                        password.constructor == String ?
                        // Derive key from pass-phrase
                        C.PBKDF2(password, iv, 32, {
                            asBytes: true
                        }) :
                        // else, assume byte array representing cryptographic key
                        password
                    );

                // Encrypt
                AES._init(k);
                mode.encrypt(AES, m, iv);

                // Return ciphertext
                m = options.iv ? m : iv.concat(m);
                return (options && options.asBytes) ? m : util.bytesToBase64(m);

            },

            decrypt: function(ciphertext, password, options) {

                options = options || {};

                // Determine mode
                var mode = options.mode || new C.mode.OFB;

                // Allow mode to override options
                if (mode.fixOptions) mode.fixOptions(options);

                var

                    // Convert to bytes if ciphertext is a string
                    c = (
                        ciphertext.constructor == String ?
                        util.base64ToBytes(ciphertext) :
                        ciphertext
                    ),

                    // Separate IV and message
                    iv = options.iv || c.splice(0, AES._blocksize * 4),

                    // Generate key
                    k = (
                        password.constructor == String ?
                        // Derive key from pass-phrase
                        C.PBKDF2(password, iv, 32, {
                            asBytes: true
                        }) :
                        // else, assume byte array representing cryptographic key
                        password
                    );

                // Decrypt
                AES._init(k);
                mode.decrypt(AES, c, iv);

                // Return plaintext
                return (options && options.asBytes) ? c : UTF8.bytesToString(c);

            },


            /**
             * Package private methods and properties
             */

            _blocksize: 4,

            _encryptblock: function(m, offset) {

                // Set input
                for (var row = 0; row < AES._blocksize; row++) {
                    for (var col = 0; col < 4; col++)
                        state[row][col] = m[offset + col * 4 + row];
                }

                // Add round key
                for (var row = 0; row < 4; row++) {
                    for (var col = 0; col < 4; col++)
                        state[row][col] ^= keyschedule[col][row];
                }

                for (var round = 1; round < nrounds; round++) {

                    // Sub bytes
                    for (var row = 0; row < 4; row++) {
                        for (var col = 0; col < 4; col++)
                            state[row][col] = SBOX[state[row][col]];
                    }

                    // Shift rows
                    state[1].push(state[1].shift());
                    state[2].push(state[2].shift());
                    state[2].push(state[2].shift());
                    state[3].unshift(state[3].pop());

                    // Mix columns
                    for (var col = 0; col < 4; col++) {

                        var s0 = state[0][col],
                            s1 = state[1][col],
                            s2 = state[2][col],
                            s3 = state[3][col];

                        state[0][col] = MULT2[s0] ^ MULT3[s1] ^ s2 ^ s3;
                        state[1][col] = s0 ^ MULT2[s1] ^ MULT3[s2] ^ s3;
                        state[2][col] = s0 ^ s1 ^ MULT2[s2] ^ MULT3[s3];
                        state[3][col] = MULT3[s0] ^ s1 ^ s2 ^ MULT2[s3];

                    }

                    // Add round key
                    for (var row = 0; row < 4; row++) {
                        for (var col = 0; col < 4; col++)
                            state[row][col] ^= keyschedule[round * 4 + col][row];
                    }

                }

                // Sub bytes
                for (var row = 0; row < 4; row++) {
                    for (var col = 0; col < 4; col++)
                        state[row][col] = SBOX[state[row][col]];
                }

                // Shift rows
                state[1].push(state[1].shift());
                state[2].push(state[2].shift());
                state[2].push(state[2].shift());
                state[3].unshift(state[3].pop());

                // Add round key
                for (var row = 0; row < 4; row++) {
                    for (var col = 0; col < 4; col++)
                        state[row][col] ^= keyschedule[nrounds * 4 + col][row];
                }

                // Set output
                for (var row = 0; row < AES._blocksize; row++) {
                    for (var col = 0; col < 4; col++)
                        m[offset + col * 4 + row] = state[row][col];
                }

            },

            _decryptblock: function(c, offset) {

                // Set input
                for (var row = 0; row < AES._blocksize; row++) {
                    for (var col = 0; col < 4; col++)
                        state[row][col] = c[offset + col * 4 + row];
                }

                // Add round key
                for (var row = 0; row < 4; row++) {
                    for (var col = 0; col < 4; col++)
                        state[row][col] ^= keyschedule[nrounds * 4 + col][row];
                }

                for (var round = 1; round < nrounds; round++) {

                    // Inv shift rows
                    state[1].unshift(state[1].pop());
                    state[2].push(state[2].shift());
                    state[2].push(state[2].shift());
                    state[3].push(state[3].shift());

                    // Inv sub bytes
                    for (var row = 0; row < 4; row++) {
                        for (var col = 0; col < 4; col++)
                            state[row][col] = INVSBOX[state[row][col]];
                    }

                    // Add round key
                    for (var row = 0; row < 4; row++) {
                        for (var col = 0; col < 4; col++)
                            state[row][col] ^= keyschedule[(nrounds - round) * 4 + col][row];
                    }

                    // Inv mix columns
                    for (var col = 0; col < 4; col++) {

                        var s0 = state[0][col],
                            s1 = state[1][col],
                            s2 = state[2][col],
                            s3 = state[3][col];

                        state[0][col] = MULTE[s0] ^ MULTB[s1] ^ MULTD[s2] ^ MULT9[s3];
                        state[1][col] = MULT9[s0] ^ MULTE[s1] ^ MULTB[s2] ^ MULTD[s3];
                        state[2][col] = MULTD[s0] ^ MULT9[s1] ^ MULTE[s2] ^ MULTB[s3];
                        state[3][col] = MULTB[s0] ^ MULTD[s1] ^ MULT9[s2] ^ MULTE[s3];

                    }

                }

                // Inv shift rows
                state[1].unshift(state[1].pop());
                state[2].push(state[2].shift());
                state[2].push(state[2].shift());
                state[3].push(state[3].shift());

                // Inv sub bytes
                for (var row = 0; row < 4; row++) {
                    for (var col = 0; col < 4; col++)
                        state[row][col] = INVSBOX[state[row][col]];
                }

                // Add round key
                for (var row = 0; row < 4; row++) {
                    for (var col = 0; col < 4; col++)
                        state[row][col] ^= keyschedule[col][row];
                }

                // Set output
                for (var row = 0; row < AES._blocksize; row++) {
                    for (var col = 0; col < 4; col++)
                        c[offset + col * 4 + row] = state[row][col];
                }

            },


            /**
             * Private methods
             */

            _init: function(k) {
                keylength = k.length / 4;
                nrounds = keylength + 6;
                AES._keyexpansion(k);
            },

            // Generate a key schedule
            _keyexpansion: function(k) {

                keyschedule = [];

                for (var row = 0; row < keylength; row++) {
                    keyschedule[row] = [
                        k[row * 4],
                        k[row * 4 + 1],
                        k[row * 4 + 2],
                        k[row * 4 + 3]
                    ];
                }

                for (var row = keylength; row < AES._blocksize * (nrounds + 1); row++) {

                    var temp = [
                        keyschedule[row - 1][0],
                        keyschedule[row - 1][1],
                        keyschedule[row - 1][2],
                        keyschedule[row - 1][3]
                    ];

                    if (row % keylength == 0) {

                        // Rot word
                        temp.push(temp.shift());

                        // Sub word
                        temp[0] = SBOX[temp[0]];
                        temp[1] = SBOX[temp[1]];
                        temp[2] = SBOX[temp[2]];
                        temp[3] = SBOX[temp[3]];

                        temp[0] ^= RCON[row / keylength];

                    } else if (keylength > 6 && row % keylength == 4) {

                        // Sub word
                        temp[0] = SBOX[temp[0]];
                        temp[1] = SBOX[temp[1]];
                        temp[2] = SBOX[temp[2]];
                        temp[3] = SBOX[temp[3]];

                    }

                    keyschedule[row] = [
                        keyschedule[row - keylength][0] ^ temp[0],
                        keyschedule[row - keylength][1] ^ temp[1],
                        keyschedule[row - keylength][2] ^ temp[2],
                        keyschedule[row - keylength][3] ^ temp[3]
                    ];

                }

            }

        };

    })();

    /*
     * Copyright (c) 2000 - 2011 The Legion Of The Bouncy Castle (http://www.bouncycastle.org)
     * Ported to JavaScript by bitaddress.org
     */
    ec.FieldElementFp.fastLucasSequence = function(p, P, Q, k) {
        // TODO Research and apply "common-multiplicand multiplication here"

        var n = k.bitLength();
        var s = k.getLowestSetBit();
        var Uh = BigInteger.ONE;
        var Vl = BigInteger.TWO;
        var Vh = P;
        var Ql = BigInteger.ONE;
        var Qh = BigInteger.ONE;

        for (var j = n - 1; j >= s + 1; --j) {
            Ql = Ql.multiply(Qh).mod(p);
            if (k.testBit(j)) {
                Qh = Ql.multiply(Q).mod(p);
                Uh = Uh.multiply(Vh).mod(p);
                Vl = Vh.multiply(Vl).subtract(P.multiply(Ql)).mod(p);
                Vh = Vh.multiply(Vh).subtract(Qh.shiftLeft(1)).mod(p);
            } else {
                Qh = Ql;
                Uh = Uh.multiply(Vl).subtract(Ql).mod(p);
                Vh = Vh.multiply(Vl).subtract(P.multiply(Ql)).mod(p);
                Vl = Vl.multiply(Vl).subtract(Ql.shiftLeft(1)).mod(p);
            }
        }

        Ql = Ql.multiply(Qh).mod(p);
        Qh = Ql.multiply(Q).mod(p);
        Uh = Uh.multiply(Vl).subtract(Ql).mod(p);
        Vl = Vh.multiply(Vl).subtract(P.multiply(Ql)).mod(p);
        Ql = Ql.multiply(Qh).mod(p);

        for (var j = 1; j <= s; ++j) {
            Uh = Uh.multiply(Vl).mod(p);
            Vl = Vl.multiply(Vl).subtract(Ql.shiftLeft(1)).mod(p);
            Ql = Ql.multiply(Ql).mod(p);
        }

        return [Uh, Vl];
    };

    // ----------------
    // ECPointFp constructor
    ec.PointFp = function(curve, x, y, z, compressed) {
        this.curve = curve;
        this.x = x;
        this.y = y;
        // Projective coordinates: either zinv == null or z * zinv == 1
        // z and zinv are just BigIntegers, not fieldElements
        if (z == null) {
            this.z = BigInteger.ONE;
        } else {
            this.z = z;
        }
        this.zinv = null;
        // compression flag
        this.compressed = !!compressed;
    };

    ec.PointFp.prototype.getX = function() {
        if (this.zinv == null) {
            this.zinv = this.z.modInverse(this.curve.q);
        }
        var r = this.x.toBigInteger().multiply(this.zinv);
        this.curve.reduce(r);
        return this.curve.fromBigInteger(r);
    };

    ec.PointFp.prototype.getY = function() {
        if (this.zinv == null) {
            this.zinv = this.z.modInverse(this.curve.q);
        }
        var r = this.y.toBigInteger().multiply(this.zinv);
        this.curve.reduce(r);
        return this.curve.fromBigInteger(r);
    };

    ec.PointFp.prototype.equals = function(other) {
        if (other == this) return true;
        if (this.isInfinity()) return other.isInfinity();
        if (other.isInfinity()) return this.isInfinity();
        var u, v;
        // u = Y2 * Z1 - Y1 * Z2
        u = other.y.toBigInteger().multiply(this.z).subtract(this.y.toBigInteger().multiply(other.z)).mod(
            this.curve.q);
        if (!u.equals(BigInteger.ZERO)) return false;
        // v = X2 * Z1 - X1 * Z2
        v = other.x.toBigInteger().multiply(this.z).subtract(this.x.toBigInteger().multiply(other.z)).mod(
            this.curve.q);
        return v.equals(BigInteger.ZERO);
    };

    ec.PointFp.prototype.isInfinity = function() {
        if ((this.x == null) && (this.y == null)) return true;
        return this.z.equals(BigInteger.ZERO) && !this.y.toBigInteger().equals(BigInteger.ZERO);
    };

    ec.PointFp.prototype.negate = function() {
        return new ec.PointFp(this.curve, this.x, this.y.negate(), this.z);
    };

    ec.PointFp.prototype.add = function(b) {
        if (this.isInfinity()) return b;
        if (b.isInfinity()) return this;

        // u = Y2 * Z1 - Y1 * Z2
        var u = b.y.toBigInteger().multiply(this.z).subtract(this.y.toBigInteger().multiply(b.z)).mod(
            this.curve.q);
        // v = X2 * Z1 - X1 * Z2
        var v = b.x.toBigInteger().multiply(this.z).subtract(this.x.toBigInteger().multiply(b.z)).mod(
            this.curve.q);


        if (BigInteger.ZERO.equals(v)) {
            if (BigInteger.ZERO.equals(u)) {
                return this.twice(); // this == b, so double
            }
            return this.curve.getInfinity(); // this = -b, so infinity
        }

        var THREE = new BigInteger("3");
        var x1 = this.x.toBigInteger();
        var y1 = this.y.toBigInteger();
        var x2 = b.x.toBigInteger();
        var y2 = b.y.toBigInteger();

        var v2 = v.square();
        var v3 = v2.multiply(v);
        var x1v2 = x1.multiply(v2);
        var zu2 = u.square().multiply(this.z);

        // x3 = v * (z2 * (z1 * u^2 - 2 * x1 * v^2) - v^3)
        var x3 = zu2.subtract(x1v2.shiftLeft(1)).multiply(b.z).subtract(v3).multiply(v).mod(this.curve.q);
        // y3 = z2 * (3 * x1 * u * v^2 - y1 * v^3 - z1 * u^3) + u * v^3
        var y3 = x1v2.multiply(THREE).multiply(u).subtract(y1.multiply(v3)).subtract(zu2.multiply(u)).multiply(
            b.z).add(u.multiply(v3)).mod(this.curve.q);
        // z3 = v^3 * z1 * z2
        var z3 = v3.multiply(this.z).multiply(b.z).mod(this.curve.q);

        return new ec.PointFp(this.curve, this.curve.fromBigInteger(x3), this.curve.fromBigInteger(y3),
            z3);
    };

    ec.PointFp.prototype.twice = function() {
        if (this.isInfinity()) return this;
        if (this.y.toBigInteger().signum() == 0) return this.curve.getInfinity();

        // TODO: optimized handling of constants
        var THREE = new BigInteger("3");
        var x1 = this.x.toBigInteger();
        var y1 = this.y.toBigInteger();

        var y1z1 = y1.multiply(this.z);
        var y1sqz1 = y1z1.multiply(y1).mod(this.curve.q);
        var a = this.curve.a.toBigInteger();

        // w = 3 * x1^2 + a * z1^2
        var w = x1.square().multiply(THREE);
        if (!BigInteger.ZERO.equals(a)) {
            w = w.add(this.z.square().multiply(a));
        }
        w = w.mod(this.curve.q);
        //this.curve.reduce(w);
        // x3 = 2 * y1 * z1 * (w^2 - 8 * x1 * y1^2 * z1)
        var x3 = w.square().subtract(x1.shiftLeft(3).multiply(y1sqz1)).shiftLeft(1).multiply(y1z1).mod(
            this.curve.q);
        // y3 = 4 * y1^2 * z1 * (3 * w * x1 - 2 * y1^2 * z1) - w^3
        var y3 = w.multiply(THREE).multiply(x1).subtract(y1sqz1.shiftLeft(1)).shiftLeft(2).multiply(
            y1sqz1).subtract(w.square().multiply(w)).mod(this.curve.q);
        // z3 = 8 * (y1 * z1)^3
        var z3 = y1z1.square().multiply(y1z1).shiftLeft(3).mod(this.curve.q);

        return new ec.PointFp(this.curve, this.curve.fromBigInteger(x3), this.curve.fromBigInteger(y3),
            z3);
    };

    // Simple NAF (Non-Adjacent Form) multiplication algorithm
    // TODO: modularize the multiplication algorithm
    ec.PointFp.prototype.multiply = function(k) {
        if (this.isInfinity()) return this;
        if (k.signum() == 0) return this.curve.getInfinity();

        var e = k;
        var h = e.multiply(new BigInteger("3"));

        var neg = this.negate();
        var R = this;

        var i;
        for (i = h.bitLength() - 2; i > 0; --i) {
            R = R.twice();

            var hBit = h.testBit(i);
            var eBit = e.testBit(i);

            if (hBit != eBit) {
                R = R.add(hBit ? this : neg);
            }
        }

        return R;
    };

    // Compute this*j + x*k (simultaneous multiplication)
    ec.PointFp.prototype.multiplyTwo = function(j, x, k) {
        var i;
        if (j.bitLength() > k.bitLength())
            i = j.bitLength() - 1;
        else
            i = k.bitLength() - 1;

        var R = this.curve.getInfinity();
        var both = this.add(x);
        while (i >= 0) {
            R = R.twice();
            if (j.testBit(i)) {
                if (k.testBit(i)) {
                    R = R.add(both);
                } else {
                    R = R.add(this);
                }
            } else {
                if (k.testBit(i)) {
                    R = R.add(x);
                }
            }
            --i;
        }

        return R;
    };

    // patched by bitaddress.org and Casascius for use with Bitcoin.ECKey
    // patched by coretechs to support compressed public keys
    ec.PointFp.prototype.getEncoded = function(compressed) {
        var x = this.getX().toBigInteger();
        var y = this.getY().toBigInteger();
        var len = 32; // integerToBytes will zero pad if integer is less than 32 bytes. 32 bytes length is required by the Bitcoin protocol.
        var enc = ec.integerToBytes(x, len);

        // when compressed prepend byte depending if y point is even or odd
        if (compressed) {
            if (y.isEven()) {
                enc.unshift(0x02);
            } else {
                enc.unshift(0x03);
            }
        } else {
            enc.unshift(0x04);
            enc = enc.concat(ec.integerToBytes(y, len)); // uncompressed public key appends the bytes of the y point
        }
        return enc;
    };

    ec.PointFp.decodeFrom = function(curve, enc) {
        var type = enc[0];
        var dataLen = enc.length - 1;

        // Extract x and y as byte arrays
        var xBa = enc.slice(1, 1 + dataLen / 2);
        var yBa = enc.slice(1 + dataLen / 2, 1 + dataLen);

        // Prepend zero byte to prevent interpretation as negative integer
        xBa.unshift(0);
        yBa.unshift(0);

        // Convert to BigIntegers
        var x = new BigInteger(xBa);
        var y = new BigInteger(yBa);

        // Return point
        return new ec.PointFp(curve, curve.fromBigInteger(x), curve.fromBigInteger(y));
    };

    ec.PointFp.prototype.add2D = function(b) {
        if (this.isInfinity()) return b;
        if (b.isInfinity()) return this;

        if (this.x.equals(b.x)) {
            if (this.y.equals(b.y)) {
                // this = b, i.e. this must be doubled
                return this.twice();
            }
            // this = -b, i.e. the result is the point at infinity
            return this.curve.getInfinity();
        }

        var x_x = b.x.subtract(this.x);
        var y_y = b.y.subtract(this.y);
        var gamma = y_y.divide(x_x);

        var x3 = gamma.square().subtract(this.x).subtract(b.x);
        var y3 = gamma.multiply(this.x.subtract(x3)).subtract(this.y);

        return new ec.PointFp(this.curve, x3, y3);
    };

    ec.PointFp.prototype.twice2D = function() {
        if (this.isInfinity()) return this;
        if (this.y.toBigInteger().signum() == 0) {
            // if y1 == 0, then (x1, y1) == (x1, -y1)
            // and hence this = -this and thus 2(x1, y1) == infinity
            return this.curve.getInfinity();
        }

        var TWO = this.curve.fromBigInteger(BigInteger.valueOf(2));
        var THREE = this.curve.fromBigInteger(BigInteger.valueOf(3));
        var gamma = this.x.square().multiply(THREE).add(this.curve.a).divide(this.y.multiply(TWO));

        var x3 = gamma.square().subtract(this.x.multiply(TWO));
        var y3 = gamma.multiply(this.x.subtract(x3)).subtract(this.y);

        return new ec.PointFp(this.curve, x3, y3);
    };

    ec.PointFp.prototype.multiply2D = function(k) {
        if (this.isInfinity()) return this;
        if (k.signum() == 0) return this.curve.getInfinity();

        var e = k;
        var h = e.multiply(new BigInteger("3"));

        var neg = this.negate();
        var R = this;

        var i;
        for (i = h.bitLength() - 2; i > 0; --i) {
            R = R.twice();

            var hBit = h.testBit(i);
            var eBit = e.testBit(i);

            if (hBit != eBit) {
                R = R.add2D(hBit ? this : neg);
            }
        }

        return R;
    };

    ec.PointFp.prototype.isOnCurve = function() {
        var x = this.getX().toBigInteger();
        var y = this.getY().toBigInteger();
        var a = this.curve.getA().toBigInteger();
        var b = this.curve.getB().toBigInteger();
        var n = this.curve.getQ();
        var lhs = y.multiply(y).mod(n);
        var rhs = x.multiply(x).multiply(x).add(a.multiply(x)).add(b).mod(n);
        return lhs.equals(rhs);
    };

    ec.PointFp.prototype.toString = function() {
        return '(' + this.getX().toBigInteger().toString() + ',' + this.getY().toBigInteger().toString() +
            ')';
    };

    /**
     * Validate an elliptic curve point.
     *
     * See SEC 1, section 3.2.2.1: Elliptic Curve Public Key Validation Primitive
     */
    ec.PointFp.prototype.validate = function() {
        var n = this.curve.getQ();

        // Check Q != O
        if (this.isInfinity()) {
            throw new Error("Point is at infinity.");
        }

        // Check coordinate bounds
        var x = this.getX().toBigInteger();
        var y = this.getY().toBigInteger();
        if (x.compareTo(BigInteger.ONE) < 0 || x.compareTo(n.subtract(BigInteger.ONE)) > 0) {
            throw new Error('x coordinate out of bounds');
        }
        if (y.compareTo(BigInteger.ONE) < 0 || y.compareTo(n.subtract(BigInteger.ONE)) > 0) {
            throw new Error('y coordinate out of bounds');
        }

        // Check y^2 = x^3 + ax + b (mod n)
        if (!this.isOnCurve()) {
            throw new Error("Point is not on the curve.");
        }

        // Check nQ = 0 (Q is a scalar multiple of G)
        if (this.multiply(n).isInfinity()) {
            // TODO: This check doesn't work - fix.
            throw new Error("Point is not a scalar multiple of G.");
        }

        return true;
    };




    // ----------------
    // ECCurveFp constructor
    ec.CurveFp = function(q, a, b) {
        this.q = q;
        this.a = this.fromBigInteger(a);
        this.b = this.fromBigInteger(b);
        this.infinity = new ec.PointFp(this, null, null);
        this.reducer = new Barrett(this.q);
    }

    ec.CurveFp.prototype.getQ = function() {
        return this.q;
    };

    ec.CurveFp.prototype.getA = function() {
        return this.a;
    };

    ec.CurveFp.prototype.getB = function() {
        return this.b;
    };

    ec.CurveFp.prototype.equals = function(other) {
        if (other == this) return true;
        return (this.q.equals(other.q) && this.a.equals(other.a) && this.b.equals(other.b));
    };

    ec.CurveFp.prototype.getInfinity = function() {
        return this.infinity;
    };

    ec.CurveFp.prototype.fromBigInteger = function(x) {
        return new ec.FieldElementFp(this.q, x);
    };

    ec.CurveFp.prototype.reduce = function(x) {
        this.reducer.reduce(x);
    };

    // for now, work with hex strings because they're easier in JS
    // compressed support added by bitaddress.org
    ec.CurveFp.prototype.decodePointHex = function(s) {
        var firstByte = parseInt(s.substr(0, 2), 16);
        switch (firstByte) { // first byte
            case 0:
                return this.infinity;
            case 2: // compressed
            case 3: // compressed
                var yTilde = firstByte & 1;
                var xHex = s.substr(2, s.length - 2);
                var X1 = new BigInteger(xHex, 16);
                return this.decompressPoint(yTilde, X1);
            case 4: // uncompressed
            case 6: // hybrid
            case 7: // hybrid
                var len = (s.length - 2) / 2;
                var xHex = s.substr(2, len);
                var yHex = s.substr(len + 2, len);

                return new ec.PointFp(this,
                    this.fromBigInteger(new BigInteger(xHex, 16)),
                    this.fromBigInteger(new BigInteger(yHex, 16)));

            default: // unsupported
                return null;
        }
    };

    ec.CurveFp.prototype.encodePointHex = function(p) {
        if (p.isInfinity()) return "00";
        var xHex = p.getX().toBigInteger().toString(16);
        var yHex = p.getY().toBigInteger().toString(16);
        var oLen = this.getQ().toString(16).length;
        if ((oLen % 2) != 0) oLen++;
        while (xHex.length < oLen) {
            xHex = "0" + xHex;
        }
        while (yHex.length < oLen) {
            yHex = "0" + yHex;
        }
        return "04" + xHex + yHex;
    };

    /*
     * Copyright (c) 2000 - 2011 The Legion Of The Bouncy Castle (http://www.bouncycastle.org)
     * Ported to JavaScript by bitaddress.org
     *
     * Number yTilde
     * BigInteger X1
     */
    ec.CurveFp.prototype.decompressPoint = function(yTilde, X1) {
        var x = this.fromBigInteger(X1);
        var alpha = x.multiply(x.square().add(this.getA())).add(this.getB());
        var beta = alpha.sqrt();
        // if we can't find a sqrt we haven't got a point on the curve - run!
        if (beta == null) throw new Error("Invalid point compression");
        var betaValue = beta.toBigInteger();
        var bit0 = betaValue.testBit(0) ? 1 : 0;
        if (bit0 != yTilde) {
            // Use the other root
            beta = this.fromBigInteger(this.getQ().subtract(betaValue));
        }
        return new ec.PointFp(this, x, beta, null, true);
    };


    ec.fromHex = function(s) {
        return new BigInteger(s, 16);
    };

    ec.integerToBytes = function(i, len) {
        var bytes = i.toByteArrayUnsigned();
        if (len < bytes.length) {
            bytes = bytes.slice(bytes.length - len);
        } else
            while (len > bytes.length) {
                bytes.unshift(0);
            }
        return bytes;
    };


    // Named EC curves
    // ----------------
    // X9ECParameters constructor
    ec.X9Parameters = function(curve, g, n, h) {
        this.curve = curve;
        this.g = g;
        this.n = n;
        this.h = h;
    }
    ec.X9Parameters.prototype.getCurve = function() {
        return this.curve;
    };
    ec.X9Parameters.prototype.getG = function() {
        return this.g;
    };
    ec.X9Parameters.prototype.getN = function() {
        return this.n;
    };
    ec.X9Parameters.prototype.getH = function() {
        return this.h;
    };

    // secp256k1 is the Curve used by Bitcoin
    ec.secNamedCurves = {
        // used by Bitcoin
        "secp256k1": function() {
            // p = 2^256 - 2^32 - 2^9 - 2^8 - 2^7 - 2^6 - 2^4 - 1
            var p = ec.fromHex("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F");
            var a = BigInteger.ZERO;
            var b = ec.fromHex("7");
            var n = ec.fromHex("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141");
            var h = BigInteger.ONE;
            var curve = new ec.CurveFp(p, a, b);
            var G = curve.decodePointHex("04" +
                "79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798" +
                "483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8");
            return new ec.X9Parameters(curve, G, n, h);
        }
    };

    // secp256k1 called by Bitcoin's ECKEY
    ec.getSECCurveByName = function(name) {
        if (ec.secNamedCurves[name] == undefined) return null;
        return ec.secNamedCurves[name]();
    }
})(typeof global !== "undefined" ? global : window);

//bitTrx.js
(function(GLOBAL) {

    var bitjs = GLOBAL.bitjs = function() {};

    function ascii_to_hexa(str) {
        var arr1 = [];
        for (var n = 0, l = str.length; n < l; n++) {
            var hex = Number(str.charCodeAt(n)).toString(16);
            arr1.push(hex);
        }
        return arr1.join('');
    }

    /* public vars */
    bitjs.pub = 0x23; // flochange - changed the prefix to FLO Mainnet PublicKey Prefix 0x23
    bitjs.priv = 0xa3; //flochange - changed the prefix to FLO Mainnet Private key prefix 0xa3
    bitjs.compressed = false;

    /* provide a privkey and return an WIF  */
    bitjs.privkey2wif = function(h) {
        var r = Crypto.util.hexToBytes(h);

        if (bitjs.compressed == true) {
            r.push(0x01);
        }

        r.unshift(bitjs.priv);
        var hash = Crypto.SHA256(Crypto.SHA256(r, {
            asBytes: true
        }), {
            asBytes: true
        });
        var checksum = hash.slice(0, 4);

        return B58.encode(r.concat(checksum));
    }

    /* convert a wif key back to a private key */
    bitjs.wif2privkey = function(wif) {
        var compressed = false;
        var decode = B58.decode(wif);
        var key = decode.slice(0, decode.length - 4);
        key = key.slice(1, key.length);
        if (key.length >= 33 && key[key.length - 1] == 0x01) {
            key = key.slice(0, key.length - 1);
            compressed = true;
        }
        return {
            'privkey': Crypto.util.bytesToHex(key),
            'compressed': compressed
        };
    }

    /* convert a wif to a pubkey */
    bitjs.wif2pubkey = function(wif) {
        var compressed = bitjs.compressed;
        var r = bitjs.wif2privkey(wif);
        bitjs.compressed = r['compressed'];
        var pubkey = bitjs.newPubkey(r['privkey']);
        bitjs.compressed = compressed;
        return {
            'pubkey': pubkey,
            'compressed': r['compressed']
        };
    }

    /* convert a wif to a address */
    bitjs.wif2address = function(wif) {
        var r = bitjs.wif2pubkey(wif);
        return {
            'address': bitjs.pubkey2address(r['pubkey']),
            'compressed': r['compressed']
        };
    }

    /* generate a public key from a private key */
    bitjs.newPubkey = function(hash) {
        var privateKeyBigInt = BigInteger.fromByteArrayUnsigned(Crypto.util.hexToBytes(hash));
        var curve = EllipticCurve.getSECCurveByName("secp256k1");

        var curvePt = curve.getG().multiply(privateKeyBigInt);
        var x = curvePt.getX().toBigInteger();
        var y = curvePt.getY().toBigInteger();

        var publicKeyBytes = EllipticCurve.integerToBytes(x, 32);
        publicKeyBytes = publicKeyBytes.concat(EllipticCurve.integerToBytes(y, 32));
        publicKeyBytes.unshift(0x04);

        if (bitjs.compressed == true) {
            var publicKeyBytesCompressed = EllipticCurve.integerToBytes(x, 32)
            if (y.isEven()) {
                publicKeyBytesCompressed.unshift(0x02)
            } else {
                publicKeyBytesCompressed.unshift(0x03)
            }
            return Crypto.util.bytesToHex(publicKeyBytesCompressed);
        } else {
            return Crypto.util.bytesToHex(publicKeyBytes);
        }
    }

    /* provide a public key and return address */
    bitjs.pubkey2address = function(h, byte) {
        var r = ripemd160(Crypto.SHA256(Crypto.util.hexToBytes(h), {
            asBytes: true
        }));
        r.unshift(byte || bitjs.pub);
        var hash = Crypto.SHA256(Crypto.SHA256(r, {
            asBytes: true
        }), {
            asBytes: true
        });
        var checksum = hash.slice(0, 4);
        return B58.encode(r.concat(checksum));
    }

    bitjs.transaction = function() {
        var btrx = {};
        btrx.version = 2; //flochange look at this version
        btrx.inputs = [];
        btrx.outputs = [];
        btrx.locktime = 0;
        btrx.floData = ""; //flochange .. look at this


        btrx.addinput = function(txid, index, scriptPubKey, sequence) {
            var o = {};
            o.outpoint = {
                'hash': txid,
                'index': index
            };
            //o.script = []; Signature and Public Key should be added after singning
            o.script = Crypto.util.hexToBytes(scriptPubKey); //push previous output pubkey script
            o.sequence = sequence || ((btrx.locktime == 0) ? 4294967295 : 0);
            return this.inputs.push(o);
        }

        btrx.addoutput = function(address, value) {
            var o = {};
            var buf = [];
            var addrDecoded = btrx.addressDecode(address);
            o.value = new BigInteger('' + Math.round((value * 1) * 1e8), 10);
            buf.push(118); //OP_DUP
            buf.push(169); //OP_HASH160
            buf.push(addrDecoded.length);
            buf = buf.concat(addrDecoded); // address in bytes
            buf.push(136); //OP_EQUALVERIFY
            buf.push(172); //  OP_CHECKSIG
            o.script = buf;
            return this.outputs.push(o);
        }


        btrx.addflodata = function(txcomments) { // flochange - this whole function needs to be done
            this.floData = txcomments;
            return this.floData; //flochange .. returning the txcomments -- check if the function return will assign
        }


        // Only standard addresses
        btrx.addressDecode = function(address) {
            var bytes = B58.decode(address);
            var front = bytes.slice(0, bytes.length - 4);
            var back = bytes.slice(bytes.length - 4);
            var checksum = Crypto.SHA256(Crypto.SHA256(front, {
                asBytes: true
            }), {
                asBytes: true
            }).slice(0, 4);
            if (checksum + "" == back + "") {
                return front.slice(1);
            }
        }

        /* generate the transaction hash to sign from a transaction input */
        btrx.transactionHash = function(index, sigHashType) {

            var clone = bitjs.clone(this);
            var shType = sigHashType || 1;

            /* black out all other ins, except this one */
            for (var i = 0; i < clone.inputs.length; i++) {
                if (index != i) {
                    clone.inputs[i].script = [];
                }
            }


            if ((clone.inputs) && clone.inputs[index]) {

                /* SIGHASH : For more info on sig hashs see https://en.bitcoin.it/wiki/OP_CHECKSIG
                    and https://bitcoin.org/en/developer-guide#signature-hash-type */

                if (shType == 1) {
                    //SIGHASH_ALL 0x01

                } else if (shType == 2) {
                    //SIGHASH_NONE 0x02
                    clone.outputs = [];
                    for (var i = 0; i < clone.inputs.length; i++) {
                        if (index != i) {
                            clone.inputs[i].sequence = 0;
                        }
                    }

                } else if (shType == 3) {

                    //SIGHASH_SINGLE 0x03
                    clone.outputs.length = index + 1;

                    for (var i = 0; i < index; i++) {
                        clone.outputs[i].value = -1;
                        clone.outputs[i].script = [];
                    }

                    for (var i = 0; i < clone.inputs.length; i++) {
                        if (index != i) {
                            clone.inputs[i].sequence = 0;
                        }
                    }

                } else if (shType >= 128) {
                    //SIGHASH_ANYONECANPAY 0x80
                    clone.inputs = [clone.inputs[index]];

                    if (shType == 129) {
                        // SIGHASH_ALL + SIGHASH_ANYONECANPAY

                    } else if (shType == 130) {
                        // SIGHASH_NONE + SIGHASH_ANYONECANPAY
                        clone.outputs = [];

                    } else if (shType == 131) {
                        // SIGHASH_SINGLE + SIGHASH_ANYONECANPAY
                        clone.outputs.length = index + 1;
                        for (var i = 0; i < index; i++) {
                            clone.outputs[i].value = -1;
                            clone.outputs[i].script = [];
                        }
                    }
                }

                var buffer = Crypto.util.hexToBytes(clone.serialize());
                buffer = buffer.concat(bitjs.numToBytes(parseInt(shType), 4));
                var hash = Crypto.SHA256(buffer, {
                    asBytes: true
                });
                var r = Crypto.util.bytesToHex(Crypto.SHA256(hash, {
                    asBytes: true
                }));
                return r;
            } else {
                return false;
            }
        }

        /* generate a signature from a transaction hash */
        btrx.transactionSig = function(index, wif, sigHashType, txhash) {

            function serializeSig(r, s) {
                var rBa = r.toByteArraySigned();
                var sBa = s.toByteArraySigned();

                var sequence = [];
                sequence.push(0x02); // INTEGER
                sequence.push(rBa.length);
                sequence = sequence.concat(rBa);

                sequence.push(0x02); // INTEGER
                sequence.push(sBa.length);
                sequence = sequence.concat(sBa);

                sequence.unshift(sequence.length);
                sequence.unshift(0x30); // SEQUENCE

                return sequence;
            }

            var shType = sigHashType || 1;
            var hash = txhash || Crypto.util.hexToBytes(this.transactionHash(index, shType));

            if (hash) {
                var curve = EllipticCurve.getSECCurveByName("secp256k1");
                var key = bitjs.wif2privkey(wif);
                var priv = BigInteger.fromByteArrayUnsigned(Crypto.util.hexToBytes(key['privkey']));
                var n = curve.getN();
                var e = BigInteger.fromByteArrayUnsigned(hash);
                var badrs = 0
                do {
                    var k = this.deterministicK(wif, hash, badrs);
                    var G = curve.getG();
                    var Q = G.multiply(k);
                    var r = Q.getX().toBigInteger().mod(n);
                    var s = k.modInverse(n).multiply(e.add(priv.multiply(r))).mod(n);
                    badrs++
                } while (r.compareTo(BigInteger.ZERO) <= 0 || s.compareTo(BigInteger.ZERO) <= 0);

                // Force lower s values per BIP62
                var halfn = n.shiftRight(1);
                if (s.compareTo(halfn) > 0) {
                    s = n.subtract(s);
                };

                var sig = serializeSig(r, s);
                sig.push(parseInt(shType, 10));

                return Crypto.util.bytesToHex(sig);
            } else {
                return false;
            }
        }

        // https://tools.ietf.org/html/rfc6979#section-3.2
        btrx.deterministicK = function(wif, hash, badrs) {
            // if r or s were invalid when this function was used in signing,
            // we do not want to actually compute r, s here for efficiency, so,
            // we can increment badrs. explained at end of RFC 6979 section 3.2

            // wif is b58check encoded wif privkey.
            // hash is byte array of transaction digest.
            // badrs is used only if the k resulted in bad r or s.

            // some necessary things out of the way for clarity.
            badrs = badrs || 0;
            var key = bitjs.wif2privkey(wif);
            var x = Crypto.util.hexToBytes(key['privkey'])
            var curve = EllipticCurve.getSECCurveByName("secp256k1");
            var N = curve.getN();

            // Step: a
            // hash is a byteArray of the message digest. so h1 == hash in our case

            // Step: b
            var v = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                1, 1, 1, 1, 1, 1
            ];

            // Step: c
            var k = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0
            ];

            // Step: d
            k = Crypto.HMAC(Crypto.SHA256, v.concat([0]).concat(x).concat(hash), k, {
                asBytes: true
            });

            // Step: e
            v = Crypto.HMAC(Crypto.SHA256, v, k, {
                asBytes: true
            });

            // Step: f
            k = Crypto.HMAC(Crypto.SHA256, v.concat([1]).concat(x).concat(hash), k, {
                asBytes: true
            });

            // Step: g
            v = Crypto.HMAC(Crypto.SHA256, v, k, {
                asBytes: true
            });

            // Step: h1
            var T = [];

            // Step: h2 (since we know tlen = qlen, just copy v to T.)
            v = Crypto.HMAC(Crypto.SHA256, v, k, {
                asBytes: true
            });
            T = v;

            // Step: h3
            var KBigInt = BigInteger.fromByteArrayUnsigned(T);

            // loop if KBigInt is not in the range of [1, N-1] or if badrs needs incrementing.
            var i = 0
            while (KBigInt.compareTo(N) >= 0 || KBigInt.compareTo(BigInteger.ZERO) <= 0 || i <
                badrs) {
                k = Crypto.HMAC(Crypto.SHA256, v.concat([0]), k, {
                    asBytes: true
                });
                v = Crypto.HMAC(Crypto.SHA256, v, k, {
                    asBytes: true
                });
                v = Crypto.HMAC(Crypto.SHA256, v, k, {
                    asBytes: true
                });
                T = v;
                KBigInt = BigInteger.fromByteArrayUnsigned(T);
                i++
            };

            return KBigInt;
        };

        /* sign a "standard" input */
        btrx.signinput = function(index, wif, sigHashType) {
            var key = bitjs.wif2pubkey(wif);
            var shType = sigHashType || 1;
            var signature = this.transactionSig(index, wif, shType);
            var buf = [];
            var sigBytes = Crypto.util.hexToBytes(signature);
            buf.push(sigBytes.length);
            buf = buf.concat(sigBytes);
            var pubKeyBytes = Crypto.util.hexToBytes(key['pubkey']);
            buf.push(pubKeyBytes.length);
            buf = buf.concat(pubKeyBytes);
            this.inputs[index].script = buf;
            return true;
        }

        /* sign inputs */
        btrx.sign = function(wif, sigHashType) {
            var shType = sigHashType || 1;
            for (var i = 0; i < this.inputs.length; i++) {
                this.signinput(i, wif, shType);
            }
            return this.serialize();
        }


        /* serialize a transaction */
        btrx.serialize = function() {
            var buffer = [];
            buffer = buffer.concat(bitjs.numToBytes(parseInt(this.version), 4));

            buffer = buffer.concat(bitjs.numToVarInt(this.inputs.length));
            for (var i = 0; i < this.inputs.length; i++) {
                var txin = this.inputs[i];
                buffer = buffer.concat(Crypto.util.hexToBytes(txin.outpoint.hash).reverse());
                buffer = buffer.concat(bitjs.numToBytes(parseInt(txin.outpoint.index), 4));
                var scriptBytes = txin.script;
                buffer = buffer.concat(bitjs.numToVarInt(scriptBytes.length));
                buffer = buffer.concat(scriptBytes);
                buffer = buffer.concat(bitjs.numToBytes(parseInt(txin.sequence), 4));

            }
            buffer = buffer.concat(bitjs.numToVarInt(this.outputs.length));

            for (var i = 0; i < this.outputs.length; i++) {
                var txout = this.outputs[i];
                buffer = buffer.concat(bitjs.numToBytes(txout.value, 8));
                var scriptBytes = txout.script;
                buffer = buffer.concat(bitjs.numToVarInt(scriptBytes.length));
                buffer = buffer.concat(scriptBytes);
            }

            buffer = buffer.concat(bitjs.numToBytes(parseInt(this.locktime), 4));
            var flohex = ascii_to_hexa(this.floData);
            var floDataCount = this.floData.length;
            var floDataCountString;
            //flochange -- creating unique data character count logic for floData. This string is prefixed before actual floData string in Raw Transaction
            if (floDataCount < 16) {
                floDataCountString = floDataCount.toString(16);
                floDataCountString = "0" + floDataCountString;
            } else if (floDataCount < 253) {
                floDataCountString = floDataCount.toString(16);
            } else if (floDataCount <= 1040) {
                floDataCountAdjusted = (floDataCount - 253) + parseInt("0xfd00fd");
                floDataCountStringAdjusted = floDataCountAdjusted.toString(16);
                floDataCountString = floDataCountStringAdjusted.substr(0, 2) + floDataCountStringAdjusted.substr(4, 2) + floDataCountStringAdjusted.substr(2, 2);
            } else {
                floDataCountString = "Character Limit Exceeded";
            }


            return Crypto.util.bytesToHex(buffer) + floDataCountString + flohex; // flochange -- Addition of floDataCountString and floData in serialization
        }



        return btrx;

    }

    bitjs.numToBytes = function(num, bytes) {
        if (typeof bytes === "undefined") bytes = 8;
        if (bytes == 0) {
            return [];
        } else if (num == -1) {
            return Crypto.util.hexToBytes("ffffffffffffffff");
        } else {
            return [num % 256].concat(bitjs.numToBytes(Math.floor(num / 256), bytes - 1));
        }
    }

    bitjs.numToByteArray = function(num) {
        if (num <= 256) {
            return [num];
        } else {
            return [num % 256].concat(bitjs.numToByteArray(Math.floor(num / 256)));
        }
    }

    bitjs.numToVarInt = function(num) {
        if (num < 253) {
            return [num];
        } else if (num < 65536) {
            return [253].concat(bitjs.numToBytes(num, 2));
        } else if (num < 4294967296) {
            return [254].concat(bitjs.numToBytes(num, 4));
        } else {
            return [255].concat(bitjs.numToBytes(num, 8));
        }
    }

    bitjs.bytesToNum = function(bytes) {
        if (bytes.length == 0) return 0;
        else return bytes[0] + 256 * bitjs.bytesToNum(bytes.slice(1));
    }

    /* clone an object */
    bitjs.clone = function(obj) {
        if (obj == null || typeof(obj) != 'object') return obj;
        var temp = new obj.constructor();

        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                temp[key] = bitjs.clone(obj[key]);
            }
        }
        return temp;
    }

    var B58 = bitjs.Base58 = {
        alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
        validRegex: /^[1-9A-HJ-NP-Za-km-z]+$/,
        base: BigInteger.valueOf(58),

        /**
         * Convert a byte array to a base58-encoded string.
         *
         * Written by Mike Hearn for BitcoinJ.
         *   Copyright (c) 2011 Google Inc.
         *
         * Ported to JavaScript by Stefan Thomas.
         */
        encode: function(input) {
            var bi = BigInteger.fromByteArrayUnsigned(input);
            var chars = [];

            while (bi.compareTo(B58.base) >= 0) {
                var mod = bi.mod(B58.base);
                chars.unshift(B58.alphabet[mod.intValue()]);
                bi = bi.subtract(mod).divide(B58.base);
            }
            chars.unshift(B58.alphabet[bi.intValue()]);

            // Convert leading zeros too.
            for (var i = 0; i < input.length; i++) {
                if (input[i] == 0x00) {
                    chars.unshift(B58.alphabet[0]);
                } else break;
            }

            return chars.join('');
        },

        /**
         * Convert a base58-encoded string to a byte array.
         *
         * Written by Mike Hearn for BitcoinJ.
         *   Copyright (c) 2011 Google Inc.
         *
         * Ported to JavaScript by Stefan Thomas.
         */
        decode: function(input) {
            var bi = BigInteger.valueOf(0);
            var leadingZerosNum = 0;
            for (var i = input.length - 1; i >= 0; i--) {
                var alphaIndex = B58.alphabet.indexOf(input[i]);
                if (alphaIndex < 0) {
                    throw "Invalid character";
                }
                bi = bi.add(BigInteger.valueOf(alphaIndex)
                    .multiply(B58.base.pow(input.length - 1 - i)));

                // This counts leading zero bytes
                if (input[i] == "1") leadingZerosNum++;
                else leadingZerosNum = 0;
            }
            var bytes = bi.toByteArrayUnsigned();

            // Add leading zeros
            while (leadingZerosNum-- > 0) bytes.unshift(0);

            return bytes;
        }
    }
    return bitjs;

})(typeof global !== "undefined" ? global : window);

//Bitcoin.js
(function(GLOBAL) {
    /*
        Copyright (c) 2011 Stefan Thomas
    
        Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
    
        The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
    
        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
    */
    var Bitcoin = GLOBAL.Bitcoin = {};

    //https://raw.github.com/bitcoinjs/bitcoinjs-lib/c952aaeb3ee472e3776655b8ea07299ebed702c7/src/base58.js
    var B58 = Bitcoin.Base58 = {
        alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
        validRegex: /^[1-9A-HJ-NP-Za-km-z]+$/,
        base: BigInteger.valueOf(58),

        /**
         * Convert a byte array to a base58-encoded string.
         *
         * Written by Mike Hearn for BitcoinJ.
         *   Copyright (c) 2011 Google Inc.
         *
         * Ported to JavaScript by Stefan Thomas.
         */
        encode: function(input) {
            var bi = BigInteger.fromByteArrayUnsigned(input);
            var chars = [];

            while (bi.compareTo(B58.base) >= 0) {
                var mod = bi.mod(B58.base);
                chars.unshift(B58.alphabet[mod.intValue()]);
                bi = bi.subtract(mod).divide(B58.base);
            }
            chars.unshift(B58.alphabet[bi.intValue()]);

            // Convert leading zeros too.
            for (var i = 0; i < input.length; i++) {
                if (input[i] == 0x00) {
                    chars.unshift(B58.alphabet[0]);
                } else break;
            }

            return chars.join('');
        },

        /**
         * Convert a base58-encoded string to a byte array.
         *
         * Written by Mike Hearn for BitcoinJ.
         *   Copyright (c) 2011 Google Inc.
         *
         * Ported to JavaScript by Stefan Thomas.
         */
        decode: function(input) {
            var bi = BigInteger.valueOf(0);
            var leadingZerosNum = 0;
            for (var i = input.length - 1; i >= 0; i--) {
                var alphaIndex = B58.alphabet.indexOf(input[i]);
                if (alphaIndex < 0) {
                    throw "Invalid character";
                }
                bi = bi.add(BigInteger.valueOf(alphaIndex)
                    .multiply(B58.base.pow(input.length - 1 - i)));

                // This counts leading zero bytes
                if (input[i] == "1") leadingZerosNum++;
                else leadingZerosNum = 0;
            }
            var bytes = bi.toByteArrayUnsigned();

            // Add leading zeros
            while (leadingZerosNum-- > 0) bytes.unshift(0);

            return bytes;
        }
    };

    //https://raw.github.com/bitcoinjs/bitcoinjs-lib/09e8c6e184d6501a0c2c59d73ca64db5c0d3eb95/src/address.js
    Bitcoin.Address = function(bytes) {
        if (GLOBAL.cryptocoin == "FLO")
            this.version = 0x23; // FLO mainnet public address
        else if (GLOBAL.cryptocoin == "FLO_TEST")
            this.version = 0x73; // FLO testnet public address
        if ("string" == typeof bytes) {
            bytes = Bitcoin.Address.decodeString(bytes, this.version);
        }
        this.hash = bytes;
    };

    Bitcoin.Address.networkVersion = 0x23; // (FLO mainnet 0x23, 35D), (Bitcoin Mainnet, 0x00, 0D) // *this has no effect *

    /**
     * Serialize this object as a standard Bitcoin address.
     *
     * Returns the address as a base58-encoded string in the standardized format.
     */
    Bitcoin.Address.prototype.toString = function() {
        // Get a copy of the hash
        var hash = this.hash.slice(0);

        // Version
        hash.unshift(this.version);
        var checksum = Crypto.SHA256(Crypto.SHA256(hash, {
            asBytes: true
        }), {
            asBytes: true
        });
        var bytes = hash.concat(checksum.slice(0, 4));
        return Bitcoin.Base58.encode(bytes);
    };

    Bitcoin.Address.prototype.getHashBase64 = function() {
        return Crypto.util.bytesToBase64(this.hash);
    };

    /**
     * Parse a Bitcoin address contained in a string.
     */
    Bitcoin.Address.decodeString = function(string, version) {
        var bytes = Bitcoin.Base58.decode(string);
        var hash = bytes.slice(0, 21);
        var checksum = Crypto.SHA256(Crypto.SHA256(hash, {
            asBytes: true
        }), {
            asBytes: true
        });

        if (checksum[0] != bytes[21] ||
            checksum[1] != bytes[22] ||
            checksum[2] != bytes[23] ||
            checksum[3] != bytes[24]) {
            throw "Checksum validation failed!";
        }

        if (version != hash.shift()) {
            throw "Version " + hash.shift() + " not supported!";
        }

        return hash;
    };
    //https://raw.github.com/bitcoinjs/bitcoinjs-lib/e90780d3d3b8fc0d027d2bcb38b80479902f223e/src/ecdsa.js
    Bitcoin.ECDSA = (function() {
        var ecparams = EllipticCurve.getSECCurveByName("secp256k1");
        var rng = new SecureRandom();

        var P_OVER_FOUR = null;

        function implShamirsTrick(P, k, Q, l) {
            var m = Math.max(k.bitLength(), l.bitLength());
            var Z = P.add2D(Q);
            var R = P.curve.getInfinity();

            for (var i = m - 1; i >= 0; --i) {
                R = R.twice2D();

                R.z = BigInteger.ONE;

                if (k.testBit(i)) {
                    if (l.testBit(i)) {
                        R = R.add2D(Z);
                    } else {
                        R = R.add2D(P);
                    }
                } else {
                    if (l.testBit(i)) {
                        R = R.add2D(Q);
                    }
                }
            }

            return R;
        };

        var ECDSA = {
            getBigRandom: function(limit) {
                return new BigInteger(limit.bitLength(), rng)
                    .mod(limit.subtract(BigInteger.ONE))
                    .add(BigInteger.ONE);
            },
            sign: function(hash, priv) {
                var d = priv;
                var n = ecparams.getN();
                var e = BigInteger.fromByteArrayUnsigned(hash);

                do {
                    var k = ECDSA.getBigRandom(n);
                    var G = ecparams.getG();
                    var Q = G.multiply(k);
                    var r = Q.getX().toBigInteger().mod(n);
                } while (r.compareTo(BigInteger.ZERO) <= 0);

                var s = k.modInverse(n).multiply(e.add(d.multiply(r))).mod(n);

                return ECDSA.serializeSig(r, s);
            },

            verify: function(hash, sig, pubkey) {
                var r, s;
                if (Bitcoin.Util.isArray(sig)) {
                    var obj = ECDSA.parseSig(sig);
                    r = obj.r;
                    s = obj.s;
                } else if ("object" === typeof sig && sig.r && sig.s) {
                    r = sig.r;
                    s = sig.s;
                } else {
                    throw "Invalid value for signature";
                }

                var Q;
                if (pubkey instanceof ec.PointFp) {
                    Q = pubkey;
                } else if (Bitcoin.Util.isArray(pubkey)) {
                    Q = EllipticCurve.PointFp.decodeFrom(ecparams.getCurve(), pubkey);
                } else {
                    throw "Invalid format for pubkey value, must be byte array or ec.PointFp";
                }
                var e = BigInteger.fromByteArrayUnsigned(hash);

                return ECDSA.verifyRaw(e, r, s, Q);
            },

            verifyRaw: function(e, r, s, Q) {
                var n = ecparams.getN();
                var G = ecparams.getG();

                if (r.compareTo(BigInteger.ONE) < 0 ||
                    r.compareTo(n) >= 0)
                    return false;

                if (s.compareTo(BigInteger.ONE) < 0 ||
                    s.compareTo(n) >= 0)
                    return false;

                var c = s.modInverse(n);

                var u1 = e.multiply(c).mod(n);
                var u2 = r.multiply(c).mod(n);

                // TODO(!!!): For some reason Shamir's trick isn't working with
                // signed message verification!? Probably an implementation
                // error!
                //var point = implShamirsTrick(G, u1, Q, u2);
                var point = G.multiply(u1).add(Q.multiply(u2));

                var v = point.getX().toBigInteger().mod(n);

                return v.equals(r);
            },

            /**
             * Serialize a signature into DER format.
             *
             * Takes two BigIntegers representing r and s and returns a byte array.
             */
            serializeSig: function(r, s) {
                var rBa = r.toByteArraySigned();
                var sBa = s.toByteArraySigned();

                var sequence = [];
                sequence.push(0x02); // INTEGER
                sequence.push(rBa.length);
                sequence = sequence.concat(rBa);

                sequence.push(0x02); // INTEGER
                sequence.push(sBa.length);
                sequence = sequence.concat(sBa);

                sequence.unshift(sequence.length);
                sequence.unshift(0x30); // SEQUENCE

                return sequence;
            },

            /**
             * Parses a byte array containing a DER-encoded signature.
             *
             * This function will return an object of the form:
             *
             * {
             *   r: BigInteger,
             *   s: BigInteger
             * }
             */
            parseSig: function(sig) {
                var cursor;
                if (sig[0] != 0x30)
                    throw new Error("Signature not a valid DERSequence");

                cursor = 2;
                if (sig[cursor] != 0x02)
                    throw new Error("First element in signature must be a DERInteger");;
                var rBa = sig.slice(cursor + 2, cursor + 2 + sig[cursor + 1]);

                cursor += 2 + sig[cursor + 1];
                if (sig[cursor] != 0x02)
                    throw new Error("Second element in signature must be a DERInteger");
                var sBa = sig.slice(cursor + 2, cursor + 2 + sig[cursor + 1]);

                cursor += 2 + sig[cursor + 1];

                //if (cursor != sig.length)
                //  throw new Error("Extra bytes in signature");

                var r = BigInteger.fromByteArrayUnsigned(rBa);
                var s = BigInteger.fromByteArrayUnsigned(sBa);

                return {
                    r: r,
                    s: s
                };
            },

            parseSigCompact: function(sig) {
                if (sig.length !== 65) {
                    throw "Signature has the wrong length";
                }

                // Signature is prefixed with a type byte storing three bits of
                // information.
                var i = sig[0] - 27;
                if (i < 0 || i > 7) {
                    throw "Invalid signature type";
                }

                var n = ecparams.getN();
                var r = BigInteger.fromByteArrayUnsigned(sig.slice(1, 33)).mod(n);
                var s = BigInteger.fromByteArrayUnsigned(sig.slice(33, 65)).mod(n);

                return {
                    r: r,
                    s: s,
                    i: i
                };
            },

            /**
             * Recover a public key from a signature.
             *
             * See SEC 1: Elliptic Curve Cryptography, section 4.1.6, "Public
             * Key Recovery Operation".
             *
             * http://www.secg.org/download/aid-780/sec1-v2.pdf
             */
            recoverPubKey: function(r, s, hash, i) {
                // The recovery parameter i has two bits.
                i = i & 3;

                // The less significant bit specifies whether the y coordinate
                // of the compressed point is even or not.
                var isYEven = i & 1;

                // The more significant bit specifies whether we should use the
                // first or second candidate key.
                var isSecondKey = i >> 1;

                var n = ecparams.getN();
                var G = ecparams.getG();
                var curve = ecparams.getCurve();
                var p = curve.getQ();
                var a = curve.getA().toBigInteger();
                var b = curve.getB().toBigInteger();

                // We precalculate (p + 1) / 4 where p is if the field order
                if (!P_OVER_FOUR) {
                    P_OVER_FOUR = p.add(BigInteger.ONE).divide(BigInteger.valueOf(4));
                }

                // 1.1 Compute x
                var x = isSecondKey ? r.add(n) : r;

                // 1.3 Convert x to point
                var alpha = x.multiply(x).multiply(x).add(a.multiply(x)).add(b).mod(p);
                var beta = alpha.modPow(P_OVER_FOUR, p);

                var xorOdd = beta.isEven() ? (i % 2) : ((i + 1) % 2);
                // If beta is even, but y isn't or vice versa, then convert it,
                // otherwise we're done and y == beta.
                var y = (beta.isEven() ? !isYEven : isYEven) ? beta : p.subtract(beta);

                // 1.4 Check that nR is at infinity
                var R = new EllipticCurve.PointFp(curve,
                    curve.fromBigInteger(x),
                    curve.fromBigInteger(y));
                R.validate();

                // 1.5 Compute e from M
                var e = BigInteger.fromByteArrayUnsigned(hash);
                var eNeg = BigInteger.ZERO.subtract(e).mod(n);

                // 1.6 Compute Q = r^-1 (sR - eG)
                var rInv = r.modInverse(n);
                var Q = implShamirsTrick(R, s, G, eNeg).multiply(rInv);

                Q.validate();
                if (!ECDSA.verifyRaw(e, r, s, Q)) {
                    throw "Pubkey recovery unsuccessful";
                }

                var pubKey = new Bitcoin.ECKey();
                pubKey.pub = Q;
                return pubKey;
            },

            /**
             * Calculate pubkey extraction parameter.
             *
             * When extracting a pubkey from a signature, we have to
             * distinguish four different cases. Rather than putting this
             * burden on the verifier, Bitcoin includes a 2-bit value with the
             * signature.
             *
             * This function simply tries all four cases and returns the value
             * that resulted in a successful pubkey recovery.
             */
            calcPubkeyRecoveryParam: function(address, r, s, hash) {
                for (var i = 0; i < 4; i++) {
                    try {
                        var pubkey = Bitcoin.ECDSA.recoverPubKey(r, s, hash, i);
                        if (pubkey.getBitcoinAddress().toString() == address) {
                            return i;
                        }
                    } catch (e) {}
                }
                throw "Unable to find valid recovery factor";
            }
        };

        return ECDSA;
    })();
    Bitcoin.KeyPool = (function() {
        var KeyPool = function() {
            this.keyArray = [];

            this.push = function(item) {
                if (item == null || item.priv == null) return;
                var doAdd = true;
                // prevent duplicates from being added to the array
                for (var index in this.keyArray) {
                    var currentItem = this.keyArray[index];
                    if (currentItem != null && currentItem.priv != null && item.getBitcoinAddress() == currentItem.getBitcoinAddress()) {
                        doAdd = false;
                        break;
                    }
                }
                if (doAdd) this.keyArray.push(item);
            };

            this.reset = function() {
                this.keyArray = [];
            };

            this.getArray = function() {
                // copy array
                return this.keyArray.slice(0);
            };

            this.setArray = function(ka) {
                this.keyArray = ka;
            };

            this.length = function() {
                return this.keyArray.length;
            };

            this.toString = function() {
                var keyPoolString = "# = " + this.length() + "\n";
                var pool = this.getArray();
                for (var index in pool) {
                    var item = pool[index];
                    if (Bitcoin.Util.hasMethods(item, 'getBitcoinAddress', 'toString')) {
                        if (item != null) {
                            keyPoolString += "\"" + item.getBitcoinAddress() + "\"" + ", \"" + item.toString("wif") + "\"\n";
                        }
                    }
                }

                return keyPoolString;
            };

            return this;
        };

        return new KeyPool();
    })();

    Bitcoin.Bip38Key = (function() {
        var Bip38 = function(address, encryptedKey) {
            this.address = address;
            this.priv = encryptedKey;
        };

        Bip38.prototype.getBitcoinAddress = function() {
            return this.address;
        };

        Bip38.prototype.toString = function() {
            return this.priv;
        };

        return Bip38;
    })();

    //https://raw.github.com/pointbiz/bitcoinjs-lib/9b2f94a028a7bc9bed94e0722563e9ff1d8e8db8/src/eckey.js
    Bitcoin.ECKey = (function() {
        var ECDSA = Bitcoin.ECDSA;
        var KeyPool = Bitcoin.KeyPool;
        var ecparams = EllipticCurve.getSECCurveByName("secp256k1");

        var ECKey = function(input) {
            if (!input) {
                // Generate new key
                var n = ecparams.getN();
                this.priv = ECDSA.getBigRandom(n);
            } else if (input instanceof BigInteger) {
                // Input is a private key value
                this.priv = input;
            } else if (Bitcoin.Util.isArray(input)) {
                // Prepend zero byte to prevent interpretation as negative integer
                this.priv = BigInteger.fromByteArrayUnsigned(input);
            } else if ("string" == typeof input) {
                var bytes = null;
                try {

                    // This part is edited for FLO. FLO WIF are always compressed WIF. FLO WIF (private key) starts with R for mainnet and c for testnet.
                    if (((GLOBAL.cryptocoin == "FLO") && /^R[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{51}$/.test(input)) ||
                        ((GLOBAL.cryptocoin == "FLO_TEST") && /^c[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{51}$/.test(input))) {
                        bytes = ECKey.decodeCompressedWalletImportFormat(input);
                        this.compressed = true;
                    } else if (ECKey.isHexFormat(input)) {
                        bytes = Crypto.util.hexToBytes(input);
                    }


                    /*
                        if (ECKey.isWalletImportFormat(input)) {
                            bytes = ECKey.decodeWalletImportFormat(input);
                        } else if (ECKey.isCompressedWalletImportFormat(input)) {
                            bytes = ECKey.decodeCompressedWalletImportFormat(input);
                            this.compressed = true;
                        } else if (ECKey.isMiniFormat(input)) {
                            bytes = Crypto.SHA256(input, { asBytes: true });
                        } else if (ECKey.isHexFormat(input)) {
                            bytes = Crypto.util.hexToBytes(input);
                        } else if (ECKey.isBase64Format(input)) {
                            bytes = Crypto.util.base64ToBytes(input);
                        }
                        */
                } catch (exc1) {
                    this.setError(exc1);
                }

                if (ECKey.isBase6Format(input)) {
                    this.priv = new BigInteger(input, 6);
                } else if (bytes == null || bytes.length != 32) {
                    this.priv = null;
                } else {
                    // Prepend zero byte to prevent interpretation as negative integer
                    this.priv = BigInteger.fromByteArrayUnsigned(bytes);
                }
            }

            this.compressed = (this.compressed == undefined) ? !!ECKey.compressByDefault : this.compressed;
            try {
                // check not zero
                if (this.priv != null && BigInteger.ZERO.compareTo(this.priv) == 0) this.setError("Error: BigInteger equal to zero.");
                // valid range [0x1, 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364140])
                var hexKeyRangeLimit = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364140";
                var rangeLimitBytes = Crypto.util.hexToBytes(hexKeyRangeLimit);
                var limitBigInt = BigInteger.fromByteArrayUnsigned(rangeLimitBytes);
                if (this.priv != null && limitBigInt.compareTo(this.priv) < 0) this.setError("Error: BigInteger outside of curve range.")

                if (this.priv != null) {
                    KeyPool.push(this);
                }
            } catch (exc2) {
                this.setError(exc2);
            }
        };

        if (GLOBAL.cryptocoin == "FLO")
            ECKey.privateKeyPrefix = 0xA3; //(Bitcoin mainnet 0x80    testnet 0xEF) (FLO mainnet 0xA3 163 D)
        else if (GLOBAL.cryptocoin == "FLO_TEST")
            ECKey.privateKeyPrefix = 0xEF; //FLO testnet

        /**
         * Whether public keys should be returned compressed by default.
         */
        ECKey.compressByDefault = false;

        /**
         * Set whether the public key should be returned compressed or not.
         */
        ECKey.prototype.setError = function(err) {
            this.error = err;
            this.priv = null;
            return this;
        };

        /**
         * Set whether the public key should be returned compressed or not.
         */
        ECKey.prototype.setCompressed = function(v) {
            this.compressed = !!v;
            if (this.pubPoint) this.pubPoint.compressed = this.compressed;
            return this;
        };

        /*
         * Return public key as a byte array in DER encoding
         */
        ECKey.prototype.getPub = function() {
            if (this.compressed) {
                if (this.pubComp) return this.pubComp;
                return this.pubComp = this.getPubPoint().getEncoded(1);
            } else {
                if (this.pubUncomp) return this.pubUncomp;
                return this.pubUncomp = this.getPubPoint().getEncoded(0);
            }
        };

        /**
         * Return public point as ECPoint object.
         */
        ECKey.prototype.getPubPoint = function() {
            if (!this.pubPoint) {
                this.pubPoint = ecparams.getG().multiply(this.priv);
                this.pubPoint.compressed = this.compressed;
            }
            return this.pubPoint;
        };

        ECKey.prototype.getPubKeyHex = function() {
            if (this.compressed) {
                if (this.pubKeyHexComp) return this.pubKeyHexComp;
                return this.pubKeyHexComp = Crypto.util.bytesToHex(this.getPub()).toString().toUpperCase();
            } else {
                if (this.pubKeyHexUncomp) return this.pubKeyHexUncomp;
                return this.pubKeyHexUncomp = Crypto.util.bytesToHex(this.getPub()).toString().toUpperCase();
            }
        };

        /**
         * Get the pubKeyHash for this key.
         *
         * This is calculated as RIPE160(SHA256([encoded pubkey])) and returned as
         * a byte array.
         */
        ECKey.prototype.getPubKeyHash = function() {
            if (this.compressed) {
                if (this.pubKeyHashComp) return this.pubKeyHashComp;
                return this.pubKeyHashComp = Bitcoin.Util.sha256ripe160(this.getPub());
            } else {
                if (this.pubKeyHashUncomp) return this.pubKeyHashUncomp;
                return this.pubKeyHashUncomp = Bitcoin.Util.sha256ripe160(this.getPub());
            }
        };

        ECKey.prototype.getBitcoinAddress = function() {
            var hash = this.getPubKeyHash();
            var addr = new Bitcoin.Address(hash);
            return addr.toString();
        };

        /*
         * Takes a public point as a hex string or byte array
         */
        ECKey.prototype.setPub = function(pub) {
            // byte array
            if (Bitcoin.Util.isArray(pub)) {
                pub = Crypto.util.bytesToHex(pub).toString().toUpperCase();
            }
            var ecPoint = ecparams.getCurve().decodePointHex(pub);
            this.setCompressed(ecPoint.compressed);
            this.pubPoint = ecPoint;
            return this;
        };

        // Sipa Private Key Wallet Import Format
        ECKey.prototype.getBitcoinWalletImportFormat = function() {
            var bytes = this.getBitcoinPrivateKeyByteArray();
            if (bytes == null) return "";
            bytes.unshift(ECKey.privateKeyPrefix); // prepend 0x80 byte
            if (this.compressed) bytes.push(0x01); // append 0x01 byte for compressed format
            var checksum = Crypto.SHA256(Crypto.SHA256(bytes, {
                asBytes: true
            }), {
                asBytes: true
            });
            bytes = bytes.concat(checksum.slice(0, 4));
            var privWif = Bitcoin.Base58.encode(bytes);
            return privWif;
        };

        // Private Key Hex Format
        ECKey.prototype.getBitcoinHexFormat = function() {
            return Crypto.util.bytesToHex(this.getBitcoinPrivateKeyByteArray()).toString().toUpperCase();
        };

        // Private Key Base64 Format
        ECKey.prototype.getBitcoinBase64Format = function() {
            return Crypto.util.bytesToBase64(this.getBitcoinPrivateKeyByteArray());
        };

        ECKey.prototype.getBitcoinPrivateKeyByteArray = function() {
            if (this.priv == null) return null;
            // Get a copy of private key as a byte array
            var bytes = this.priv.toByteArrayUnsigned();
            // zero pad if private key is less than 32 bytes
            while (bytes.length < 32) bytes.unshift(0x00);
            return bytes;
        };

        ECKey.prototype.toString = function(format) {
            format = format || "";
            if (format.toString().toLowerCase() == "base64" || format.toString().toLowerCase() == "b64") {
                return this.getBitcoinBase64Format();
            }
            // Wallet Import Format
            else if (format.toString().toLowerCase() == "wif") {
                return this.getBitcoinWalletImportFormat();
            } else {
                return this.getBitcoinHexFormat();
            }
        };

        ECKey.prototype.sign = function(hash) {
            return ECDSA.sign(hash, this.priv);
        };

        ECKey.prototype.verify = function(hash, sig) {
            return ECDSA.verify(hash, sig, this.getPub());
        };

        /**
         * Parse a wallet import format private key contained in a string.
         */
        ECKey.decodeWalletImportFormat = function(privStr) {
            var bytes = Bitcoin.Base58.decode(privStr);
            var hash = bytes.slice(0, 33);
            var checksum = Crypto.SHA256(Crypto.SHA256(hash, {
                asBytes: true
            }), {
                asBytes: true
            });
            if (checksum[0] != bytes[33] ||
                checksum[1] != bytes[34] ||
                checksum[2] != bytes[35] ||
                checksum[3] != bytes[36]) {
                throw "Checksum validation failed!";

            }
            var version = hash.shift();
            if (version != ECKey.privateKeyPrefix) {
                throw "Version " + version + " not supported!";
            }
            return hash;
        };

        /**
         * Parse a compressed wallet import format private key contained in a string.
         */
        ECKey.decodeCompressedWalletImportFormat = function(privStr) {
            var bytes = Bitcoin.Base58.decode(privStr);
            var hash = bytes.slice(0, 34);
            var checksum = Crypto.SHA256(Crypto.SHA256(hash, {
                asBytes: true
            }), {
                asBytes: true
            });
            if (checksum[0] != bytes[34] ||
                checksum[1] != bytes[35] ||
                checksum[2] != bytes[36] ||
                checksum[3] != bytes[37]) {
                throw "Checksum validation failed!";
            }
            var version = hash.shift();
            if (version != ECKey.privateKeyPrefix) {
                throw "Version " + version + " not supported!";
            }
            hash.pop();
            return hash;
        };

        // 64 characters [0-9A-F]
        ECKey.isHexFormat = function(key) {
            key = key.toString();
            return /^[A-Fa-f0-9]{64}$/.test(key);
        };

        // 51 characters base58, always starts with a '5'
        ECKey.isWalletImportFormat = function(key) {
            key = key.toString();
            return (ECKey.privateKeyPrefix == 0x80) ?
                (/^5[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{50}$/.test(key)) :
                (/^R[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{50}$/.test(key));
        };

        // 52 characters base58
        ECKey.isCompressedWalletImportFormat = function(key) {
            key = key.toString();
            return (ECKey.privateKeyPrefix == 0x80) ?
                (/^[LK][123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{51}$/.test(key)) :
                (/^R[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{51}$/.test(key));
        };

        // 44 characters
        ECKey.isBase64Format = function(key) {
            key = key.toString();
            return (/^[ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789=+\/]{44}$/.test(key));
        };

        // 99 characters, 1=1, if using dice convert 6 to 0
        ECKey.isBase6Format = function(key) {
            key = key.toString();
            return (/^[012345]{99}$/.test(key));
        };

        // 22, 26 or 30 characters, always starts with an 'S'
        ECKey.isMiniFormat = function(key) {
            key = key.toString();
            var validChars22 = /^S[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{21}$/.test(key);
            var validChars26 = /^S[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{25}$/.test(key);
            var validChars30 = /^S[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{29}$/.test(key);
            var testBytes = Crypto.SHA256(key + "?", {
                asBytes: true
            });

            return ((testBytes[0] === 0x00 || testBytes[0] === 0x01) && (validChars22 || validChars26 || validChars30));
        };

        return ECKey;
    })();
    //https://raw.github.com/bitcoinjs/bitcoinjs-lib/09e8c6e184d6501a0c2c59d73ca64db5c0d3eb95/src/util.js
    // Bitcoin utility functions
    Bitcoin.Util = {
        /**
         * Cross-browser compatibility version of Array.isArray.
         */
        isArray: Array.isArray || function(o) {
            return Object.prototype.toString.call(o) === '[object Array]';
        },
        /**
         * Create an array of a certain length filled with a specific value.
         */
        makeFilledArray: function(len, val) {
            var array = [];
            var i = 0;
            while (i < len) {
                array[i++] = val;
            }
            return array;
        },
        /**
         * Turn an integer into a "var_int".
         *
         * "var_int" is a variable length integer used by Bitcoin's binary format.
         *
         * Returns a byte array.
         */
        numToVarInt: function(i) {
            if (i < 0xfd) {
                // unsigned char
                return [i];
            } else if (i <= 1 << 16) {
                // unsigned short (LE)
                return [0xfd, i >>> 8, i & 255];
            } else if (i <= 1 << 32) {
                // unsigned int (LE)
                return [0xfe].concat(Crypto.util.wordsToBytes([i]));
            } else {
                // unsigned long long (LE)
                return [0xff].concat(Crypto.util.wordsToBytes([i >>> 32, i]));
            }
        },
        /**
         * Parse a Bitcoin value byte array, returning a BigInteger.
         */
        valueToBigInt: function(valueBuffer) {
            if (valueBuffer instanceof BigInteger) return valueBuffer;

            // Prepend zero byte to prevent interpretation as negative integer
            return BigInteger.fromByteArrayUnsigned(valueBuffer);
        },
        /**
         * Format a Bitcoin value as a string.
         *
         * Takes a BigInteger or byte-array and returns that amount of Bitcoins in a
         * nice standard formatting.
         *
         * Examples:
         * 12.3555
         * 0.1234
         * 900.99998888
         * 34.00
         */
        formatValue: function(valueBuffer) {
            var value = this.valueToBigInt(valueBuffer).toString();
            var integerPart = value.length > 8 ? value.substr(0, value.length - 8) : '0';
            var decimalPart = value.length > 8 ? value.substr(value.length - 8) : value;
            while (decimalPart.length < 8) decimalPart = "0" + decimalPart;
            decimalPart = decimalPart.replace(/0*$/, '');
            while (decimalPart.length < 2) decimalPart += "0";
            return integerPart + "." + decimalPart;
        },
        /**
         * Parse a floating point string as a Bitcoin value.
         *
         * Keep in mind that parsing user input is messy. You should always display
         * the parsed value back to the user to make sure we understood his input
         * correctly.
         */
        parseValue: function(valueString) {
            // TODO: Detect other number formats (e.g. comma as decimal separator)
            var valueComp = valueString.split('.');
            var integralPart = valueComp[0];
            var fractionalPart = valueComp[1] || "0";
            while (fractionalPart.length < 8) fractionalPart += "0";
            fractionalPart = fractionalPart.replace(/^0+/g, '');
            var value = BigInteger.valueOf(parseInt(integralPart));
            value = value.multiply(BigInteger.valueOf(100000000));
            value = value.add(BigInteger.valueOf(parseInt(fractionalPart)));
            return value;
        },
        /**
         * Calculate RIPEMD160(SHA256(data)).
         *
         * Takes an arbitrary byte array as inputs and returns the hash as a byte
         * array.
         */
        sha256ripe160: function(data) {
            return ripemd160(Crypto.SHA256(data, {
                asBytes: true
            }), {
                asBytes: true
            });
        },
        // double sha256
        dsha256: function(data) {
            return Crypto.SHA256(Crypto.SHA256(data, {
                asBytes: true
            }), {
                asBytes: true
            });
        },
        // duck typing method
        hasMethods: function(obj /*, method list as strings */ ) {
            var i = 1,
                methodName;
            while ((methodName = arguments[i++])) {
                if (typeof obj[methodName] != 'function') {
                    return false;
                }
            }
            return true;
        }
    };
})(typeof global !== "undefined" ? global : window);

//ellipticCurveEncryption.js
(function(GLOBAL) {
    (function(ellipticCurveType) {

        //Defining Elliptic Encryption Object  
        var ellipticEncryption = GLOBAL.ellipticCurveEncryption = function() {};

        ellipticEncryption.rng = new SecureRandom();

        ellipticEncryption.getCurveParameters = function(curveName) {

            //Default is secp256k1
            curveName = typeof curveName !== 'undefined' ? curveName : "secp256k1";

            var c = EllipticCurve.getSECCurveByName(curveName);
            var curveDetails = {
                Q: "",
                A: "",
                B: "",
                GX: "",
                GY: "",
                N: ""
            };

            curveDetails.Q = c.getCurve().getQ().toString();
            curveDetails.A = c.getCurve().getA().toBigInteger().toString();
            curveDetails.B = c.getCurve().getB().toBigInteger().toString();
            curveDetails.GX = c.getG().getX().toBigInteger().toString();
            curveDetails.GY = c.getG().getY().toBigInteger().toString();
            curveDetails.N = c.getN().toString();

            return curveDetails;

        }

        ellipticEncryption.selectedCurve = ellipticEncryption.getCurveParameters(ellipticCurveType);

        ellipticEncryption.get_curve = function() {
            return new EllipticCurve.CurveFp(new BigInteger(this.selectedCurve.Q),
                new BigInteger(this.selectedCurve.A),
                new BigInteger(this.selectedCurve.B));
        }

        ellipticEncryption.get_G = function(curve) {
            return new EllipticCurve.PointFp(curve,
                curve.fromBigInteger(new BigInteger(this.selectedCurve.GX)),
                curve.fromBigInteger(new BigInteger(this.selectedCurve.GY)));
        }

        ellipticEncryption.pick_rand = function() {
            var n = new BigInteger(this.selectedCurve.N);
            var n1 = n.subtract(BigInteger.ONE);
            var r = new BigInteger(n.bitLength(), this.rng);
            return r.mod(n1).add(BigInteger.ONE);
        }

        ellipticEncryption.senderRandom = function() {
            var r = this.pick_rand();
            return r.toString();
        };

        ellipticEncryption.receiverRandom = function() {

            //This is receivers private key. For now we will use random. CHANGE IT LATER
            var r = this.pick_rand();
            return r.toString();
        }

        ellipticEncryption.senderPublicString = function(senderPrivateKey) {

            var senderKeyECData = {};

            var curve = this.get_curve();
            var G = this.get_G(curve);
            var a = new BigInteger(senderPrivateKey);
            var P = G.multiply(a);
            senderKeyECData.XValuePublicString = P.getX().toBigInteger().toString();
            senderKeyECData.YValuePublicString = P.getY().toBigInteger().toString();

            return senderKeyECData;
        }

        //In real life ellipticEncryption.receiverPublicString is the public key of the receiver.
        //you don't have to run receiverRandom and the bottom function 
        ellipticEncryption.receiverPublicString = function(receiverPublicKey) {

            var receiverKeyECData = {};

            var curve = this.get_curve();
            var G = this.get_G(curve);
            var a = new BigInteger(receiverPublicKey);
            var P = G.multiply(a);
            receiverKeyECData.XValuePublicString = P.getX().toBigInteger().toString();
            receiverKeyECData.YValuePublicString = P.getY().toBigInteger().toString();

            return receiverKeyECData;
        }

        ellipticEncryption.senderSharedKeyDerivation = function(receiverPublicStringXValue,
            receiverPublicStringYValue, senderPrivateKey) {

            var senderDerivedKey = {};
            var curve = this.get_curve();
            var P = new EllipticCurve.PointFp(curve,
                curve.fromBigInteger(new BigInteger(receiverPublicStringXValue)),
                curve.fromBigInteger(new BigInteger(receiverPublicStringYValue)));
            var a = new BigInteger(senderPrivateKey);
            var S = P.multiply(a);

            senderDerivedKey.XValue = S.getX().toBigInteger().toString();
            senderDerivedKey.YValue = S.getY().toBigInteger().toString();

            return senderDerivedKey;
        }

        ellipticEncryption.receiverSharedKeyDerivation = function(senderPublicStringXValue,
            senderPublicStringYValue, receiverPrivateKey) {

            var receiverDerivedKey = {};
            var curve = this.get_curve();
            var P = new EllipticCurve.PointFp(curve,
                curve.fromBigInteger(new BigInteger(senderPublicStringXValue)),
                curve.fromBigInteger(new BigInteger(senderPublicStringYValue)));
            var a = new BigInteger(receiverPrivateKey);
            var S = P.multiply(a);

            receiverDerivedKey.XValue = S.getX().toBigInteger().toString();
            receiverDerivedKey.YValue = S.getY().toBigInteger().toString();

            return receiverDerivedKey;
        }

    })("secp256k1");
})(typeof global !== "undefined" ? global : window);

//secrets.js
(function(GLOBAL) {
    //Shamir Secret Share by Alexander Stetsyuk - released under MIT License

    var SecretShare = GLOBAL.shamirSecretShare = {};
    var defaults = {
        bits: 8, // default number of bits
        radix: 16, // work with HEX by default
        minBits: 3,
        maxBits: 20, // this permits 1,048,575 shares, though going this high is NOT recommended in JS!

        bytesPerChar: 2,
        maxBytesPerChar: 6, // Math.pow(256,7) > Math.pow(2,53)

        // Primitive polynomials (in decimal form) for Galois Fields GF(2^n), for 2 <= n <= 30
        // The index of each term in the array corresponds to the n for that polynomial
        // i.e. to get the polynomial for n=16, use primitivePolynomials[16]
        primitivePolynomials: [null, null, 1, 3, 3, 5, 3, 3, 29, 17, 9, 5, 83, 27, 43, 3, 45, 9, 39, 39,
            9, 5, 3, 33, 27, 9, 71, 39, 9, 5, 83
        ],

        // warning for insecure PRNG
        warning: 'WARNING:\nA secure random number generator was not found.\nUsing Math.random(), which is NOT cryptographically strong!'
    };

    // Protected settings object
    var config = {};

    /** @expose **/
    SecretShare.getConfig = function() {
        return {
            'bits': config.bits,
            'unsafePRNG': config.unsafePRNG
        };
    };

    function init(bits) {
        if (bits && (typeof bits !== 'number' || bits % 1 !== 0 || bits < defaults.minBits || bits >
                defaults.maxBits)) {
            throw new Error('Number of bits must be an integer between ' + defaults.minBits + ' and ' +
                defaults.maxBits + ', inclusive.')
        }

        config.radix = defaults.radix;
        config.bits = bits || defaults.bits;
        config.size = Math.pow(2, config.bits);
        config.max = config.size - 1;

        // Construct the exp and log tables for multiplication.
        var logs = [],
            exps = [],
            x = 1,
            primitive = defaults.primitivePolynomials[config.bits];
        for (var i = 0; i < config.size; i++) {
            exps[i] = x;
            logs[x] = i;
            x <<= 1;
            if (x >= config.size) {
                x ^= primitive;
                x &= config.max;
            }
        }

        config.logs = logs;
        config.exps = exps;
    };

    /** @expose **/
    SecretShare.init = init;

    function isInited() {
        if (!config.bits || !config.size || !config.max || !config.logs || !config.exps || config.logs.length !==
            config.size || config.exps.length !== config.size) {
            return false;
        }
        return true;
    };

    // Returns a pseudo-random number generator of the form function(bits){}
    // which should output a random string of 1's and 0's of length `bits`
    function getRNG() {
        var randomBits, crypto;

        function construct(bits, arr, radix, size) {
            var str = '',
                i = 0,
                len = arr.length - 1;
            while (i < len || (str.length < bits)) {
                str += padLeft(parseInt(arr[i], radix).toString(2), size);
                i++;
            }
            str = str.substr(-bits);
            if ((str.match(/0/g) || []).length === str.length) { // all zeros?
                return null;
            } else {
                return str;
            }
        }

        // node.js crypto.randomBytes()
        if (typeof require === 'function') {
            return function(bits) {
                var bytes = Math.ceil(bits / 8),
                    str = null;

                while (str === null) {
                    str = construct(bits, require('crypto').randomBytes(bytes).toString('hex'), 16, 4);
                }
                return str;
            }
        }

        // browsers with window.crypto.getRandomValues()
        if (GLOBAL['crypto'] && typeof GLOBAL['crypto']['getRandomValues'] === 'function' && typeof GLOBAL[
                'Uint32Array'] === 'function') {
            crypto = GLOBAL['crypto'];
            return function(bits) {
                var elems = Math.ceil(bits / 32),
                    str = null,
                    arr = new GLOBAL['Uint32Array'](elems);

                while (str === null) {
                    crypto['getRandomValues'](arr);
                    str = construct(bits, arr, 10, 32);
                }

                return str;
            }
        }

        // A totally insecure RNG!!! (except in Safari)
        // Will produce a warning every time it is called.
        config.unsafePRNG = true;
        warn();

        var bitsPerNum = 32;
        var max = Math.pow(2, bitsPerNum) - 1;
        return function(bits) {
            var elems = Math.ceil(bits / bitsPerNum);
            var arr = [],
                str = null;
            while (str === null) {
                for (var i = 0; i < elems; i++) {
                    arr[i] = Math.floor(Math.random() * max + 1);
                }
                str = construct(bits, arr, 10, bitsPerNum);
            }
            return str;
        };
    };

    // Warn about using insecure rng.
    // Called when Math.random() is being used.
    function warn() {
        GLOBAL['console']['warn'](defaults.warning);
        if (typeof GLOBAL['alert'] === 'function' && config.alert) {
            GLOBAL['alert'](defaults.warning);
        }
    }

    // Set the PRNG to use. If no RNG function is supplied, pick a default using getRNG()
    /** @expose **/
    SecretShare.setRNG = function(rng, alert) {
        if (!isInited()) {
            this.init();
        }
        config.unsafePRNG = false;
        rng = rng || getRNG();

        // test the RNG (5 times)
        if (typeof rng !== 'function' || typeof rng(config.bits) !== 'string' || !parseInt(rng(config.bits),
                2) || rng(config.bits).length > config.bits || rng(config.bits).length < config.bits) {
            throw new Error(
                "Random number generator is invalid. Supply an RNG of the form function(bits){} that returns a string containing 'bits' number of random 1's and 0's."
            )
        } else {
            config.rng = rng;
        }
        config.alert = !!alert;

        return !!config.unsafePRNG;
    };

    function isSetRNG() {
        return typeof config.rng === 'function';
    };

    // Generates a random bits-length number string using the PRNG
    /** @expose **/
    SecretShare.random = function(bits) {
        if (!isSetRNG()) {
            this.setRNG();
        }

        if (typeof bits !== 'number' || bits % 1 !== 0 || bits < 2) {
            throw new Error('Number of bits must be an integer greater than 1.')
        }

        if (config.unsafePRNG) {
            warn();
        }
        return bin2hex(config.rng(bits));
    }

    // Divides a `secret` number String str expressed in radix `inputRadix` (optional, default 16)
    // into `numShares` shares, each expressed in radix `outputRadix` (optional, default to `inputRadix`),
    // requiring `threshold` number of shares to reconstruct the secret.
    // Optionally, zero-pads the secret to a length that is a multiple of padLength before sharing.
    /** @expose **/
    SecretShare.share = function(secret, numShares, threshold, padLength, withoutPrefix) {
        if (!isInited()) {
            this.init();
        }
        if (!isSetRNG()) {
            this.setRNG();
        }

        padLength = padLength || 0;

        if (typeof secret !== 'string') {
            throw new Error('Secret must be a string.');
        }
        if (typeof numShares !== 'number' || numShares % 1 !== 0 || numShares < 2) {
            throw new Error('Number of shares must be an integer between 2 and 2^bits-1 (' + config.max +
                '), inclusive.')
        }
        if (numShares > config.max) {
            var neededBits = Math.ceil(Math.log(numShares + 1) / Math.LN2);
            throw new Error('Number of shares must be an integer between 2 and 2^bits-1 (' + config.max +
                '), inclusive. To create ' + numShares + ' shares, use at least ' + neededBits +
                ' bits.')
        }
        if (typeof threshold !== 'number' || threshold % 1 !== 0 || threshold < 2) {
            throw new Error('Threshold number of shares must be an integer between 2 and 2^bits-1 (' +
                config.max + '), inclusive.');
        }
        if (threshold > config.max) {
            var neededBits = Math.ceil(Math.log(threshold + 1) / Math.LN2);
            throw new Error('Threshold number of shares must be an integer between 2 and 2^bits-1 (' +
                config.max + '), inclusive.  To use a threshold of ' + threshold +
                ', use at least ' + neededBits + ' bits.');
        }
        if (typeof padLength !== 'number' || padLength % 1 !== 0) {
            throw new Error('Zero-pad length must be an integer greater than 1.');
        }

        if (config.unsafePRNG) {
            warn();
        }

        secret = '1' + hex2bin(secret); // append a 1 so that we can preserve the correct number of leading zeros in our secret
        secret = split(secret, padLength);
        var x = new Array(numShares),
            y = new Array(numShares);
        for (var i = 0, len = secret.length; i < len; i++) {
            var subShares = this._getShares(secret[i], numShares, threshold);
            for (var j = 0; j < numShares; j++) {
                x[j] = x[j] || subShares[j].x.toString(config.radix);
                y[j] = padLeft(subShares[j].y.toString(2)) + (y[j] ? y[j] : '');
            }
        }
        var padding = config.max.toString(config.radix).length;
        if (withoutPrefix) {
            for (var i = 0; i < numShares; i++) {
                x[i] = bin2hex(y[i]);
            }
        } else {
            for (var i = 0; i < numShares; i++) {
                x[i] = config.bits.toString(36).toUpperCase() + padLeft(x[i], padding) + bin2hex(y[i]);
            }
        }

        return x;
    };

    // This is the basic polynomial generation and evaluation function
    // for a `config.bits`-length secret (NOT an arbitrary length)
    // Note: no error-checking at this stage! If `secrets` is NOT
    // a NUMBER less than 2^bits-1, the output will be incorrect!
    /** @expose **/
    SecretShare._getShares = function(secret, numShares, threshold) {
        var shares = [];
        var coeffs = [secret];

        for (var i = 1; i < threshold; i++) {
            coeffs[i] = parseInt(config.rng(config.bits), 2);
        }
        for (var i = 1, len = numShares + 1; i < len; i++) {
            shares[i - 1] = {
                x: i,
                y: horner(i, coeffs)
            }
        }
        return shares;
    };

    // Polynomial evaluation at `x` using Horner's Method
    // TODO: this can possibly be sped up using other methods
    // NOTE: fx=fx * x + coeff[i] ->  exp(log(fx) + log(x)) + coeff[i],
    //       so if fx===0, just set fx to coeff[i] because
    //       using the exp/log form will result in incorrect value
    function horner(x, coeffs) {
        var logx = config.logs[x];
        var fx = 0;
        for (var i = coeffs.length - 1; i >= 0; i--) {
            if (fx === 0) {
                fx = coeffs[i];
                continue;
            }
            fx = config.exps[(logx + config.logs[fx]) % config.max] ^ coeffs[i];
        }
        return fx;
    };

    function inArray(arr, val) {
        for (var i = 0, len = arr.length; i < len; i++) {
            if (arr[i] === val) {
                return true;
            }
        }
        return false;
    };

    function processShare(share) {

        var bits = parseInt(share[0], 36);
        if (bits && (typeof bits !== 'number' || bits % 1 !== 0 || bits < defaults.minBits || bits >
                defaults.maxBits)) {
            throw new Error('Number of bits must be an integer between ' + defaults.minBits + ' and ' +
                defaults.maxBits + ', inclusive.')
        }

        var max = Math.pow(2, bits) - 1;
        var idLength = max.toString(config.radix).length;

        var id = parseInt(share.substr(1, idLength), config.radix);
        if (typeof id !== 'number' || id % 1 !== 0 || id < 1 || id > max) {
            throw new Error('Share id must be an integer between 1 and ' + config.max + ', inclusive.');
        }
        share = share.substr(idLength + 1);
        if (!share.length) {
            throw new Error('Invalid share: zero-length share.')
        }
        return {
            'bits': bits,
            'id': id,
            'value': share
        };
    };

    /** @expose **/
    SecretShare._processShare = processShare;

    // Protected method that evaluates the Lagrange interpolation
    // polynomial at x=`at` for individual config.bits-length
    // segments of each share in the `shares` Array.
    // Each share is expressed in base `inputRadix`. The output
    // is expressed in base `outputRadix'
    function combine(at, shares) {
        var setBits, share, x = [],
            y = [],
            result = '',
            idx;

        for (var i = 0, len = shares.length; i < len; i++) {
            share = processShare(shares[i]);
            if (typeof setBits === 'undefined') {
                setBits = share['bits'];
            } else if (share['bits'] !== setBits) {
                throw new Error('Mismatched shares: Different bit settings.')
            }

            if (config.bits !== setBits) {
                init(setBits);
            }

            if (inArray(x, share['id'])) { // repeated x value?
                continue;
            }

            idx = x.push(share['id']) - 1;
            share = split(hex2bin(share['value']));
            for (var j = 0, len2 = share.length; j < len2; j++) {
                y[j] = y[j] || [];
                y[j][idx] = share[j];
            }
        }

        for (var i = 0, len = y.length; i < len; i++) {
            result = padLeft(lagrange(at, x, y[i]).toString(2)) + result;
        }

        if (at === 0) { // reconstructing the secret
            var idx = result.indexOf('1'); //find the first 1
            return bin2hex(result.slice(idx + 1));
        } else { // generating a new share
            return bin2hex(result);
        }
    };

    // Combine `shares` Array into the original secret
    /** @expose **/
    SecretShare.combine = function(shares) {
        return combine(0, shares);
    };

    // Generate a new share with id `id` (a number between 1 and 2^bits-1)
    // `id` can be a Number or a String in the default radix (16)
    /** @expose **/
    SecretShare.newShare = function(id, shares) {
        if (typeof id === 'string') {
            id = parseInt(id, config.radix);
        }

        var share = processShare(shares[0]);
        var max = Math.pow(2, share['bits']) - 1;

        if (typeof id !== 'number' || id % 1 !== 0 || id < 1 || id > max) {
            throw new Error('Share id must be an integer between 1 and ' + config.max + ', inclusive.');
        }

        var padding = max.toString(config.radix).length;
        return config.bits.toString(36).toUpperCase() + padLeft(id.toString(config.radix), padding) +
            combine(id, shares);
    };

    // Evaluate the Lagrange interpolation polynomial at x = `at`
    // using x and y Arrays that are of the same length, with
    // corresponding elements constituting points on the polynomial.
    function lagrange(at, x, y) {
        var sum = 0,
            product,
            i, j;

        for (var i = 0, len = x.length; i < len; i++) {
            if (!y[i]) {
                continue;
            }

            product = config.logs[y[i]];
            for (var j = 0; j < len; j++) {
                if (i === j) {
                    continue;
                }
                if (at === x[j]) { // happens when computing a share that is in the list of shares used to compute it
                    product = -1; // fix for a zero product term, after which the sum should be sum^0 = sum, not sum^1
                    break;
                }
                product = (product + config.logs[at ^ x[j]] - config.logs[x[i] ^ x[j]] + config.max /* to make sure it's not negative */ ) %
                    config.max;
            }

            sum = product === -1 ? sum : sum ^ config.exps[product]; // though exps[-1]= undefined and undefined ^ anything = anything in chrome, this behavior may not hold everywhere, so do the check
        }
        return sum;
    };

    /** @expose **/
    SecretShare._lagrange = lagrange;

    // Splits a number string `bits`-length segments, after first
    // optionally zero-padding it to a length that is a multiple of `padLength.
    // Returns array of integers (each less than 2^bits-1), with each element
    // representing a `bits`-length segment of the input string from right to left,
    // i.e. parts[0] represents the right-most `bits`-length segment of the input string.
    function split(str, padLength) {
        if (padLength) {
            str = padLeft(str, padLength)
        }
        var parts = [];
        for (var i = str.length; i > config.bits; i -= config.bits) {
            parts.push(parseInt(str.slice(i - config.bits, i), 2));
        }
        parts.push(parseInt(str.slice(0, i), 2));
        return parts;
    };

    // Pads a string `str` with zeros on the left so that its length is a multiple of `bits`
    function padLeft(str, bits) {
        bits = bits || config.bits
        var missing = str.length % bits;
        return (missing ? new Array(bits - missing + 1).join('0') : '') + str;
    };

    function hex2bin(str) {
        var bin = '',
            num;
        for (var i = str.length - 1; i >= 0; i--) {
            num = parseInt(str[i], 16)
            if (isNaN(num)) {
                throw new Error('Invalid hex character.')
            }
            bin = padLeft(num.toString(2), 4) + bin;
        }
        return bin;
    }

    function bin2hex(str) {
        var hex = '',
            num;
        str = padLeft(str, 4);
        for (var i = str.length; i >= 4; i -= 4) {
            num = parseInt(str.slice(i - 4, i), 2);
            if (isNaN(num)) {
                throw new Error('Invalid binary character.')
            }
            hex = num.toString(16) + hex;
        }
        return hex;
    }

    // Converts a given UTF16 character string to the HEX representation.
    // Each character of the input string is represented by
    // `bytesPerChar` bytes in the output string.
    /** @expose **/
    SecretShare.str2hex = function(str, bytesPerChar) {
        if (typeof str !== 'string') {
            throw new Error('Input must be a character string.');
        }
        bytesPerChar = bytesPerChar || defaults.bytesPerChar;

        if (typeof bytesPerChar !== 'number' || bytesPerChar % 1 !== 0 || bytesPerChar < 1 ||
            bytesPerChar > defaults.maxBytesPerChar) {
            throw new Error('Bytes per character must be an integer between 1 and ' + defaults.maxBytesPerChar +
                ', inclusive.')
        }

        var hexChars = 2 * bytesPerChar;
        var max = Math.pow(16, hexChars) - 1;
        var out = '',
            num;
        for (var i = 0, len = str.length; i < len; i++) {
            num = str[i].charCodeAt();
            if (isNaN(num)) {
                throw new Error('Invalid character: ' + str[i]);
            } else if (num > max) {
                var neededBytes = Math.ceil(Math.log(num + 1) / Math.log(256));
                throw new Error('Invalid character code (' + num +
                    '). Maximum allowable is 256^bytes-1 (' + max +
                    '). To convert this character, use at least ' + neededBytes + ' bytes.')
            } else {
                out = padLeft(num.toString(16), hexChars) + out;
            }
        }
        return out;
    };

    // Converts a given HEX number string to a UTF16 character string.
    /** @expose **/
    SecretShare.hex2str = function(str, bytesPerChar) {
        if (typeof str !== 'string') {
            throw new Error('Input must be a hexadecimal string.');
        }
        bytesPerChar = bytesPerChar || defaults.bytesPerChar;

        if (typeof bytesPerChar !== 'number' || bytesPerChar % 1 !== 0 || bytesPerChar < 1 ||
            bytesPerChar > defaults.maxBytesPerChar) {
            throw new Error('Bytes per character must be an integer between 1 and ' + defaults.maxBytesPerChar +
                ', inclusive.')
        }

        var hexChars = 2 * bytesPerChar;
        var out = '';
        str = padLeft(str, hexChars);
        for (var i = 0, len = str.length; i < len; i += hexChars) {
            out = String.fromCharCode(parseInt(str.slice(i, i + hexChars), 16)) + out;
        }
        return out;
    };

    // by default, initialize without an RNG
    SecretShare.init();
})(typeof global !== 'undefined' ? global : window);


/* FLO Crypto Operators*/
(function(GLOBAL) {
    const floCrypto = GLOBAL.floCrypto = {

        util: {
            p: BigInteger("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F", 16),

            ecparams: EllipticCurve.getSECCurveByName("secp256k1"),

            asciiAlternatives: `‘ '\n’ '\n“ "\n” "\n– --\n— ---\n≥ >=\n≤ <=\n≠ !=\n× *\n÷ /\n← <-\n→ ->\n↔ <->\n⇒ =>\n⇐ <=\n⇔ <=>`,

            exponent1: function() {
                return this.p.add(BigInteger.ONE).divide(BigInteger("4"))
            },

            calculateY: function(x) {
                let p = this.p;
                let exp = this.exponent1();
                // x is x value of public key in BigInteger format without 02 or 03 or 04 prefix
                return x.modPow(BigInteger("3"), p).add(BigInteger("7")).mod(p).modPow(exp, p)
            },
            getUncompressedPublicKey: function(compressedPublicKey) {
                const p = this.p;
                // Fetch x from compressedPublicKey
                let pubKeyBytes = Crypto.util.hexToBytes(compressedPublicKey);
                const prefix = pubKeyBytes.shift() // remove prefix
                let prefix_modulus = prefix % 2;
                pubKeyBytes.unshift(0) // add prefix 0
                let x = new BigInteger(pubKeyBytes)
                let xDecimalValue = x.toString()
                // Fetch y
                let y = this.calculateY(x);
                let yDecimalValue = y.toString();
                // verify y value
                let resultBigInt = y.mod(BigInteger("2"));
                let check = resultBigInt.toString() % 2;
                if (prefix_modulus !== check)
                    yDecimalValue = y.negate().mod(p).toString();
                return {
                    x: xDecimalValue,
                    y: yDecimalValue
                };
            },

            getSenderPublicKeyString: function() {
                let privateKey = ellipticCurveEncryption.senderRandom();
                var senderPublicKeyString = ellipticCurveEncryption.senderPublicString(privateKey);
                return {
                    privateKey: privateKey,
                    senderPublicKeyString: senderPublicKeyString
                }
            },

            deriveSharedKeySender: function(receiverCompressedPublicKey, senderPrivateKey) {
                let receiverPublicKeyString = this.getUncompressedPublicKey(receiverCompressedPublicKey);
                var senderDerivedKey = ellipticCurveEncryption.senderSharedKeyDerivation(
                    receiverPublicKeyString.x, receiverPublicKeyString.y, senderPrivateKey);
                return senderDerivedKey;
            },

            deriveReceiverSharedKey: function(senderPublicKeyString, receiverPrivateKey) {
                return ellipticCurveEncryption.receiverSharedKeyDerivation(
                    senderPublicKeyString.XValuePublicString, senderPublicKeyString.YValuePublicString, receiverPrivateKey);
            },

            getReceiverPublicKeyString: function(privateKey) {
                return ellipticCurveEncryption.receiverPublicString(privateKey);
            },

            deriveSharedKeyReceiver: function(senderPublicKeyString, receiverPrivateKey) {
                return ellipticCurveEncryption.receiverSharedKeyDerivation(
                    senderPublicKeyString.XValuePublicString, senderPublicKeyString.YValuePublicString, receiverPrivateKey);
            },

            wifToDecimal: function(pk_wif, isPubKeyCompressed = false) {
                let pk = Bitcoin.Base58.decode(pk_wif)
                pk.shift()
                pk.splice(-4, 4)
                //If the private key corresponded to a compressed public key, also drop the last byte (it should be 0x01).
                if (isPubKeyCompressed == true) pk.pop()
                pk.unshift(0)
                let privateKeyDecimal = BigInteger(pk).toString()
                let privateKeyHex = Crypto.util.bytesToHex(pk)
                return {
                    privateKeyDecimal: privateKeyDecimal,
                    privateKeyHex: privateKeyHex
                }
            }
        },

        //generate a random Interger within range
        randInt: function(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },

        //generate a random String within length (options : alphaNumeric chars only)
        randString: function(length, alphaNumeric = true) {
            var result = '';
            if (alphaNumeric)
                var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            else
                var characters =
                    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_+-./*?@#&$<>=[]{}():';
            for (var i = 0; i < length; i++)
                result += characters.charAt(Math.floor(Math.random() * characters.length));
            return result;
        },

        //Encrypt Data using public-key
        encryptData: function(data, receiverCompressedPublicKey) {
            var senderECKeyData = this.util.getSenderPublicKeyString();
            var senderDerivedKey = this.util.deriveSharedKeySender(receiverCompressedPublicKey, senderECKeyData
                .privateKey);
            let senderKey = senderDerivedKey.XValue + senderDerivedKey.YValue;
            let secret = Crypto.AES.encrypt(data, senderKey);
            return {
                secret: secret,
                senderPublicKeyString: senderECKeyData.senderPublicKeyString
            };
        },

        //Decrypt Data using private-key
        decryptData: function(data, myPrivateKey) {
            var receiverECKeyData = {};
            if (typeof myPrivateKey !== "string") throw new Error("No private key found.");

            let privateKey = this.util.wifToDecimal(myPrivateKey, true);
            if (typeof privateKey.privateKeyDecimal !== "string") throw new Error(
                "Failed to detremine your private key.");
            receiverECKeyData.privateKey = privateKey.privateKeyDecimal;

            var receiverDerivedKey = this.util.deriveReceiverSharedKey(data.senderPublicKeyString,
                receiverECKeyData
                .privateKey);

            let receiverKey = receiverDerivedKey.XValue + receiverDerivedKey.YValue;
            let decryptMsg = Crypto.AES.decrypt(data.secret, receiverKey);
            return decryptMsg;
        },

        //Sign data using private-key
        signData: function(data, privateKeyHex) {
            var key = new Bitcoin.ECKey(privateKeyHex);
            key.setCompressed(true);

            var privateKeyArr = key.getBitcoinPrivateKeyByteArray();
            var privateKey = BigInteger.fromByteArrayUnsigned(privateKeyArr);
            var messageHash = Crypto.SHA256(data);

            var messageHashBigInteger = new BigInteger(messageHash);
            var messageSign = Bitcoin.ECDSA.sign(messageHashBigInteger, key.priv);

            var sighex = Crypto.util.bytesToHex(messageSign);
            return sighex;
        },

        //Verify signatue of the data using public-key
        verifySign: function(data, signatureHex, publicKeyHex) {
            var msgHash = Crypto.SHA256(data);
            var messageHashBigInteger = new BigInteger(msgHash);

            var sigBytes = Crypto.util.hexToBytes(signatureHex);
            var signature = Bitcoin.ECDSA.parseSig(sigBytes);

            var publicKeyPoint = this.util.ecparams.getCurve().decodePointHex(publicKeyHex);

            var verify = Bitcoin.ECDSA.verifyRaw(messageHashBigInteger, signature.r, signature.s,
                publicKeyPoint);
            return verify;
        },

        //Generates a new flo ID and returns private-key, public-key and floID
        generateNewID: function() {
            try {
                var key = new Bitcoin.ECKey(false);
                key.setCompressed(true);
                return {
                    floID: key.getBitcoinAddress(),
                    pubKey: key.getPubKeyHex(),
                    privKey: key.getBitcoinWalletImportFormat()
                }
            } catch (e) {
                console.error(e);
            }
        },

        //Returns public-key from private-key
        getPubKeyHex: function(privateKeyHex) {
            if (!privateKeyHex)
                return null;
            var key = new Bitcoin.ECKey(privateKeyHex);
            if (key.priv == null)
                return null;
            key.setCompressed(true);
            return key.getPubKeyHex();
        },

        //Returns flo-ID from public-key or private-key
        getFloID: function(keyHex) {
            if (!keyHex)
                return null;
            try {
                var key = new Bitcoin.ECKey(keyHex);
                if (key.priv == null)
                    key.setPub(keyHex);
                return key.getBitcoinAddress();
            } catch (e) {
                return null;
            }
        },

        //Verify the private-key for the given public-key or flo-ID
        verifyPrivKey: function(privateKeyHex, pubKey_floID, isfloID = true) {
            if (!privateKeyHex || !pubKey_floID)
                return false;
            try {
                var key = new Bitcoin.ECKey(privateKeyHex);
                if (key.priv == null)
                    return false;
                key.setCompressed(true);
                if (isfloID && pubKey_floID == key.getBitcoinAddress())
                    return true;
                else if (!isfloID && pubKey_floID == key.getPubKeyHex())
                    return true;
                else
                    return false;
            } catch (e) {
                console.error(e);
            }
        },

        //Check if the given Address is valid or not
        validateAddr: function(inpAddr) {
            if (!inpAddr)
                return false;
            try {
                var addr = new Bitcoin.Address(inpAddr);
                return true;
            } catch {
                return false;
            }
        },

        //Split the str using shamir's Secret and Returns the shares 
        createShamirsSecretShares: function(str, total_shares, threshold_limit) {
            try {
                if (str.length > 0) {
                    var strHex = shamirSecretShare.str2hex(str);
                    var shares = shamirSecretShare.share(strHex, total_shares, threshold_limit);
                    return shares;
                }
                return false;
            } catch {
                return false
            }
        },

        //Verifies the shares and str
        verifyShamirsSecret: function(sharesArray, str) {
            return (str && this.retrieveShamirSecret(sharesArray) === str)
        },

        //Returns the retrived secret by combining the shamirs shares
        retrieveShamirSecret: function(sharesArray) {
            try {
                if (sharesArray.length > 0) {
                    var comb = shamirSecretShare.combine(sharesArray.slice(0, sharesArray.length));
                    comb = shamirSecretShare.hex2str(comb);
                    return comb;
                }
                return false;
            } catch {
                return false;
            }
        },

        validateASCII: function(string, bool = true) {
            if (typeof string !== "string")
                return null;
            if (bool) {
                let x;
                for (let i = 0; i < string.length; i++) {
                    x = string.charCodeAt(i);
                    if (x < 32 || x > 127)
                        return false;
                }
                return true;
            } else {
                let x, invalids = {};
                for (let i = 0; i < string.length; i++) {
                    x = string.charCodeAt(i);
                    if (x < 32 || x > 127)
                        if (x in invalids)
                            invalids[string[i]].push(i)
                    else
                        invalids[string[i]] = [i];
                }
                if (Object.keys(invalids).length)
                    return invalids;
                else
                    return true;
            }
        },

        convertToASCII: function(string, mode = 'soft-remove') {
            let chars = this.validateASCII(string, false);
            if (chars === true)
                return string;
            else if (chars === null)
                return null;
            let convertor, result = string,
                refAlt = {};
            this.util.asciiAlternatives.split('\n').forEach(a => refAlt[a[0]] = a.slice(2));
            mode = mode.toLowerCase();
            if (mode === "hard-unicode")
                convertor = (c) => `\\u${('000'+c.charCodeAt().toString(16)).slice(-4)}`;
            else if (mode === "soft-unicode")
                convertor = (c) => refAlt[c] || `\\u${('000'+c.charCodeAt().toString(16)).slice(-4)}`;
            else if (mode === "hard-remove")
                convertor = c => "";
            else if (mode === "soft-remove")
                convertor = c => refAlt[c] || "";
            else
                return null;
            for (let c in chars)
                result = result.replaceAll(c, convertor(c));
            return result;
        },

        revertUnicode: function(string) {
            return string.replace(/\\u[\dA-F]{4}/gi,
                m => String.fromCharCode(parseInt(m.replace(/\\u/g, ''), 16)));
        }
    }

})(typeof global !== "undefined" ? global : window);

/* FLO Blockchain Operator to send/receive data from blockchain using API calls*/
//floBlockchainAPI v2.2.1a
(function(GLOBAL) {
    const floBlockchainAPI = GLOBAL.floBlockchainAPI = {

        util: {
            serverList: floGlobals.apiURL[floGlobals.blockchain].slice(0),
            curPos: floCrypto.randInt(0, floGlobals.apiURL[floGlobals.blockchain].length - 1),
            fetch_retry: function(apicall, rm_flosight) {
                return new Promise((resolve, reject) => {
                    let i = this.serverList.indexOf(rm_flosight)
                    if (i != -1) this.serverList.splice(i, 1);
                    this.curPos = floCrypto.randInt(0, this.serverList.length - 1);
                    this.fetch_api(apicall)
                        .then(result => resolve(result))
                        .catch(error => reject(error));
                })
            },
            fetch_api: function(apicall) {
                return new Promise((resolve, reject) => {
                    if (this.serverList.length === 0)
                        reject("No floSight server working");
                    else {
                        let flosight = this.serverList[this.curPos];
                        fetch(flosight + apicall).then(response => {
                            if (response.ok)
                                response.json().then(data => resolve(data));
                            else {
                                this.fetch_retry(apicall, flosight)
                                    .then(result => resolve(result))
                                    .catch(error => reject(error));
                            }
                        }).catch(error => {
                            this.fetch_retry(apicall, flosight)
                                .then(result => resolve(result))
                                .catch(error => reject(error));
                        })
                    }
                })
            },

            current: function() {
                return this.serverList[this.curPos];
            }
        },

        //Promised function to get data from API
        promisedAPI: function(apicall) {
            return new Promise((resolve, reject) => {
                //console.log(apicall);
                this.util.fetch_api(apicall)
                    .then(result => resolve(result))
                    .catch(error => reject(error));
            });
        },

        //Get balance for the given Address
        getBalance: function(addr) {
            return new Promise((resolve, reject) => {
                this.promisedAPI(`api/addr/${addr}/balance`)
                    .then(balance => resolve(parseFloat(balance)))
                    .catch(error => reject(error));
            });
        },

        //Write Data into blockchain
        writeData: function(senderAddr, data, privKey, receiverAddr = floGlobals.adminID, strict_utxo = true) {
            return new Promise((resolve, reject) => {
                if (typeof data != "string")
                    data = JSON.stringify(data);
                this.sendTx(senderAddr, receiverAddr, floGlobals.sendAmt, privKey, data, strict_utxo)
                    .then(txid => resolve(txid))
                    .catch(error => reject(error));
            });
        },

        //Send Tx to blockchain 
        sendTx: function(senderAddr, receiverAddr, sendAmt, privKey, floData = '', strict_utxo = true) {
            return new Promise((resolve, reject) => {
                if (!floCrypto.validateASCII(floData))
                    return reject("Invalid FLO_Data: only printable ASCII characters are allowed");
                else if (!floCrypto.validateAddr(senderAddr))
                    return reject(`Invalid address : ${senderAddr}`);
                else if (!floCrypto.validateAddr(receiverAddr))
                    return reject(`Invalid address : ${receiverAddr}`);
                else if (privKey.length < 1 || !floCrypto.verifyPrivKey(privKey, senderAddr))
                    return reject("Invalid Private key!");
                else if (typeof sendAmt !== 'number' || sendAmt <= 0)
                    return reject(`Invalid sendAmt : ${sendAmt}`);

                //get unconfirmed tx list
                this.promisedAPI(`api/addr/${senderAddr}`).then(result => {
                    this.readTxs(senderAddr, 0, result.unconfirmedTxApperances).then(result => {
                        let unconfirmedSpent = {};
                        for (let tx of result.items)
                            if (tx.confirmations == 0)
                                for (let vin of tx.vin)
                                    if (vin.addr === senderAddr) {
                                        if (Array.isArray(unconfirmedSpent[vin.txid]))
                                            unconfirmedSpent[vin.txid].push(vin.vout);
                                        else
                                            unconfirmedSpent[vin.txid] = [vin.vout];
                                    }
                        //get utxos list
                        this.promisedAPI(`api/addr/${senderAddr}/utxo`).then(utxos => {
                            //form/construct the transaction data
                            var trx = bitjs.transaction();
                            var utxoAmt = 0.0;
                            var fee = floGlobals.fee;
                            for (var i = utxos.length - 1;
                                (i >= 0) && (utxoAmt < sendAmt + fee); i--) {
                                //use only utxos with confirmations (strict_utxo mode)
                                if (utxos[i].confirmations || !strict_utxo) {
                                    if (utxos[i].txid in unconfirmedSpent && unconfirmedSpent[utxos[i].txid].includes(utxos[i].vout))
                                        continue; //A transaction has already used this utxo, but is unconfirmed.
                                    trx.addinput(utxos[i].txid, utxos[i].vout, utxos[i].scriptPubKey);
                                    utxoAmt += utxos[i].amount;
                                };
                            }
                            if (utxoAmt < sendAmt + fee)
                                reject("Insufficient FLO balance!");
                            else {
                                trx.addoutput(receiverAddr, sendAmt);
                                var change = utxoAmt - sendAmt - fee;
                                if (change > 0)
                                    trx.addoutput(senderAddr, change);
                                trx.addflodata(floData.replace(/\n/g, ' '));
                                var signedTxHash = trx.sign(privKey, 1);
                                this.broadcastTx(signedTxHash)
                                    .then(txid => resolve(txid))
                                    .catch(error => reject(error))
                            }
                        }).catch(error => reject(error))
                    }).catch(error => reject(error))
                }).catch(error => reject(error))
            });
        },

        //merge all UTXOs of a given floID into a single UTXO
        mergeUTXOs: function(floID, privKey, floData = '') {
            return new Promise((resolve, reject) => {
                if (!floCrypto.validateAddr(floID))
                    return reject(`Invalid floID`);
                if (!floCrypto.verifyPrivKey(privKey, floID))
                    return reject("Invalid Private Key");
                if (!floCrypto.validateASCII(floData))
                    return reject("Invalid FLO_Data: only printable ASCII characters are allowed");
                var trx = bitjs.transaction();
                var utxoAmt = 0.0;
                var fee = floGlobals.fee;
                this.promisedAPI(`api/addr/${floID}/utxo`).then(utxos => {
                    for (var i = utxos.length - 1; i >= 0; i--)
                        if (utxos[i].confirmations) {
                            trx.addinput(utxos[i].txid, utxos[i].vout, utxos[i].scriptPubKey);
                            utxoAmt += utxos[i].amount;
                        }
                    trx.addoutput(floID, utxoAmt - fee);
                    trx.addflodata(floData.replace(/\n/g, ' '));
                    var signedTxHash = trx.sign(privKey, 1);
                    this.broadcastTx(signedTxHash)
                        .then(txid => resolve(txid))
                        .catch(error => reject(error))
                }).catch(error => reject(error))
            })
        },

        /**Write data into blockchain from (and/or) to multiple floID
         * @param  {Array} senderPrivKeys List of sender private-keys
         * @param  {string} data FLO data of the txn
         * @param  {Array} receivers List of receivers
         * @param  {boolean} preserveRatio (optional) preserve ratio or equal contribution
         * @return {Promise}
         */
        writeDataMultiple: function(senderPrivKeys, data, receivers = [floGlobals.adminID], preserveRatio = true) {
            return new Promise((resolve, reject) => {
                if (!Array.isArray(senderPrivKeys))
                    return reject("Invalid senderPrivKeys: SenderPrivKeys must be Array");
                if (!preserveRatio) {
                    let tmp = {};
                    let amount = (floGlobals.sendAmt * receivers.length) / senderPrivKeys.length;
                    senderPrivKeys.forEach(key => tmp[key] = amount);
                    senderPrivKeys = tmp;
                }
                if (!Array.isArray(receivers))
                    return reject("Invalid receivers: Receivers must be Array");
                else {
                    let tmp = {};
                    let amount = floGlobals.sendAmt;
                    receivers.forEach(floID => tmp[floID] = amount);
                    receivers = tmp
                }
                if (typeof data != "string")
                    data = JSON.stringify(data);
                this.sendTxMultiple(senderPrivKeys, receivers, data)
                    .then(txid => resolve(txid))
                    .catch(error => reject(error))
            })
        },

        /**Send Tx from (and/or) to multiple floID
         * @param  {Array or Object} senderPrivKeys List of sender private-key (optional: with coins to be sent)
         * @param  {Object} receivers List of receivers with respective amount to be sent
         * @param  {string} floData FLO data of the txn
         * @return {Promise}
         */
        sendTxMultiple: function(senderPrivKeys, receivers, floData = '') {
            return new Promise((resolve, reject) => {
                if (!floCrypto.validateASCII(floData))
                    return reject("Invalid FLO_Data: only printable ASCII characters are allowed");
                let senders = {},
                    preserveRatio;
                //check for argument validations
                try {
                    let invalids = {
                        InvalidSenderPrivKeys: [],
                        InvalidSenderAmountFor: [],
                        InvalidReceiverIDs: [],
                        InvalidReceiveAmountFor: []
                    }
                    let inputVal = 0,
                        outputVal = 0;
                    //Validate sender privatekeys (and send amount if passed)
                    //conversion when only privateKeys are passed (preserveRatio mode)
                    if (Array.isArray(senderPrivKeys)) {
                        senderPrivKeys.forEach(key => {
                            try {
                                if (!key)
                                    invalids.InvalidSenderPrivKeys.push(key);
                                else {
                                    let floID = floCrypto.getFloID(key);
                                    senders[floID] = {
                                        wif: key
                                    }
                                }
                            } catch (error) {
                                invalids.InvalidSenderPrivKeys.push(key)
                            }
                        })
                        preserveRatio = true;
                    }
                    //conversion when privatekeys are passed with send amount
                    else {
                        for (let key in senderPrivKeys) {
                            try {
                                if (!key)
                                    invalids.InvalidSenderPrivKeys.push(key);
                                else {
                                    if (typeof senderPrivKeys[key] !== 'number' || senderPrivKeys[key] <= 0)
                                        invalids.InvalidSenderAmountFor.push(key);
                                    else
                                        inputVal += senderPrivKeys[key];
                                    let floID = floCrypto.getFloID(key);
                                    senders[floID] = {
                                        wif: key,
                                        coins: senderPrivKeys[key]
                                    }
                                }
                            } catch (error) {
                                invalids.InvalidSenderPrivKeys.push(key)
                            }
                        }
                        preserveRatio = false;
                    }
                    //Validate the receiver IDs and receive amount
                    for (let floID in receivers) {
                        if (!floCrypto.validateAddr(floID))
                            invalids.InvalidReceiverIDs.push(floID);
                        if (typeof receivers[floID] !== 'number' || receivers[floID] <= 0)
                            invalids.InvalidReceiveAmountFor.push(floID);
                        else
                            outputVal += receivers[floID];
                    }
                    //Reject if any invalids are found
                    for (let i in invalids)
                        if (!invalids[i].length)
                            delete invalids[i];
                    if (Object.keys(invalids).length)
                        return reject(invalids);
                    //Reject if given inputVal and outputVal are not equal
                    if (!preserveRatio && inputVal != outputVal)
                        return reject(`Input Amount (${inputVal}) not equal to Output Amount (${outputVal})`);
                } catch (error) {
                    return reject(error)
                }
                //Get balance of senders
                let promises = [];
                for (let floID in senders)
                    promises.push(this.getBalance(floID));
                Promise.all(promises).then(results => {
                    let totalBalance = 0,
                        totalFee = floGlobals.fee,
                        balance = {};
                    //Divide fee among sender if not for preserveRatio
                    if (!preserveRatio)
                        var dividedFee = totalFee / Object.keys(senders).length;
                    //Check if balance of each sender is sufficient enough
                    let insufficient = [];
                    for (let floID in senders) {
                        balance[floID] = parseFloat(results.shift());
                        if (isNaN(balance[floID]) || (preserveRatio && balance[floID] <= totalFee) ||
                            (!preserveRatio && balance[floID] < senders[floID].coins + dividedFee))
                            insufficient.push(floID);
                        totalBalance += balance[floID];
                    }
                    if (insufficient.length)
                        return reject({
                            InsufficientBalance: insufficient
                        })
                    //Calculate totalSentAmount and check if totalBalance is sufficient
                    let totalSendAmt = totalFee;
                    for (floID in receivers)
                        totalSendAmt += receivers[floID];
                    if (totalBalance < totalSendAmt)
                        return reject("Insufficient total Balance");
                    //Get the UTXOs of the senders
                    let promises = [];
                    for (floID in senders)
                        promises.push(this.promisedAPI(`api/addr/${floID}/utxo`));
                    Promise.all(promises).then(results => {
                        let wifSeq = [];
                        var trx = bitjs.transaction();
                        for (floID in senders) {
                            let utxos = results.shift();
                            let sendAmt;
                            if (preserveRatio) {
                                let ratio = (balance[floID] / totalBalance);
                                sendAmt = totalSendAmt * ratio;
                            } else
                                sendAmt = senders[floID].coins + dividedFee;
                            let wif = senders[floID].wif;
                            let utxoAmt = 0.0;
                            for (let i = utxos.length - 1;
                                (i >= 0) && (utxoAmt < sendAmt); i--) {
                                if (utxos[i].confirmations) {
                                    trx.addinput(utxos[i].txid, utxos[i].vout, utxos[i].scriptPubKey);
                                    wifSeq.push(wif);
                                    utxoAmt += utxos[i].amount;
                                }
                            }
                            if (utxoAmt < sendAmt)
                                return reject("Insufficient balance:" + floID);
                            let change = (utxoAmt - sendAmt);
                            if (change > 0)
                                trx.addoutput(floID, change);
                        }
                        for (floID in receivers)
                            trx.addoutput(floID, receivers[floID]);
                        trx.addflodata(floData.replace(/\n/g, ' '));
                        for (let i = 0; i < wifSeq.length; i++)
                            trx.signinput(i, wifSeq[i], 1);
                        var signedTxHash = trx.serialize();
                        this.broadcastTx(signedTxHash)
                            .then(txid => resolve(txid))
                            .catch(error => reject(error))
                    }).catch(error => reject(error))
                }).catch(error => reject(error))
            })
        },

        //Broadcast signed Tx in blockchain using API
        broadcastTx: function(signedTxHash) {
            return new Promise((resolve, reject) => {
                if (signedTxHash.length < 1)
                    return reject("Empty Signature");
                var url = this.util.serverList[this.util.curPos] + 'api/tx/send';
                fetch(url, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: `{"rawtx":"${signedTxHash}"}`
                }).then(response => {
                    if (response.ok)
                        response.json().then(data => resolve(data.txid.result));
                    else
                        response.text().then(data => resolve(data));
                }).catch(error => reject(error));
            })
        },

        getTx: function(txid) {
            return new Promise((resolve, reject) => {
                this.promisedAPI(`api/tx/${txid}`)
                    .then(response => resolve(response))
                    .catch(error => reject(error))
            })
        },

        //Read Txs of Address between from and to
        readTxs: function(addr, from, to) {
            return new Promise((resolve, reject) => {
                this.promisedAPI(`api/addrs/${addr}/txs?from=${from}&to=${to}`)
                    .then(response => resolve(response))
                    .catch(error => reject(error))
            });
        },

        //Read All Txs of Address (newest first)
        readAllTxs: function(addr) {
            return new Promise((resolve, reject) => {
                this.promisedAPI(`api/addrs/${addr}/txs?from=0&to=1`).then(response => {
                    this.promisedAPI(`api/addrs/${addr}/txs?from=0&to=${response.totalItems}0`)
                        .then(response => resolve(response.items))
                        .catch(error => reject(error));
                }).catch(error => reject(error))
            });
        },

        /*Read flo Data from txs of given Address
        options can be used to filter data
        limit       : maximum number of filtered data (default = 1000, negative  = no limit)
        ignoreOld   : ignore old txs (default = 0)
        sentOnly    : filters only sent data
        receivedOnly: filters only received data
        pattern     : filters data that with JSON pattern
        filter      : custom filter funtion for floData (eg . filter: d => {return d[0] == '$'})
        tx          : (boolean) resolve tx data or not (resolves an Array of Object with tx details)
        sender      : flo-id(s) of sender
        receiver    : flo-id(s) of receiver
        */
        readData: function(addr, options = {}) {
            options.limit = options.limit || 0;
            options.ignoreOld = options.ignoreOld || 0;
            if (typeof options.sender === "string") options.sender = [options.sender];
            if (typeof options.receiver === "string") options.receiver = [options.receiver];
            return new Promise((resolve, reject) => {
                this.promisedAPI(`api/addrs/${addr}/txs?from=0&to=1`).then(response => {
                    var newItems = response.totalItems - options.ignoreOld;
                    this.promisedAPI(`api/addrs/${addr}/txs?from=0&to=${newItems*2}`).then(response => {
                        if (options.limit <= 0)
                            options.limit = response.items.length;
                        var filteredData = [];
                        let numToRead = response.totalItems - options.ignoreOld,
                            unconfirmedCount = 0;
                        for (let i = 0; i < numToRead && filteredData.length < options.limit; i++) {
                            if (!response.items[i].confirmations) { //unconfirmed transactions
                                unconfirmedCount++;
                                if (numToRead < response.items[i].length)
                                    numToRead++;
                                continue;
                            }
                            if (options.pattern) {
                                try {
                                    let jsonContent = JSON.parse(response.items[i].floData);
                                    if (!Object.keys(jsonContent).includes(options.pattern))
                                        continue;
                                } catch (error) {
                                    continue;
                                }
                            }
                            if (options.sentOnly) {
                                let flag = false;
                                for (let vin of response.items[i].vin)
                                    if (vin.addr === addr) {
                                        flag = true;
                                        break;
                                    }
                                if (!flag) continue;
                            }
                            if (Array.isArray(options.sender)) {
                                let flag = false;
                                for (let vin of response.items[i].vin)
                                    if (options.sender.includes(vin.addr)) {
                                        flag = true;
                                        break;
                                    }
                                if (!flag) continue;
                            }
                            if (options.receivedOnly) {
                                let flag = false;
                                for (let vout of response.items[i].vout)
                                    if (vout.scriptPubKey.addresses[0] === addr) {
                                        flag = true;
                                        break;
                                    }
                                if (!flag) continue;
                            }
                            if (Array.isArray(options.receiver)) {
                                let flag = false;
                                for (let vout of response.items[i].vout)
                                    if (options.receiver.includes(vout.scriptPubKey.addresses[0])) {
                                        flag = true;
                                        break;
                                    }
                                if (!flag) continue;
                            }
                            if (options.filter && !options.filter(response.items[i].floData))
                                continue;

                            if (options.tx) {
                                let d = {}
                                d.txid = response.items[i].txid;
                                d.time = response.items[i].time;
                                d.blockheight = response.items[i].blockheight;
                                d.data = response.items[i].floData;
                                filteredData.push(d);
                            } else
                                filteredData.push(response.items[i].floData);
                        }
                        resolve({
                            totalTxs: response.totalItems - unconfirmedCount,
                            data: filteredData
                        });
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            });
        }
    }
})(typeof global !== "undefined" ? global : window);


/* Token Operator to send/receive tokens from blockchain using API calls*/
(function(GLOBAL) {
    const tokenAPI = GLOBAL.tokenAPI = {
        util: {
            parseTxData: tx => {
                let result = {};
                for (let p in tx.parsedFloData)
                    result[p] = tx.parsedFloData[p];
                result.sender = tx.transactionDetails.vin[0].addr;
                for (let vout of tx.transactionDetails.vout)
                    if (vout.scriptPubKey.addresses[0] !== sender)
                        result.receiver = vout.scriptPubKey.addresses[0];
                return result;
            }
        },
        fetch_api: function(apicall) {
            return new Promise((resolve, reject) => {
                console.log(floGlobals.tokenURL + apicall);
                fetch(floGlobals.tokenURL + apicall).then(response => {
                    if (response.ok)
                        response.json().then(data => resolve(data));
                    else
                        reject(response)
                }).catch(error => reject(error))
            })
        },
        getBalance: function(floID, token = floGlobals.currency) {
            return new Promise((resolve, reject) => {
                this.fetch_api(`api/v1.0/getFloAddressBalance?token=${token}&floAddress=${floID}`)
                    .then(result => resolve(result.balance || 0))
                    .catch(error => reject(error))
            })
        },
        getTx: function(txID) {
            return new Promise((resolve, reject) => {
                this.fetch_api(`api/v1.0/getTransactionDetails/${txID}`).then(res => {
                    if (res.result === "error")
                        reject(res.description);
                    else if (!res.parsedFloData)
                        reject("Data piece (parsedFloData) missing");
                    else if (!res.transactionDetails)
                        reject("Data piece (transactionDetails) missing");
                    else
                        resolve(res);
                }).catch(error => reject(error))
            })
        },
        sendToken: function(privKey, amount, receiverID, message = "", token = floGlobals.currency) {
            return new Promise((resolve, reject) => {
                let senderID = floCrypto.getFloID(privKey);
                if (typeof amount !== "number" || amount <= 0)
                    return reject("Invalid amount");
                this.getBalance(senderID, token).then(bal => {
                    if (amount > bal)
                        return reject("Insufficiant token balance");
                    floBlockchainAPI.writeData(senderID, `send ${amount} ${token}# ${message}`, privKey, receiverID)
                        .then(txid => resolve(txid))
                        .catch(error => reject(error))
                }).catch(error => reject(error))
            });
        }
    }
})(typeof global !== "undefined" ? global : window);

/* Compact IndexedDB operations */

window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

if (!window.indexedDB)
    window.alert("Your browser doesn't support a stable version of IndexedDB.")

const compactIDB = {

    setDefaultDB: function(dbName) {
        this.defaultDB = dbName;
    },

    upgradeDB: function(dbName, createList = null, deleteList = null) {
        return new Promise((resolve, reject) => {
            this.getDBversion(dbName).then(version => {
                var idb = indexedDB.open(dbName, version + 1);
                idb.onerror = (event) => reject("Error in opening IndexedDB");
                idb.onupgradeneeded = (event) => {
                    let db = event.target.result;
                    if (createList instanceof Object) {
                        if (Array.isArray(createList)) {
                            let tmp = {}
                            createList.forEach(o => tmp[o] = {})
                            createList = tmp
                        }
                        for (let o in createList) {
                            let obs = db.createObjectStore(o, createList[o].options || {});
                            if (createList[o].indexes instanceof Object)
                                for (let i in createList[o].indexes)
                                    obs.createIndex(i, i, createList[o].indexes || {});
                        }
                    }
                    if (Array.isArray(deleteList))
                        deleteList.forEach(o => db.deleteObjectStore(o));
                    resolve('Database upgraded')
                }
                idb.onsuccess = (event) => event.target.result.close();
            }).catch(error => reject(error))
        })
    },

    initDB: function(dbName, objectStores = {}) {
        return new Promise((resolve, reject) => {
            if (!(objectStores instanceof Object))
                return reject('ObjectStores must be an object or array')
            this.defaultDB = this.defaultDB || dbName;
            var idb = indexedDB.open(dbName);
            idb.onerror = (event) => reject("Error in opening IndexedDB");
            idb.onsuccess = (event) => {
                var db = event.target.result;
                let cList = Object.values(db.objectStoreNames);
                var obs = {},
                    a_obs = {},
                    d_obs = [];
                if (!Array.isArray(objectStores))
                    var obs = objectStores
                else
                    objectStores.forEach(o => obs[o] = {})
                let nList = Object.keys(obs)
                for (let o of nList)
                    if (!cList.includes(o))
                        a_obs[o] = obs[o]
                for (let o of cList)
                    if (!nList.includes(o))
                        d_obs.push(o)
                if (!Object.keys(a_obs).length && !d_obs.length)
                    resolve("Initiated IndexedDB");
                else
                    this.upgradeDB(dbName, a_obs, d_obs)
                    .then(result => resolve(result))
                    .catch(error => reject(error))
                db.close();
            }
        });
    },

    openDB: function(dbName = this.defaultDB) {
        return new Promise((resolve, reject) => {
            var idb = indexedDB.open(dbName);
            idb.onerror = (event) => reject("Error in opening IndexedDB");
            idb.onupgradeneeded = (event) => {
                event.target.result.close();
                this.deleteDB(dbName)
                reject("Datebase not found")
            }
            idb.onsuccess = (event) => resolve(event.target.result);
        });
    },

    deleteDB: function(dbName = this.defaultDB) {
        return new Promise((resolve, reject) => {
            var deleteReq = indexedDB.deleteDatabase(dbName);;
            deleteReq.onerror = (event) => reject("Error deleting database!");
            deleteReq.onsuccess = (event) => resolve("Database deleted successfully");
        });
    },

    getDBversion: function(dbName = this.defaultDB) {
        return new Promise((resolve, reject) => {
            this.openDB(dbName).then(db => {
                resolve(db.version)
                db.close()
            }).catch(error => reject(error))
        })
    },

    writeData: function(obsName, data, key = false, dbName = this.defaultDB) {
        return new Promise((resolve, reject) => {
            this.openDB(dbName).then(db => {
                var obs = db.transaction(obsName, "readwrite").objectStore(obsName);
                let writeReq = (key ? obs.put(data, key) : obs.put(data));
                writeReq.onsuccess = (evt) => resolve(`Write data Successful`);
                writeReq.onerror = (evt) => reject(
                    `Write data unsuccessful [${evt.target.error.name}] ${evt.target.error.message}`
                );
                db.close();
            }).catch(error => reject(error));
        });
    },

    addData: function(obsName, data, key = false, dbName = this.defaultDB) {
        return new Promise((resolve, reject) => {
            this.openDB(dbName).then(db => {
                var obs = db.transaction(obsName, "readwrite").objectStore(obsName);
                let addReq = (key ? obs.add(data, key) : obs.add(data));
                addReq.onsuccess = (evt) => resolve(`Add data successful`);
                addReq.onerror = (evt) => reject(
                    `Add data unsuccessful [${evt.target.error.name}] ${evt.target.error.message}`
                );
                db.close();
            }).catch(error => reject(error));
        });
    },

    removeData: function(obsName, key, dbName = this.defaultDB) {
        return new Promise((resolve, reject) => {
            this.openDB(dbName).then(db => {
                var obs = db.transaction(obsName, "readwrite").objectStore(obsName);
                let delReq = obs.delete(key);
                delReq.onsuccess = (evt) => resolve(`Removed Data ${key}`);
                delReq.onerror = (evt) => reject(
                    `Remove data unsuccessful [${evt.target.error.name}] ${evt.target.error.message}`
                );
                db.close();
            }).catch(error => reject(error));
        });
    },

    clearData: function(obsName, dbName = this.defaultDB) {
        return new Promise((resolve, reject) => {
            this.openDB(dbName).then(db => {
                var obs = db.transaction(obsName, "readwrite").objectStore(obsName);
                let clearReq = obs.clear();
                clearReq.onsuccess = (evt) => resolve(`Clear data Successful`);
                clearReq.onerror = (evt) => reject(`Clear data Unsuccessful`);
                db.close();
            }).catch(error => reject(error));
        });
    },

    readData: function(obsName, key, dbName = this.defaultDB) {
        return new Promise((resolve, reject) => {
            this.openDB(dbName).then(db => {
                var obs = db.transaction(obsName, "readonly").objectStore(obsName);
                let getReq = obs.get(key);
                getReq.onsuccess = (evt) => resolve(evt.target.result);
                getReq.onerror = (evt) => reject(
                    `Read data unsuccessful [${evt.target.error.name}] ${evt.target.error.message}`
                );
                db.close();
            }).catch(error => reject(error));
        });
    },

    readAllData: function(obsName, dbName = this.defaultDB) {
        return new Promise((resolve, reject) => {
            this.openDB(dbName).then(db => {
                var obs = db.transaction(obsName, "readonly").objectStore(obsName);
                var tmpResult = {}
                let curReq = obs.openCursor();
                curReq.onsuccess = (evt) => {
                    var cursor = evt.target.result;
                    if (cursor) {
                        tmpResult[cursor.primaryKey] = cursor.value;
                        cursor.continue();
                    } else
                        resolve(tmpResult);
                }
                curReq.onerror = (evt) => reject(
                    `Read-All data unsuccessful [${evt.target.error.name}] ${evt.target.error.message}`
                );
                db.close();
            }).catch(error => reject(error));
        });
    },

    /*searchData: function (obsName, options = {}, dbName = this.defaultDB) {
        
        return new Promise((resolve, reject) => {
            this.openDB(dbName).then(db => {
                var obs = db.transaction(obsName, "readonly").objectStore(obsName);
                var filteredResult = {}
                let keyRange;
                if(options.lowerKey!==null && options.upperKey!==null)
                    keyRange = IDBKeyRange.bound(options.lowerKey, options.upperKey);
                else if(options.lowerKey!==null)
                    keyRange = IDBKeyRange.lowerBound(options.lowerKey);
                else if (options.upperKey!==null)
                    keyRange = IDBKeyRange.upperBound(options.upperBound);
                else if (options.atKey)
                let curReq = obs.openCursor(keyRange, )
            }).catch(error => reject(error))
        })
    },*/

    searchData: function(obsName, options = {}, dbName = this.defaultDB) {
        options.lowerKey = options.atKey || options.lowerKey || 0
        options.upperKey = options.atKey || options.upperKey || false
        options.patternEval = options.patternEval || ((k, v) => {
            return true
        })
        options.limit = options.limit || false;
        options.lastOnly = options.lastOnly || false
        return new Promise((resolve, reject) => {
            this.openDB(dbName).then(db => {
                var obs = db.transaction(obsName, "readonly").objectStore(obsName);
                var filteredResult = {}
                let curReq = obs.openCursor(
                    options.upperKey ? IDBKeyRange.bound(options.lowerKey, options.upperKey) : IDBKeyRange.lowerBound(options.lowerKey),
                    options.lastOnly ? "prev" : "next");
                curReq.onsuccess = (evt) => {
                    var cursor = evt.target.result;
                    if (cursor) {
                        if (options.patternEval(cursor.primaryKey, cursor.value)) {
                            filteredResult[cursor.primaryKey] = cursor.value;
                            options.lastOnly ? resolve(filteredResult) : cursor.continue();
                        } else
                            cursor.continue();
                    } else
                        resolve(filteredResult);
                }
                curReq.onerror = (evt) => reject(`Search unsuccessful [${evt.target.error.name}] ${evt.target.error.message}`);
                db.close();
            }).catch(error => reject(error));
        });
    }
}

/* FLO Cloud operations to send/request application data*/
//floCloudAPI v2.1.3
const floCloudAPI = {

    util: {

        kBucket: {
            SNKB: null,
            SNCO: null,

            util: {
                decodeID(floID) {
                    let k = bitjs.Base58.decode(floID)
                    k.shift()
                    k.splice(-4, 4)
                    const decodedId = Crypto.util.bytesToHex(k);
                    const nodeIdBigInt = new BigInteger(decodedId, 16);
                    const nodeIdBytes = nodeIdBigInt.toByteArrayUnsigned();
                    const nodeIdNewInt8Array = new Uint8Array(nodeIdBytes);
                    return nodeIdNewInt8Array;
                },

                addNode: function(floID, KB) {
                    let decodedId = this.decodeID(floID);
                    const contact = {
                        id: decodedId,
                        floID: floID
                    };
                    KB.add(contact)
                },

                removeNode: function(floID, KB) {
                    let decodedId = this.decodeID(floID);
                    KB.remove(decodedId)
                },

                isPresent: function(floID, KB) {
                    let kArray = KB.toArray().map(k => k.floID);
                    return kArray.includes(floID)
                },

                distanceOf: function(floID, KB) {
                    let decodedId = this.decodeID(floID);
                    return KB.distance(KB.localNodeId, decodedId);
                },

                closestOf: function(floID, n, KB) {
                    let decodedId = this.decodeID(floID);
                    return KB.closest(decodedId, n)
                },

                constructKB: function(list, refID) {
                    const KBoptions = {
                        localNodeId: this.decodeID(refID)
                    };
                    let KB = new BuildKBucket(KBoptions);
                    for (let id of list)
                        this.addNode(id, KB)
                    return KB;
                }
            },

            launch: function() {
                return new Promise((resolve, reject) => {
                    try {
                        let superNodeList = Object.keys(floGlobals.supernodes);
                        let masterID = floGlobals.SNStorageID;
                        this.SNKB = this.util.constructKB(superNodeList, masterID);
                        this.SNCO = superNodeList.map(sn => [this.util.distanceOf(sn, this.SNKB),
                                sn
                            ])
                            .sort((a, b) => a[0] - b[0])
                            .map(a => a[1])
                        resolve('Supernode KBucket formed');
                    } catch (error) {
                        reject(error);
                    }
                });
            },

            innerNodes: function(id1, id2) {
                if (!this.SNCO.includes(id1) || !this.SNCO.includes(id2))
                    throw Error('Given nodes are not supernode');
                let iNodes = []
                for (let i = this.SNCO.indexOf(id1) + 1; this.SNCO[i] != id2; i++) {
                    if (i < this.SNCO.length)
                        iNodes.push(this.SNCO[i])
                    else i = -1
                }
                return iNodes
            },

            outterNodes: function(id1, id2) {
                if (!this.SNCO.includes(id1) || !this.SNCO.includes(id2))
                    throw Error('Given nodes are not supernode');
                let oNodes = []
                for (let i = this.SNCO.indexOf(id2) + 1; this.SNCO[i] != id1; i++) {
                    if (i < this.SNCO.length)
                        oNodes.push(this.SNCO[i])
                    else i = -1
                }
                return oNodes
            },

            prevNode: function(id, N = 1) {
                let n = N || this.SNCO.length;
                if (!this.SNCO.includes(id))
                    throw Error('Given node is not supernode');
                let pNodes = []
                for (let i = 0, j = this.SNCO.indexOf(id) - 1; i < n; j--) {
                    if (j == this.SNCO.indexOf(id))
                        break;
                    else if (j > -1)
                        pNodes[i++] = this.SNCO[j]
                    else j = this.SNCO.length
                }
                return (N == 1 ? pNodes[0] : pNodes)
            },

            nextNode: function(id, N = 1) {
                let n = N || this.SNCO.length;
                if (!this.SNCO.includes(id))
                    throw Error('Given node is not supernode');
                if (!n) n = this.SNCO.length;
                let nNodes = []
                for (let i = 0, j = this.SNCO.indexOf(id) + 1; i < n; j++) {
                    if (j == this.SNCO.indexOf(id))
                        break;
                    else if (j < this.SNCO.length)
                        nNodes[i++] = this.SNCO[j]
                    else j = -1
                }
                return (N == 1 ? nNodes[0] : nNodes)
            },

            closestNode: function(id, N = 1) {
                let decodedId = this.util.decodeID(id);
                let n = N || this.SNCO.length;
                let cNodes = this.SNKB.closest(decodedId, n)
                    .map(k => k.floID)
                return (N == 1 ? cNodes[0] : cNodes)
            }
        },

        inactive: new Set(),

        ws_connect(snID) {
            return new Promise((resolve, reject) => {
                if (!(snID in floGlobals.supernodes))
                    return reject(`${snID} is not a supernode`)
                let inactive = this.inactive
                if (inactive.has(snID))
                    return reject(`${snID} is not active`)
                var wsConn = new WebSocket("wss://" + floGlobals.supernodes[snID].uri + "/");
                wsConn.onopen = evt => resolve(wsConn);
                wsConn.onerror = evt => {
                    inactive.add(snID)
                    reject(`${snID} is unavailable`)
                }
            })
        },

        ws_activeConnect(snID, reverse = false) {
            return new Promise((resolve, reject) => {
                if (this.inactive.size === this.kBucket.SNCO.length)
                    return reject('Cloud offline');
                if (!(snID in floGlobals.supernodes))
                    snID = this.kBucket.closestNode(snID);
                this.ws_connect(snID)
                    .then(node => resolve(node))
                    .catch(error => {
                        if (reverse)
                            var nxtNode = this.kBucket.prevNode(snID);
                        else
                            var nxtNode = this.kBucket.nextNode(snID);
                        this.ws_activeConnect(nxtNode, reverse)
                            .then(node => resolve(node))
                            .catch(error => reject(error))
                    })
            })
        },

        fetch_API: function(snID, data) {
            return new Promise((resolve, reject) => {
                if (this.inactive.has(snID))
                    return reject(`${snID} is not active`);
                let fetcher, sn_url = "https://" + floGlobals.supernodes[snID].uri;
                if (typeof data === "string")
                    fetcher = fetch(sn_url + "?" + data);
                else if (typeof data === "object" && data.method === "POST")
                    fetcher = fetch(sn_url, data);
                fetcher.then(response => {
                    if (response.ok || response.status === 400 || response.status === 500)
                        resolve(response);
                    else
                        reject(response);
                }).catch(error => reject(error))
            })
        },

        fetch_ActiveAPI: function(snID, data, reverse = false) {
            return new Promise((resolve, reject) => {
                if (this.inactive.size === this.kBucket.SNCO.length)
                    return reject('Cloud offline');
                if (!(snID in floGlobals.supernodes))
                    snID = this.kBucket.closestNode(snID);
                this.fetch_API(snID, data)
                    .then(result => resolve(result))
                    .catch(error => {
                        this.inactive.add(snID)
                        if (reverse)
                            var nxtNode = this.kBucket.prevNode(snID);
                        else
                            var nxtNode = this.kBucket.nextNode(snID);
                        this.fetch_ActiveAPI(nxtNode, data, reverse)
                            .then(result => resolve(result))
                            .catch(error => reject(error));
                    })
            })
        },

        singleRequest: function(floID, data_obj, method = "POST") {
            return new Promise((resolve, reject) => {
                let data;
                if (method === "POST")
                    data = {
                        method: "POST",
                        body: JSON.stringify(data_obj)
                    };
                else
                    data = new URLSearchParams(JSON.parse(JSON.stringify(data_obj))).toString();
                this.fetch_ActiveAPI(floID, data).then(response => {
                    if (response.ok)
                        response.json()
                        .then(result => resolve(result))
                        .catch(error => reject(error))
                    else response.text()
                        .then(result => reject(response.status + ": " + result)) //Error Message from Node
                        .catch(error => reject(error))
                }).catch(error => reject(error))
            })
        },

        liveRequest: function(floID, request, callback) {
            let self = this;
            const filterData = typeof request.status !== 'undefined' ?
                data => {
                    if (request.status)
                        return data;
                    else {
                        let filtered = {};
                        for (let i in data)
                            if (request.trackList.includes(i))
                                filtered[i] = data[i];
                        return filtered;
                    }
                } :
                data => {
                    data = self.objectifier(data);
                    let filtered = {},
                        r = request;
                    for (let v in data) {
                        let d = data[v];
                        if ((!r.atVectorClock || r.atVectorClock == v) &&
                            (r.atVectorClock || !r.lowerVectorClock || r.lowerVectorClock <= v) &&
                            (r.atVectorClock || !r.upperVectorClock || r.upperVectorClock >= v) &&
                            (!r.afterTime || r.afterTime < d.log_time) &&
                            r.application == d.application &&
                            r.receiverID == d.receiverID &&
                            (!r.comment || r.comment == d.comment) &&
                            (!r.type || r.type == d.type) &&
                            (!r.senderID || r.senderID.includes(d.senderID)))
                            filtered[v] = data[v];
                    }
                    return filtered;
                };

            return new Promise((resolve, reject) => {
                self.ws_activeConnect(floID).then(node => {
                    let randID = floCrypto.randString(5);
                    node.send(JSON.stringify(request));
                    node.onmessage = (evt) => {
                        let d = e = null;
                        try {
                            d = filterData(JSON.parse(evt.data));
                        } catch (error) {
                            e = evt.data
                        } finally {
                            callback(d, e)
                        }
                    }
                    self.liveRequest[randID] = node;
                    self.liveRequest[randID].request = request;
                    resolve(randID);
                }).catch(error => reject(error));
            });
        },

        encodeMessage: function(message) {
            return btoa(unescape(encodeURIComponent(JSON.stringify(message))))
        },

        decodeMessage: function(message) {
            return JSON.parse(decodeURIComponent(escape(atob(message))))
        },

        filterKey: function(type, options) {
            return type + (options.comment ? ':' + options.comment : '') +
                '|' + (options.group || options.receiverID || floGlobals.adminID) +
                '|' + (options.application || floGlobals.application);
        },

        lastCommit: function(method, objName) {
            switch (method) {
                case "GET":
                    return JSON.parse(this.lastCommit[objName]);
                case "SET":
                    this.lastCommit[objName] = JSON.stringify(floGlobals.appObjects[objName]);
            }
        },

        updateObject: function(objectName, dataSet) {
            try {
                console.log(dataSet)
                let vcList = Object.keys(dataSet).sort();
                for (let vc of vcList) {
                    if (vc < floGlobals.lastVC[objectName] || dataSet[vc].type !== objectName)
                        continue;
                    switch (dataSet[vc].comment) {
                        case "RESET":
                            if (dataSet[vc].message.reset)
                                floGlobals.appObjects[objectName] = dataSet[vc].message.reset;
                            break;
                        case "UPDATE":
                            if (dataSet[vc].message.diff)
                                floGlobals.appObjects[objectName] = mergeDiff(floGlobals.appObjects[objectName], dataSet[vc].message.diff);
                    }
                    floGlobals.lastVC[objectName] = vc;
                }
                compactIDB.writeData("appObjects", floGlobals.appObjects[objectName], objectName);
                compactIDB.writeData("lastVC", floGlobals.lastVC[objectName], objectName);
            } catch (error) {
                console.error(error)
            }
        },

        storeGeneral: function(fk, dataSet) {
            try {
                console.log(dataSet)
                if (typeof floGlobals.generalData[fk] !== "object")
                    floGlobals.generalData[fk] = {}
                for (let vc in dataSet) {
                    floGlobals.generalData[fk][vc] = dataSet[vc];
                    if (dataSet[vc].log_time > floGlobals.lastVC[fk])
                        floGlobals.lastVC[fk] = dataSet[vc].log_time;
                }
                compactIDB.writeData("lastVC", floGlobals.lastVC[fk], fk)
                compactIDB.writeData("generalData", floGlobals.generalData[fk], fk)
            } catch (error) {
                console.error(error)
            }
        },

        objectifier: function(data) {
            if (!Array.isArray(data))
                data = [data];
            return Object.fromEntries(data.map(d => {
                d.message = this.decodeMessage(d.message);
                return [d.vectorClock, d];
            }));
        }
    },

    //set status as online for myFloID
    setStatus: function(options = {}) {
        return new Promise((resolve, reject) => {
            let callback = options.callback instanceof Function ? options.callback : (d, e) => console.debug(d, e);
            var request = {
                floID: myFloID,
                application: options.application || floGlobals.application,
                time: Date.now(),
                status: true,
                pubKey: myPubKey
            }
            let hashcontent = ["time", "application", "floID"].map(d => request[d]).join("|");
            request.sign = floCrypto.signData(hashcontent, myPrivKey);
            this.util.liveRequest(options.refID || floGlobals.adminID, request, callback)
                .then(result => resolve(result))
                .catch(error => reject(error))
        })
    },

    //request status of floID(s) in trackList
    requestStatus: function(trackList, options = {}) {
        return new Promise((resolve, reject) => {
            if (!Array.isArray(trackList))
                trackList = [trackList];
            let callback = options.callback instanceof Function ? options.callback : (d, e) => console.debug(d, e);
            let request = {
                status: false,
                application: options.application || floGlobals.application,
                trackList: trackList
            }
            this.util.liveRequest(options.refID || floGlobals.adminID, request, callback)
                .then(result => resolve(result))
                .catch(error => reject(error))
        })
    },

    //send any message to supernode cloud storage
    sendApplicationData: function(message, type, options = {}) {
        return new Promise((resolve, reject) => {
            var data = {
                senderID: myFloID,
                receiverID: options.receiverID || floGlobals.adminID,
                pubKey: myPubKey,
                message: this.util.encodeMessage(message),
                time: Date.now(),
                application: options.application || floGlobals.application,
                type: type,
                comment: options.comment || ""
            }
            let hashcontent = ["receiverID", "time", "application", "type", "message", "comment"]
                .map(d => data[d]).join("|")
            data.sign = floCrypto.signData(hashcontent, myPrivKey);
            this.util.singleRequest(data.receiverID, data)
                .then(result => resolve(result))
                .catch(error => reject(error))
        })
    },

    //request any data from supernode cloud
    requestApplicationData: function(type, options = {}) {
        return new Promise((resolve, reject) => {
            var request = {
                receiverID: options.receiverID || floGlobals.adminID,
                senderID: options.senderID || undefined,
                application: options.application || floGlobals.application,
                type: type,
                comment: options.comment || undefined,
                lowerVectorClock: options.lowerVectorClock || undefined,
                upperVectorClock: options.upperVectorClock || undefined,
                atVectorClock: options.atVectorClock || undefined,
                afterTime: options.afterTime || undefined,
                mostRecent: options.mostRecent || undefined,
            }

            if (options.callback instanceof Function) {
                this.util.liveRequest(request.receiverID, request, options.callback)
                    .then(result => resolve(result))
                    .catch(error => reject(error))
            } else {
                if (options.method === "POST")
                    request = {
                        time: Date.now(),
                        request
                    };
                this.util.singleRequest(request.receiverID, request, options.method || "GET")
                    .then(data => resolve(data)).catch(error => reject(error))
            }
        })
    },

    //(NEEDS UPDATE) delete data from supernode cloud (received only)
    deleteApplicationData: function(vectorClocks, options = {}) {
        return new Promise((resolve, reject) => {
            var delreq = {
                requestorID: myFloID,
                pubKey: myPubKey,
                time: Date.now(),
                delete: (Array.isArray(vectorClocks) ? vectorClocks : [vectorClocks]),
                application: options.application || floGlobals.application
            }
            let hashcontent = ["time", "application", "delete"]
                .map(d => delreq[d]).join("|")
            delreq.sign = floCrypto.signData(hashcontent, myPrivKey)
            this.util.singleRequest(delreq.requestorID, delreq).then(result => {
                let success = [],
                    failed = [];
                result.forEach(r => r.status === 'fulfilled' ?
                    success.push(r.value) : failed.push(r.reason));
                resolve({
                    success,
                    failed
                })
            }).catch(error => reject(error))
        })
    },

    //(NEEDS UPDATE) edit comment of data in supernode cloud (mutable comments only)
    editApplicationData: function(vectorClock, newComment, oldData, options = {}) {
        return new Promise((resolve, reject) => {
            let p0
            if (!oldData) {
                options.atVectorClock = vectorClock;
                options.callback = false;
                p0 = this.requestApplicationData(false, options)
            } else
                p0 = Promise.resolve({
                    vectorClock: {
                        ...oldData
                    }
                })
            p0.then(d => {
                if (d.senderID != myFloID)
                    return reject("Invalid requestorID")
                else if (!d.comment.startsWith("EDIT:"))
                    return reject("Data immutable")
                let data = {
                    requestorID: myFloID,
                    receiverID: d.receiverID,
                    time: Date.now(),
                    application: d.application,
                    edit: {
                        vectorClock: vectorClock,
                        comment: newComment
                    }
                }
                d.comment = data.edit.comment;
                let hashcontent = ["receiverID", "time", "application", "type", "message",
                        "comment"
                    ]
                    .map(x => d[x]).join("|")
                data.edit.sign = floCrypto.signData(hashcontent, myPrivKey)
                this.util.singleRequest(data.receiverID, data)
                    .then(result => resolve("Data comment updated"))
                    .catch(error => reject(error))
            })
        })
    },

    //tag data in supernode cloud (subAdmin access only)
    tagApplicationData: function(vectorClock, tag, options = {}) {
        return new Promise((resolve, reject) => {
            if (!floGlobals.subAdmins.includes(myFloID))
                return reject("Only subAdmins can tag data")
            var request = {
                receiverID: options.receiverID || floGlobals.adminID,
                requestorID: myFloID,
                pubKey: myPubKey,
                time: Date.now(),
                vectorClock: vectorClock,
                tag: tag,
            }
            let hashcontent = ["time", "vectorClock", 'tag'].map(d => request[d]).join("|");
            request.sign = floCrypto.signData(hashcontent, myPrivKey);
            this.util.singleRequest(request.receiverID, request)
                .then(result => resolve(result))
                .catch(error => reject(error))
        })
    },

    //note data in supernode cloud (receiver only or subAdmin allowed if receiver is adminID)
    noteApplicationData: function(vectorClock, note, options = {}) {
        return new Promise((resolve, reject) => {
            var request = {
                receiverID: options.receiverID || floGlobals.adminID,
                requestorID: myFloID,
                pubKey: myPubKey,
                time: Date.now(),
                vectorClock: vectorClock,
                note: note,
            }
            let hashcontent = ["time", "vectorClock", 'note'].map(d => request[d]).join("|");
            request.sign = floCrypto.signData(hashcontent, myPrivKey);
            this.util.singleRequest(request.receiverID, request)
                .then(result => resolve(result))
                .catch(error => reject(error))
        })
    },

    //send general data
    sendGeneralData: function(message, type, options = {}) {
        return new Promise((resolve, reject) => {
            if (options.encrypt) {
                let encryptionKey = options.encrypt === true ?
                    floGlobals.settings.encryptionKey : options.encrypt
                message = floCrypto.encryptData(JSON.stringify(message), encryptionKey)
            }
            this.sendApplicationData(message, type, options).then(result => {
                //options.comment = null;
                //var fk = this.util.filterKey(type, options)
                //this.util.storeGeneral(fk, result)
                resolve(result)
            }).catch(error => reject(error))
        })
    },

    //request general data
    requestGeneralData: function(type, options = {}) {
        return new Promise((resolve, reject) => {
            var fk = this.util.filterKey(type, options)
            floGlobals.lastVC[fk] = parseInt(floGlobals.lastVC[fk]) || 0;
            options.afterTime = options.afterTime || floGlobals.lastVC[fk];
            if (options.callback instanceof Function) {
                let new_options = Object.create(options)
                new_options.callback = (d, e) => {
                    this.util.storeGeneral(fk, d);
                    options.callback(d, e)
                }
                this.requestApplicationData(type, new_options)
                    .then(result => resolve(result))
                    .catch(error => reject(error))
            } else {
                this.requestApplicationData(type, options).then(dataSet => {
                    this.util.storeGeneral(fk, this.util.objectifier(dataSet))
                    resolve(dataSet)
                }).catch(error => reject(error))
            }
        })
    },

    //request an object data from supernode cloud
    requestObjectData: function(objectName, options = {}) {
        return new Promise((resolve, reject) => {
            options.lowerVectorClock = options.lowerVectorClock || floGlobals.lastVC[objectName] + 1;
            options.senderID = [false, null].includes(options.senderID) ? null :
                options.senderID || floGlobals.subAdmins;
            options.mostRecent = true;
            options.comment = 'RESET';
            let callback = null;
            if (options.callback instanceof Function) {
                callback = (d, e) => {
                    this.util.updateObject(objectName, d);
                    options.callback(d, e);
                }
                delete options.callback;
            }
            this.requestApplicationData(objectName, options).then(dataSet => {
                this.util.updateObject(objectName, this.util.objectifier(dataSet));
                delete options.comment;
                options.lowerVectorClock = floGlobals.lastVC[objectName] + 1;
                delete options.mostRecent;
                if (callback) {
                    let new_options = Object.create(options);
                    new_options.callback = callback;
                    this.requestApplicationData(objectName, new_options)
                        .then(result => resolve(result))
                        .catch(error => reject(error))
                } else {
                    this.requestApplicationData(objectName, options).then(dataSet => {
                        this.util.updateObject(objectName, this.util.objectifier(dataSet))
                        this.util.lastCommit("SET", objectName)
                        resolve(floGlobals.appObjects[objectName])
                    }).catch(error => reject(error))
                }
            }).catch(error => reject(error))
        })
    },

    closeRequest: function(requestID) {
        return new Promise((resolve, reject) => {
            let conn = this.util.liveRequest[requestID]
            if (!conn)
                return reject('Request not found')
            conn.onclose = evt => {
                delete this.util.liveRequest[requestID];
                resolve('Request connection closed')
            }
            conn.close()
        })
    },

    //reset or initialize an object and send it to cloud
    resetObjectData: function(objectName, options = {}) {
        return new Promise((resolve, reject) => {
            let message = {
                reset: floGlobals.appObjects[objectName]
            }
            options.comment = 'RESET';
            this.sendApplicationData(message, objectName, options).then(result => {
                this.util.lastCommit("SET", objectName)
                resolve(result)
            }).catch(error => reject(error))
        })
    },

    //update the diff and send it to cloud
    updateObjectData: function(objectName, options = {}) {
        return new Promise((resolve, reject) => {
            let message = {
                diff: findDiff(this.util.lastCommit("GET", objectName), floGlobals.appObjects[
                    objectName])
            }
            options.comment = 'UPDATE';
            this.sendApplicationData(message, objectName, options).then(result => {
                this.util.lastCommit("SET", objectName)
                resolve(result)
            }).catch(error => reject(error))
        })
    }
}

/*Kademlia DHT K-bucket implementation as a binary tree.*/
function BuildKBucket(options = {}) {
    this.localNodeId = options.localNodeId || window.crypto.getRandomValues(new Uint8Array(20))
    this.numberOfNodesPerKBucket = options.numberOfNodesPerKBucket || 20
    this.numberOfNodesToPing = options.numberOfNodesToPing || 3
    this.distance = options.distance || this.distance
    this.arbiter = options.arbiter || this.arbiter
    this.metadata = Object.assign({}, options.metadata)

    this.createNode = function() {
        return {
            contacts: [],
            dontSplit: false,
            left: null,
            right: null
        }
    }

    this.ensureInt8 = function(name, val) {
        if (!(val instanceof Uint8Array))
            throw new TypeError(name + ' is not a Uint8Array')
    }

    this.arrayEquals = function(array1, array2) {
        if (array1 === array2)
            return true
        if (array1.length !== array2.length)
            return false
        for (let i = 0, length = array1.length; i < length; ++i)
            if (array1[i] !== array2[i])
                return false
        return true
    }

    this.ensureInt8('option.localNodeId as parameter 1', this.localNodeId)
    this.root = this.createNode()

    this.arbiter = function(incumbent, candidate) {
        return incumbent.vectorClock > candidate.vectorClock ? incumbent : candidate
    }

    this.distance = function(firstId, secondId) {
        let distance = 0
        let i = 0
        const min = Math.min(firstId.length, secondId.length)
        const max = Math.max(firstId.length, secondId.length)
        for (; i < min; ++i)
            distance = distance * 256 + (firstId[i] ^ secondId[i])
        for (; i < max; ++i) distance = distance * 256 + 255
        return distance
    }

    this.add = function(contact) {
        this.ensureInt8('contact.id', (contact || {}).id)
        let bitIndex = 0
        let node = this.root
        while (node.contacts === null)
            node = this._determineNode(node, contact.id, bitIndex++)
        const index = this._indexOf(node, contact.id)
        if (index >= 0) {
            this._update(node, index, contact)
            return this
        }
        if (node.contacts.length < this.numberOfNodesPerKBucket) {
            node.contacts.push(contact)
            return this
        }
        if (node.dontSplit)
            return this
        this._split(node, bitIndex)
        return this.add(contact)
    }

    this.closest = function(id, n = Infinity) {
        this.ensureInt8('id', id)
        if ((!Number.isInteger(n) && n !== Infinity) || n <= 0)
            throw new TypeError('n is not positive number')
        let contacts = []
        for (let nodes = [this.root], bitIndex = 0; nodes.length > 0 && contacts.length < n;) {
            const node = nodes.pop()
            if (node.contacts === null) {
                const detNode = this._determineNode(node, id, bitIndex++)
                nodes.push(node.left === detNode ? node.right : node.left)
                nodes.push(detNode)
            } else
                contacts = contacts.concat(node.contacts)
        }
        return contacts
            .map(a => [this.distance(a.id, id), a])
            .sort((a, b) => a[0] - b[0])
            .slice(0, n)
            .map(a => a[1])
    }

    this.count = function() {
        let count = 0
        for (const nodes = [this.root]; nodes.length > 0;) {
            const node = nodes.pop()
            if (node.contacts === null)
                nodes.push(node.right, node.left)
            else
                count += node.contacts.length
        }
        return count
    }

    this._determineNode = function(node, id, bitIndex) {
        const bytesDescribedByBitIndex = bitIndex >> 3
        const bitIndexWithinByte = bitIndex % 8
        if ((id.length <= bytesDescribedByBitIndex) && (bitIndexWithinByte !== 0))
            return node.left
        const byteUnderConsideration = id[bytesDescribedByBitIndex]
        if (byteUnderConsideration & (1 << (7 - bitIndexWithinByte)))
            return node.right
        return node.left
    }

    this.get = function(id) {
        this.ensureInt8('id', id)
        let bitIndex = 0
        let node = this.root
        while (node.contacts === null)
            node = this._determineNode(node, id, bitIndex++)
        const index = this._indexOf(node, id)
        return index >= 0 ? node.contacts[index] : null
    }

    this._indexOf = function(node, id) {
        for (let i = 0; i < node.contacts.length; ++i)
            if (this.arrayEquals(node.contacts[i].id, id))
                return i
        return -1
    }

    this.remove = function(id) {
        this.ensureInt8('the id as parameter 1', id)
        let bitIndex = 0
        let node = this.root
        while (node.contacts === null)
            node = this._determineNode(node, id, bitIndex++)
        const index = this._indexOf(node, id)
        if (index >= 0)
            node.contacts.splice(index, 1)[0]
        return this
    }

    this._split = function(node, bitIndex) {
        node.left = this.createNode()
        node.right = this.createNode()
        for (const contact of node.contacts)
            this._determineNode(node, contact.id, bitIndex).contacts.push(contact)
        node.contacts = null
        const detNode = this._determineNode(node, this.localNodeId, bitIndex)
        const otherNode = node.left === detNode ? node.right : node.left
        otherNode.dontSplit = true
    }

    this.toArray = function() {
        let result = []
        for (const nodes = [this.root]; nodes.length > 0;) {
            const node = nodes.pop()
            if (node.contacts === null)
                nodes.push(node.right, node.left)
            else
                result = result.concat(node.contacts)
        }
        return result
    }

    this._update = function(node, index, contact) {
        if (!this.arrayEquals(node.contacts[index].id, contact.id))
            throw new Error('wrong index for _update')
        const incumbent = node.contacts[index]
        const selection = this.arbiter(incumbent, contact)
        if (selection === incumbent && incumbent !== contact) return
        node.contacts.splice(index, 1)
        node.contacts.push(selection)
    }
}

/*
Functions:
findDiff(original, updatedObj) returns an object with the added, deleted and updated differences  
mergeDiff(original, allDiff) returns a new object from original object merged with all differences (allDiff is returned object of findDiff)
*/
(function() {
    const isDate = d => d instanceof Date;
    const isEmpty = o => Object.keys(o).length === 0;
    const isObject = o => o != null && typeof o === 'object';
    const properObject = o => isObject(o) && !o.hasOwnProperty ? {
        ...o
    } : o;
    const getLargerArray = (l, r) => l.length > r.length ? l : r;

    const preserve = (diff, left, right) => {
        if (!isObject(diff)) return diff;
        return Object.keys(diff).reduce((acc, key) => {
            const leftArray = left[key];
            const rightArray = right[key];
            if (Array.isArray(leftArray) && Array.isArray(rightArray)) {
                const array = [...getLargerArray(leftArray, rightArray)];
                return {
                    ...acc,
                    [key]: array.reduce((acc2, item, index) => {
                        if (diff[key].hasOwnProperty(index)) {
                            acc2[index] = preserve(diff[key][index], leftArray[index], rightArray[index]); // diff recurse and check for nested arrays
                            return acc2;
                        }
                        delete acc2[index]; // no diff aka empty
                        return acc2;
                    }, array)
                };
            }
            return {
                ...acc,
                [key]: diff[key]
            };
        }, {});
    };

    const updatedDiff = (lhs, rhs) => {
        if (lhs === rhs) return {};
        if (!isObject(lhs) || !isObject(rhs)) return rhs;
        const l = properObject(lhs);
        const r = properObject(rhs);
        if (isDate(l) || isDate(r)) {
            if (l.valueOf() == r.valueOf()) return {};
            return r;
        }
        return Object.keys(r).reduce((acc, key) => {
            if (l.hasOwnProperty(key)) {
                const difference = updatedDiff(l[key], r[key]);
                if (isObject(difference) && isEmpty(difference) && !isDate(difference)) return acc;
                return {
                    ...acc,
                    [key]: difference
                };
            }
            return acc;
        }, {});
    };


    const diff = (lhs, rhs) => {
        if (lhs === rhs) return {}; // equal return no diff
        if (!isObject(lhs) || !isObject(rhs)) return rhs; // return updated rhs
        const l = properObject(lhs);
        const r = properObject(rhs);
        const deletedValues = Object.keys(l).reduce((acc, key) => {
            return r.hasOwnProperty(key) ? acc : {
                ...acc,
                [key]: null
            };
        }, {});
        if (isDate(l) || isDate(r)) {
            if (l.valueOf() == r.valueOf()) return {};
            return r;
        }
        return Object.keys(r).reduce((acc, key) => {
            if (!l.hasOwnProperty(key)) return {
                ...acc,
                [key]: r[key]
            }; // return added r key
            const difference = diff(l[key], r[key]);
            if (isObject(difference) && isEmpty(difference) && !isDate(difference)) return acc; // return no diff
            return {
                ...acc,
                [key]: difference
            }; // return updated key
        }, deletedValues);
    };

    const addedDiff = (lhs, rhs) => {
        if (lhs === rhs || !isObject(lhs) || !isObject(rhs)) return {};
        const l = properObject(lhs);
        const r = properObject(rhs);
        return Object.keys(r).reduce((acc, key) => {
            if (l.hasOwnProperty(key)) {
                const difference = addedDiff(l[key], r[key]);
                if (isObject(difference) && isEmpty(difference)) return acc;
                return {
                    ...acc,
                    [key]: difference
                };
            }
            return {
                ...acc,
                [key]: r[key]
            };
        }, {});
    };

    const arrayDiff = (lhs, rhs) => {
        if (lhs === rhs) return {}; // equal return no diff
        if (!isObject(lhs) || !isObject(rhs)) return rhs; // return updated rhs
        const l = properObject(lhs);
        const r = properObject(rhs);
        const deletedValues = Object.keys(l).reduce((acc, key) => {
            return r.hasOwnProperty(key) ? acc : {
                ...acc,
                [key]: null
            };
        }, {});
        if (isDate(l) || isDate(r)) {
            if (l.valueOf() == r.valueOf()) return {};
            return r;
        }
        if (Array.isArray(r) && Array.isArray(l)) {
            const deletedValues = l.reduce((acc, item, index) => {
                return r.hasOwnProperty(index) ? acc.concat(item) : acc.concat(null);
            }, []);
            return r.reduce((acc, rightItem, index) => {
                if (!deletedValues.hasOwnProperty(index)) {
                    return acc.concat(rightItem);
                }
                const leftItem = l[index];
                const difference = diff(rightItem, leftItem);
                if (isObject(difference) && isEmpty(difference) && !isDate(difference)) {
                    delete acc[index];
                    return acc; // return no diff
                }
                return acc.slice(0, index).concat(rightItem).concat(acc.slice(index + 1)); // return updated key
            }, deletedValues);
        }

        return Object.keys(r).reduce((acc, key) => {
            if (!l.hasOwnProperty(key)) return {
                ...acc,
                [key]: r[key]
            }; // return added r key
            const difference = diff(l[key], r[key]);
            if (isObject(difference) && isEmpty(difference) && !isDate(difference)) return acc; // return no diff
            return {
                ...acc,
                [key]: difference
            }; // return updated key
        }, deletedValues);
    };

    const deletedDiff = (lhs, rhs) => {
        if (lhs === rhs || !isObject(lhs) || !isObject(rhs)) return {};
        const l = properObject(lhs);
        const r = properObject(rhs);
        return Object.keys(l).reduce((acc, key) => {
            if (r.hasOwnProperty(key)) {
                const difference = deletedDiff(l[key], r[key]);
                if (isObject(difference) && isEmpty(difference)) return acc;
                return {
                    ...acc,
                    [key]: difference
                };
            }
            return {
                ...acc,
                [key]: null
            };
        }, {});
    };
    window.findDiff = (lhs, rhs) => ({
        added: addedDiff(lhs, rhs),
        deleted: deletedDiff(lhs, rhs),
        updated: updatedDiff(lhs, rhs),
    });

    const mergeRecursive = (obj1, obj2) => {
        for (var p in obj2) {
            try {
                if (obj2[p].constructor == Object)
                    obj1[p] = mergeRecursive(obj1[p], obj2[p]);
                // Property in destination object set; update its value.
                else if (Ext.isArray(obj2[p])) {
                    // obj1[p] = [];
                    if (obj2[p].length < 1)
                        obj1[p] = obj2[p];
                    else
                        obj1[p] = mergeRecursive(obj1[p], obj2[p]);
                } else
                    obj1[p] = obj2[p];
            } catch (e) {
                // Property in destination object not set; create it and set its value.
                obj1[p] = obj2[p];
            }
        }
        return obj1;
    }

    const cleanse = (obj) => {
        Object.keys(obj).forEach(key => {
            var value = obj[key];
            if (typeof value === "object" && value !== null) {
                // Recurse...
                cleanse(value);
                // ...and remove if now "empty" (NOTE: insert your definition of "empty" here)
                //if (!Object.keys(value).length) 
                //  delete obj[key];
            } else if (value === null)
                delete obj[key]; // null, remove it
        });
        if (obj.constructor.toString().indexOf("Array") != -1) {
            obj = obj.filter(function(el) {
                return el != null;
            });
        }
        return obj;
    }

    /*obj is original object or array, diff is the output of findDiff */
    window.mergeDiff = (obj, diff) => {
        if (Object.keys(diff.updated).length !== 0)
            obj = mergeRecursive(obj, diff.updated)
        if (Object.keys(diff.deleted).length !== 0) {
            obj = mergeRecursive(obj, diff.deleted)
            obj = cleanse(obj)
        }
        if (Object.keys(diff.added).length !== 0)
            obj = mergeRecursive(obj, diff.added)
        return obj
    }
})();

/* General functions for FLO Dapps*/
const floDapps = {

    util: {

        initIndexedDB: function() {
            return new Promise((resolve, reject) => {
                var obs_g = {
                    //general
                    lastTx: {},
                    //supernode (cloud list)
                    supernodes: {
                        indexes: {
                            uri: null,
                            pubKey: null
                        }
                    }
                }
                var obs_a = {
                    //login credentials
                    credentials: {},
                    //for Dapps
                    subAdmins: {},
                    settings: {},
                    appObjects: {},
                    generalData: {},
                    lastVC: {}
                }
                //add other given objectStores
                this.initIndexedDB.appObs = this.initIndexedDB.appObs || {}
                for (o in this.initIndexedDB.appObs)
                    if (!(o in obs_a))
                        obs_a[o] = this.initIndexedDB.appObs[o]
                Promise.all([
                    compactIDB.initDB(floGlobals.application, obs_a),
                    compactIDB.initDB("floDapps", obs_g)
                ]).then(result => {
                    compactIDB.setDefaultDB(floGlobals.application)
                    resolve("IndexedDB App Storage Initated Successfully")
                }).catch(error => reject(error));
            })
        },

        initUserDB: function(floID) {
            return new Promise((resolve, reject) => {
                var obs = {
                    contacts: {},
                    pubKeys: {},
                    messages: {}
                }
                compactIDB.initDB(`floDapps#${floID}`, obs).then(result => {
                    resolve("UserDB Initated Successfully")
                }).catch(error => reject('Init userDB failed'));
            })
        },

        loadUserDB: function(floID) {
            return new Promise((resolve, reject) => {
                var loadData = ["contacts", "pubKeys", "messages"]
                var promises = []
                for (var i = 0; i < loadData.length; i++)
                    promises[i] = compactIDB.readAllData(loadData[i], `floDapps#${floID}`)
                Promise.all(promises).then(results => {
                    for (var i = 0; i < loadData.length; i++)
                        floGlobals[loadData[i]] = results[i]
                    resolve("Loaded Data from userDB")
                }).catch(error => reject('Load userDB failed'))
            })
        },

        startUpFunctions: {

            readSupernodeListFromAPI: function() {
                return new Promise((resolve, reject) => {
                    compactIDB.readData("lastTx", floGlobals.SNStorageID, "floDapps").then(lastTx => {
                        floBlockchainAPI.readData(floGlobals.SNStorageID, {
                            ignoreOld: lastTx,
                            sentOnly: true,
                            pattern: "SuperNodeStorage"
                        }).then(result => {
                            for (var i = result.data.length - 1; i >= 0; i--) {
                                var content = JSON.parse(result.data[i]).SuperNodeStorage;
                                for (sn in content.removeNodes)
                                    compactIDB.removeData("supernodes", sn, "floDapps");
                                for (sn in content.newNodes)
                                    compactIDB.writeData("supernodes", content.newNodes[sn], sn, "floDapps");
                            }
                            compactIDB.writeData("lastTx", result.totalTxs, floGlobals.SNStorageID, "floDapps");
                            compactIDB.readAllData("supernodes", "floDapps").then(result => {
                                floGlobals.supernodes = result;
                                floCloudAPI.util.kBucket.launch()
                                    .then(result => resolve("Loaded Supernode list\n" + result))
                                    .catch(error => reject(error))
                            })
                        })
                    }).catch(error => reject(error))
                })
            },

            readAppConfigFromAPI: function() {
                return new Promise((resolve, reject) => {
                    compactIDB.readData("lastTx", `${floGlobals.application}|${floGlobals.adminID}`, "floDapps").then(lastTx => {
                        floBlockchainAPI.readData(floGlobals.adminID, {
                            ignoreOld: lastTx,
                            sentOnly: true,
                            pattern: floGlobals.application
                        }).then(result => {
                            for (var i = result.data.length - 1; i >= 0; i--) {
                                var content = JSON.parse(result.data[i])[floGlobals.application];
                                if (!content || typeof content !== "object")
                                    continue;
                                if (Array.isArray(content.removeSubAdmin))
                                    for (var j = 0; j < content.removeSubAdmin.length; j++)
                                        compactIDB.removeData("subAdmins", content.removeSubAdmin[j]);
                                if (Array.isArray(content.addSubAdmin))
                                    for (var k = 0; k < content.addSubAdmin.length; k++)
                                        compactIDB.writeData("subAdmins", true, content.addSubAdmin[k]);
                                if (content.settings)
                                    for (let l in content.settings)
                                        compactIDB.writeData("settings", content.settings[l], l)
                            }
                            compactIDB.writeData("lastTx", result.totalTxs, `${floGlobals.application}|${floGlobals.adminID}`, "floDapps");
                            compactIDB.readAllData("subAdmins").then(result => {
                                floGlobals.subAdmins = Object.keys(result);
                                compactIDB.readAllData("settings").then(result => {
                                    floGlobals.settings = result;
                                    resolve("Read app configuration from blockchain");
                                })
                            })
                        })
                    }).catch(error => reject(error))
                })
            },

            loadDataFromAppIDB: function() {
                return new Promise((resolve, reject) => {
                    var loadData = ["appObjects", "generalData", "lastVC"]
                    var promises = []
                    for (var i = 0; i < loadData.length; i++)
                        promises[i] = compactIDB.readAllData(loadData[i])
                    Promise.all(promises).then(results => {
                        for (var i = 0; i < loadData.length; i++)
                            floGlobals[loadData[i]] = results[i]
                        resolve("Loaded Data from app IDB")
                    }).catch(error => reject(error))
                })
            }
        },

        getCredentials: function() {

            const defaultInput = function(type) {
                return new Promise((resolve, reject) => {
                    let inputVal = prompt(`Enter ${type}: `)
                    if (inputVal === null)
                        reject(null)
                    else
                        resolve(inputVal)
                })
            }

            const inputFn = this.getCredentials.privKeyInput || defaultInput;

            const readSharesFromIDB = function(indexArr) {
                return new Promise((resolve, reject) => {
                    var promises = []
                    for (var i = 0; i < indexArr.length; i++)
                        promises.push(compactIDB.readData('credentials', indexArr[i]))
                    Promise.all(promises).then(shares => {
                        var secret = floCrypto.retrieveShamirSecret(shares)
                        if (secret)
                            resolve(secret)
                        else
                            reject("Shares are insufficient or incorrect")
                    }).catch(error => {
                        floDapps.clearCredentials();
                        location.reload();
                    })
                })
            }

            const writeSharesToIDB = function(shares, i = 0, resultIndexes = []) {
                return new Promise(resolve => {
                    if (i >= shares.length)
                        return resolve(resultIndexes)
                    var n = floCrypto.randInt(0, 100000)
                    compactIDB.addData("credentials", shares[i], n).then(res => {
                        resultIndexes.push(n)
                        writeSharesToIDB(shares, i + 1, resultIndexes)
                            .then(result => resolve(result))
                    }).catch(error => {
                        writeSharesToIDB(shares, i, resultIndexes)
                            .then(result => resolve(result))
                    })
                })
            }

            const getPrivateKeyCredentials = function() {
                return new Promise((resolve, reject) => {
                    var indexArr = localStorage.getItem(`${floGlobals.application}#privKey`)
                    if (indexArr) {
                        readSharesFromIDB(JSON.parse(indexArr))
                            .then(result => resolve(result))
                            .catch(error => reject(error))
                    } else {
                        var privKey;
                        inputFn("PRIVATE_KEY").then(result => {
                            if (!result)
                                return reject("Empty Private Key")
                            var floID = floCrypto.getFloID(result)
                            if (!floID || !floCrypto.validateAddr(floID))
                                return reject("Invalid Private Key")
                            privKey = result;
                        }).catch(error => {
                            console.log(error, "Generating Random Keys")
                            privKey = floCrypto.generateNewID().privKey
                        }).finally(_ => {
                            if (!privKey)
                                return;
                            var threshold = floCrypto.randInt(10, 20)
                            var shares = floCrypto.createShamirsSecretShares(privKey, threshold, threshold)
                            writeSharesToIDB(shares).then(resultIndexes => {
                                //store index keys in localStorage
                                localStorage.setItem(`${floGlobals.application}#privKey`, JSON.stringify(resultIndexes))
                                //also add a dummy privatekey to the IDB
                                var randomPrivKey = floCrypto.generateNewID().privKey
                                var randomThreshold = floCrypto.randInt(10, 20)
                                var randomShares = floCrypto.createShamirsSecretShares(randomPrivKey, randomThreshold, randomThreshold)
                                writeSharesToIDB(randomShares)
                                //resolve private Key
                                resolve(privKey)
                            })
                        })
                    }
                })
            }

            const checkIfPinRequired = function(key) {
                return new Promise((resolve, reject) => {
                    if (key.length == 52)
                        resolve(key)
                    else {
                        inputFn("PIN/Password").then(pwd => {
                            try {
                                let privKey = Crypto.AES.decrypt(key, pwd);
                                resolve(privKey)
                            } catch (error) {
                                reject("Access Denied: Incorrect PIN/Password")
                            }
                        }).catch(error => reject("Access Denied: PIN/Password required"))
                    }
                })
            }

            return new Promise((resolve, reject) => {
                getPrivateKeyCredentials().then(key => {
                    checkIfPinRequired(key).then(privKey => {
                        try {
                            myPrivKey = privKey
                            myPubKey = floCrypto.getPubKeyHex(myPrivKey)
                            myFloID = floCrypto.getFloID(myPubKey)
                            resolve('Login Credentials loaded successful')
                        } catch (error) {
                            console.log(error)
                            reject("Corrupted Private Key")
                        }
                    }).catch(error => reject(error))
                }).catch(error => reject(error))
            })
        },

        startUpLog: function(status, log) {
            if (status)
                console.log(log)
            else
                console.error(log)
        },

        callStartUpFunction: function(fname) {
            return new Promise((resolve, reject) => {
                this.startUpFunctions[fname]().then(result => {
                    this.callStartUpFunction.completed += 1
                    this.startUpLog(true, `${result}\nCompleted ${this.callStartUpFunction.completed}/${this.callStartUpFunction.total} Startup functions`)
                    resolve(true)
                }).catch(error => {
                    this.callStartUpFunction.failed += 1
                    this.startUpLog(false, `${error}\nFailed ${this.callStartUpFunction.failed}/${this.callStartUpFunction.total} Startup functions`)
                    reject(false)
                })
            })
        }
    },

    launchStartUp: function() {
        return new Promise((resolve, reject) => {
            this.util.initIndexedDB().then(log => {
                console.log(log)
                this.util.callStartUpFunction.total = Object.keys(this.util.startUpFunctions).length
                this.util.callStartUpFunction.completed = 0
                this.util.callStartUpFunction.failed = 0
                var p0 = []
                for (fn in this.util.startUpFunctions)
                    p0.push(this.util.callStartUpFunction(fn))
                const CnL = p => new Promise((res, rej) => {
                    p.then(r => {
                        this.util.startUpLog(true, r)
                        res(r)
                    }).catch(e => {
                        this.util.startUpLog(false, e)
                        rej(e)
                    })
                })
                const callMidStartup = () => new Promise((res, rej) => {
                    if (this.launchStartUp.midFunction instanceof Function) {
                        this.launchStartUp.midFunction()
                            .then(r => res("Mid startup function completed"))
                            .catch(e => rej("Mid startup function failed"))
                    } else
                        res("No mid startup function")
                })
                let p1 = new Promise((res, rej) => {
                    Promise.all(p0).then(r => {
                        CnL(callMidStartup())
                            .then(r => res(true))
                            .catch(e => rej(false))
                    })
                });
                let p2 = new Promise((res, rej) => {
                    CnL(this.util.getCredentials()).then(r => {
                        CnL(this.util.initUserDB(myFloID)).then(r => {
                            CnL(this.util.loadUserDB(myFloID))
                                .then(r => res(true))
                                .catch(e => rej(false))
                        }).catch(e => rej(false))
                    }).catch(e => rej(false))
                })
                Promise.all([p1, p2])
                    .then(r => resolve('App Startup finished successful'))
                    .catch(e => reject('App Startup failed'))
            }).catch(error => reject("App database initiation failed"))
        })
    },

    addStartUpFunction: function(fname, fn) {
        if (fname in this.util.startUpFunctions)
            throw (`Function ${fname} already defined`)
        this.util.startUpFunctions[fname] = fn;
    },

    setMidStartup: function(fn) {
        if (fn instanceof Function)
            this.launchStartUp.midFunction = fn;
    },

    setCustomStartupLogger: function(logger) {
        this.util.startUpLog = logger;
    },

    setCustomPrivKeyInput: function(customFn) {
        this.util.getCredentials.privKeyInput = customFn
    },

    setAppObjectStores: function(appObs) {
        this.util.initIndexedDB.appObs = appObs
    },

    storeContact(floID, name) {
        return new Promise((resolve, reject) => {
            if (!floCrypto.validateAddr(floID))
                return reject("Invalid floID!")
            compactIDB.writeData("contacts", name, floID, `floDapps#${myFloID}`).then(result => {
                floGlobals.contacts[floID] = name;
                resolve("Contact stored")
            }).catch(error => reject(error))
        });
    },

    storePubKey(floID, pubKey) {
        return new Promise((resolve, reject) => {
            if (floID in floGlobals.pubKeys)
                return resolve("pubKey already stored")
            if (!floCrypto.validateAddr(floID))
                return reject("Invalid floID!")
            if (floCrypto.getFloID(pubKey) != floID)
                return reject("Incorrect pubKey")
            compactIDB.writeData("pubKeys", pubKey, floID, `floDapps#${myFloID}`).then(result => {
                floGlobals.pubKeys[floID] = pubKey;
                resolve("pubKey stored")
            }).catch(error => reject(error))
        });
    },

    sendMessage(floID, message) {
        return new Promise((resolve, reject) => {
            let options = {
                receiverID: floID,
                application: "floDapps",
                comment: floGlobals.application
            }
            if (floID in floGlobals.pubKeys)
                message = floCrypto.encryptData(JSON.stringify(message), floGlobals.pubKeys[floID])
            floCloudAPI.sendApplicationData(message, "Message", options)
                .then(result => resolve(result))
                .catch(error => reject(error))
        })
    },

    requestInbox(callback) {
        return new Promise((resolve, reject) => {
            let lastVC = Object.keys(floGlobals.messages).sort().pop()
            let options = {
                receiverID: myFloID,
                application: "floDapps",
                lowerVectorClock: lastVC + 1
            }
            options.callback = (d, e) => {
                for (let v in d) {
                    try {
                        if (d[v].message instanceof Object && "secret" in d[v].message)
                            d[v].message = floCrypto.decryptData(d[v].message, myPrivKey)
                    } catch (error) {}
                    compactIDB.writeData("messages", d[v], v, `floDapps#${myFloID}`)
                    floGlobals.messages[v] = d[v]
                }
                if (callback instanceof Function)
                    callback(d, e)
            }
            floCloudAPI.requestApplicationData("Message", options)
                .then(result => resolve(result))
                .catch(error => reject(error))
        })
    },

    manageAppConfig(adminPrivKey, addList, rmList, settings) {
        return new Promise((resolve, reject) => {
            if (!Array.isArray(addList) || !addList.length) addList = undefined;
            if (!Array.isArray(rmList) || !rmList.length) rmList = undefined;
            if (!settings || typeof settings !== "object" || !Object.keys(settings).length) settings = undefined;
            if (!addList && !rmList && !settings)
                return reject("No configuration change")
            var floData = {
                [floGlobals.application]: {
                    addSubAdmin: addList,
                    removeSubAdmin: rmList,
                    settings: settings
                }
            }
            var floID = floCrypto.getFloID(adminPrivKey)
            if (floID != floGlobals.adminID)
                reject('Access Denied for Admin privilege')
            else
                floBlockchainAPI.writeData(floID, JSON.stringify(floData), adminPrivKey)
                .then(result => resolve(['Updated App Configuration', result]))
                .catch(error => reject(error))
        })
    },

    clearCredentials: function() {
        return new Promise((resolve, reject) => {
            compactIDB.clearData('credentials', floGlobals.application).then(result => {
                localStorage.removeItem(`${floGlobals.application}#privKey`)
                myPrivKey = myPubKey = myFloID = undefined;
                resolve("privKey credentials deleted!")
            }).catch(error => reject(error))
        })
    },

    deleteUserData: function(credentials = false) {
        return new Promise((resolve, reject) => {
            let p = []
            p.push(compactIDB.deleteDB(`floDapps#${myFloID}`))
            if (credentials)
                p.push(this.clearCredentials())
            Promise.all(p)
                .then(result => resolve('User database(local) deleted'))
                .catch(error => reject(error))
        })
    },

    deleteAppData: function() {
        return new Promise((resolve, reject) => {
            compactIDB.deleteDB(floGlobals.application).then(result => {
                localStorage.removeItem(`${floGlobals.application}#privKey`)
                myPrivKey = myPubKey = myFloID = undefined;
                compactIDB.removeData('lastTx', `${floGlobals.application}|${floGlobals.adminID}`, 'floDapps')
                    .then(result => resolve("App database(local) deleted"))
                    .catch(error => reject(error))
            }).catch(error => reject(error))
        })
    },

    securePrivKey: function(pwd) {
        return new Promise((resolve, reject) => {
            let indexArr = localStorage.getItem(`${floGlobals.application}#privKey`)
            if (!indexArr)
                return reject("PrivKey not found");
            indexArr = JSON.parse(indexArr)
            let encryptedKey = Crypto.AES.encrypt(myPrivKey, pwd);
            let threshold = indexArr.length;
            let shares = floCrypto.createShamirsSecretShares(encryptedKey, threshold, threshold)
            let promises = [];
            let overwriteFn = (share, index) =>
                compactIDB.writeData("credentials", share, index, floGlobals.application);
            for (var i = 0; i < threshold; i++)
                promises.push(overwriteFn(shares[i], indexArr[i]));
            Promise.all(promises)
                .then(results => resolve("Private Key Secured"))
                .catch(error => reject(error))
        })
    },

    verifyPin: function(pin = null) {
        const readSharesFromIDB = function(indexArr) {
            return new Promise((resolve, reject) => {
                var promises = []
                for (var i = 0; i < indexArr.length; i++)
                    promises.push(compactIDB.readData('credentials', indexArr[i]))
                Promise.all(promises).then(shares => {
                    var secret = floCrypto.retrieveShamirSecret(shares)
                    console.info(shares, secret)
                    if (secret)
                        resolve(secret)
                    else
                        reject("Shares are insufficient or incorrect")
                }).catch(error => {
                    floDapps.clearCredentials();
                    location.reload();
                })
            })
        }
        return new Promise((resolve, reject) => {
            var indexArr = localStorage.getItem(`${floGlobals.application}#privKey`)
            console.info(indexArr)
            if (!indexArr)
                reject('No login credentials found')
            readSharesFromIDB(JSON.parse(indexArr)).then(key => {
                if (key.length == 52) {
                    if (pin === null)
                        resolve("Private key not secured")
                    else
                        reject("Private key not secured")
                } else {
                    if (pin === null)
                        return reject("PIN/Password required")
                    try {
                        let privKey = Crypto.AES.decrypt(key, pin);
                        resolve("PIN/Password verified")
                    } catch (error) {
                        reject("Incorrect PIN/Password")
                    }
                }
            }).catch(error => reject(error))
        })


    },

    getNextGeneralData: function(type, vectorClock = null, options = {}) {
        var fk = floCloudAPI.util.filterKey(type, options)
        vectorClock = vectorClock || this.getNextGeneralData[fk] || '0';
        var filteredResult = {}
        if (floGlobals.generalData[fk]) {
            for (let d in floGlobals.generalData[fk])
                if (d > vectorClock)
                    filteredResult[d] = JSON.parse(JSON.stringify(floGlobals.generalData[fk][d]))
        } else if (options.comment) {
            let comment = options.comment;
            delete options.comment;
            let fk = floCloudAPI.util.filterKey(type, options);
            for (let d in floGlobals.generalData[fk])
                if (d > vectorClock && floGlobals.generalData[fk][d].comment == comment)
                    filteredResult[d] = JSON.parse(JSON.stringify(floGlobals.generalData[fk][d]))
        }
        if (options.decrypt) {
            let decryptionKey = (options.decrypt === true) ? myPrivKey : options.decrypt;
            if (!Array.isArray(decryptionKey))
                decryptionKey = [decryptionKey];
            for (let f in filteredResult) {
                let data = filteredResult[f]
                try {
                    if (data.message instanceof Object && "secret" in data.message) {
                        for (let key of decryptionKey) {
                            try {
                                let tmp = floCrypto.decryptData(data.message, key)
                                data.message = JSON.parse(tmp)
                                break;
                            } catch (error) {}
                        }
                    }
                } catch (error) {}
            }
        }
        this.getNextGeneralData[fk] = Object.keys(filteredResult).sort().pop();
        return filteredResult;
    },

    syncData: {
        oldDevice: function() {
            return new Promise((resolve, reject) => {
                let sync = {
                    contacts: floGlobals.contacts,
                    pubKeys: floGlobals.pubKeys,
                    messages: floGlobals.messages
                }
                let message = Crypto.AES.encrypt(JSON.stringify(sync), myPrivKey)
                let options = {
                    receiverID: myFloID,
                    application: "floDapps"
                }
                floCloudAPI.sendApplicationData(message, "syncData", options)
                    .then(result => resolve(result))
                    .catch(error => reject(error))
            })
        },

        newDevice() {
            return new Promise((resolve, reject) => {
                var options = {
                    receiverID: myFloID,
                    senderIDs: myFloID,
                    application: "floDapps",
                    mostRecent: true,
                }
                floCloudAPI.requestApplicationData("syncData", options).then(response => {
                    let vc = Object.keys(response).sort().pop()
                    let sync = JSON.parse(Crypto.AES.decrypt(response[vc].message, myPrivKey))
                    let promises = []
                    let store = (key, val, obs) => promises.push(compactIDB.writeData(obs, val, key, `floDapps#${floID}`));
                    ["contacts", "pubKeys", "messages"].forEach(c => {
                        for (let i in sync[c]) {
                            store(i, sync[c][i], c)
                            floGlobals[c][i] = sync[c][i]
                        }
                    })
                    Promise.all(promises)
                        .then(results => resolve("Sync data successful"))
                        .catch(error => reject(error))
                }).catch(error => reject(error))
            })
        }
    }
}