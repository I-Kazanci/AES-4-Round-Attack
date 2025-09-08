import { randomBytes } from 'node:crypto';
import { SBOX, multiplication_by_2, multiplication_by_3} from "./Sbox";

export const KeyGenerator = (length: 128 | 192 | 256): Uint8Array => {
    return new Uint8Array(randomBytes(length / 8));
};

export const SubkeysGenerator = (key: Uint8Array): Uint8Array[] => {
    let subkeyArray: Uint8Array[] = [];
    subkeyArray[0] = key;
    for(let i = 1; i < 11; ++i) {
        subkeyArray[i] = nextRoundKeyAES128(subkeyArray[i-1], i);
    }

    return subkeyArray;
}

export const PrintHex = (a: Uint8Array) =>
    console.log(Array.from(a, b => b.toString(16).padStart(2, '0')).join(' '));

export const toHex = (x: number) => x.toString(16).padStart(2, "0");


export const PrintState = (state: Uint8Array) => {
    console.log(
        toHex(state[0]), toHex(state[1]), toHex(state[2]),  toHex(state[3])
    );
    console.log(
        toHex(state[4]), toHex(state[5]), toHex(state[6]),  toHex(state[7])
    );
    console.log(
        toHex(state[8]), toHex(state[9]), toHex(state[10]), toHex(state[11])
    );
    console.log(
        toHex(state[12]), toHex(state[13]), toHex(state[14]), toHex(state[15])
    );
};

//  Key schedule
// RCON[1..10] for AES-128:
const RCON = new Uint8Array([0x00,0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1B,0x36]);
// SBOX: use the table we set earlier

const rotWord = (w: Uint8Array) => new Uint8Array([w[1], w[2], w[3], w[0]]);
const subWord = (w: Uint8Array) => new Uint8Array([SBOX[w[0]], SBOX[w[1]], SBOX[w[2]], SBOX[w[3]]]);

export function nextRoundKeyAES128(prevKey: Uint8Array, round: number): Uint8Array {
    // prevKey: 16 bytes (W0||W1||W2||W3)
    const W0 = prevKey.slice(0, 4);
    const W1 = prevKey.slice(4, 8);
    const W2 = prevKey.slice(8, 12);
    const W3 = prevKey.slice(12, 16);            // keep ORIGINAL W3

    // T = SubWord(RotWord(W3)) ^ [RCON[round],0,0,0]
    let T = rotWord(W3);
    T = subWord(T);
    T[0] ^= RCON[round];

    const W4 = xor4(W0, T);
    const W5 = xor4(W1, W4);
    const W6 = xor4(W2, W5);
    const W7 = xor4(W3, W6);

    const out = new Uint8Array(16);
    out.set(W4, 0); out.set(W5, 4); out.set(W6, 8); out.set(W7, 12);
    return out;
}

function xor4(a: Uint8Array, b: Uint8Array): Uint8Array {
    return new Uint8Array([a[0]^b[0], a[1]^b[1], a[2]^b[2], a[3]^b[3]]);
}

// AES STEPS
export const subBytes = (state: Uint8Array): void => {
    for (let i = 0; i < state.length; i++) {
        state[i] = SBOX[state[i]];
    }
};
export const shiftRows = (s: Uint8Array): void => {
    let t = s[4];
    s[4] = s[5]; s[5] = s[6]; s[6] = s[7]; s[7] = t;
    t = s[8];
    let t2 = s[9];
    s[8] = s[10]; s[9] = s[11]; s[10] = t; s[11] = t2;
    t = s[15];
    s[15] = s[14]; s[14] = s[13]; s[13] = s[12]; s[12] = t;
};

export const mixColumns = (s: Uint8Array): void => {
    columnMixer(s[0], s[4], s[8], s[12], s, 0);
    columnMixer(s[1], s[5], s[9], s[13], s, 1);
    columnMixer(s[2], s[6], s[10], s[14], s, 2);
    columnMixer(s[3], s[7], s[11], s[15], s, 3);
}

const columnMixer = (num0: number, num1: number, num2: number, num3: number, s: Uint8Array, offset: number): void => {
    s[offset] = multiplication_by_2[num0] ^ multiplication_by_3[num1] ^ num2 ^ num3;
    s[offset+4] = num0 ^ multiplication_by_2[num1] ^ multiplication_by_3[num2] ^ num3;
    s[offset+8] = num0 ^ num1 ^ multiplication_by_2[num2] ^ multiplication_by_3[num3];
    s[offset+12] = multiplication_by_3[num0] ^ num1 ^ num2 ^ multiplication_by_2[num3];
}

export const addRoundKey = (s: Uint8Array, key: Uint8Array): void => {
//    console.log("XOR ing")
//    PrintState(s)
//    console.log("With")
//    PrintState(key);
    for (let i = 0; i < key.length; i++) {
        s[i] = s[i] ^ key[i];
    }
}

export const encrypt = (state: Uint8Array, subkeyArray: Uint8Array[]): Uint8Array => {

    console.log("Initial State of the sentence is");
    PrintState(state);
    // pre-whitening
    addRoundKey(state, inputFixer(subkeyArray[0]));
    console.log("After whitening");
    PrintState(state);

    // rounds
    for(let i = 1; i < subkeyArray.length; i++) {
        console.log(i + "th round begins");

        subBytes(state);
        console.log("After SBox");
        PrintState(state);

        shiftRows(state);
        console.log("After Shift rows");
        PrintState(state);

        if( i != subkeyArray.length-1) {
            mixColumns(state);
            console.log("After mix ");
            PrintState(state);
        }

        addRoundKey(state, inputFixer(subkeyArray[i]));
        console.log("After addRoundKey");
        PrintState(state);

        console.log("----------- Round " + i + " Ends -----------");

    }
    return state;
}

export const oneTurn = (state: Uint8Array, key: Uint8Array): Uint8Array => {
    console.log("Initial State of the sentence is");
    PrintState(state);


    subBytes(state);
    console.log("After SBox");
    PrintState(state);

    shiftRows(state);
    console.log("After Shift rows");
    PrintState(state);

    mixColumns(state);
    console.log("After mix ");
    PrintState(state);

    addRoundKey(state, key);
    console.log("After addRoundKey");
    PrintState(state);

    console.log("----------- Round Ends -----------");

    return state;
}

// Decryption
export const invShiftRows = (s: Uint8Array): void => {
    // row 1: right shift by 1
    let t = s[7];
    s[7] = s[6]; s[6] = s[5]; s[5] = s[4]; s[4] = t;

    // row 2: right shift by 2 (same as left shift by 2)
    t = s[8];
    let t2 = s[9];
    s[8] = s[10]; s[9] = s[11]; s[10] = t; s[11] = t2;

    // row 3: right shift by 3 (== left shift by 1)
    t = s[12];
    s[12] = s[13]; s[13] = s[14]; s[14] = s[15]; s[15] = t;
};
export const inputFixer = (input: Uint8Array): Uint8Array => {
    let fixed = new Uint8Array(16);
    fixed[0] = input[0];
    fixed[1] = input[4];
    fixed[2] = input[8];
    fixed[3] = input[12];
    fixed[4] = input[1];
    fixed[5] = input[5];
    fixed[6] = input[9];
    fixed[7] = input[13];
    fixed[8] = input[2];
    fixed[9] = input[6];
    fixed[10] = input[10];
    fixed[11] = input[14];
    fixed[12] = input[3];
    fixed[13] = input[7];
    fixed[14] = input[11];
    fixed[15] = input[15];
    return fixed
}