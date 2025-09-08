import {addRoundKey, inputFixer, mixColumns,shiftRows, subBytes} from "./helpers";
import {INV_SBOX, SBOX} from "./Sbox";
import { randomBytes } from 'node:crypto';

const RCON = new Uint8Array([0x00,0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1B,0x36]);

export const encryptWithRound = (state: Uint8Array, subkeyArray: Uint8Array[], round: number): Uint8Array => {

    addRoundKey(state, inputFixer(subkeyArray[0]));

    // rounds
    for(let i = 1; i < round+1; i++) {
//        console.log(i + "th round begins");

        subBytes(state);
//        console.log("After SBox");
//        PrintState(state);

        shiftRows(state);
//        console.log("After Shift rows");
//        PrintState(state);

        if( i != round) {
            mixColumns(state);
//            console.log("After mix ");
//            PrintState(state);
        }

        addRoundKey(state, inputFixer(subkeyArray[i]));
//        console.log("After addRoundKey");
//        PrintState(state);

//        console.log("----------- Round " + i + " Ends -----------");

    }
    return state;
}

export const setup = (): Uint8Array[] => {
    let stateArray: Uint8Array[] = [];
    for(let i=0; i < 256; i++) {
        stateArray[i] = new Uint8Array([parseInt(i.toString(16),16), 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00,]);
    }
    console.log("Setup has finished");
    return stateArray;
}

export const setupRandom = (index?: number): Uint8Array[] => {
    let stateArray: Uint8Array[] = [];
    let randomArray = new Uint8Array(randomBytes(16));
    if(index === undefined || index == null) {
        let index = Math.floor(Math.random() * (16));
    }
    for(let i= 0; i < 256; i++) {
        let newArray: Uint8Array = new Uint8Array(16);
        for (let j = 0; j < randomArray.length; j++) {
            newArray[j] = randomArray[j];
        }
        // @ts-ignore
        newArray[index] = i;
        stateArray[i] = newArray;

    }
    console.log("Setup has finished");
    return stateArray;
}

// Revert
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

export const deltaSetVerifier = (stateArray: Uint8Array[], index:number): boolean => {
    let result = stateArray[0][index];
    for(let i = 1; i < stateArray.length; i++){
        result ^= stateArray[i][0];
    }
    if(!result) {
        console.log("Delta Set property is preserved");
        return true;
    }
    else {
        console.log("Delta Set property is lost");
        return false;
    }
}
// for a given position, try a byte
export const tryByte = (stateArray: Uint8Array[], index: number, byte: number) => {
    let numberArray: number[] = [];
    for(let i = 0; i < stateArray.length; i++){
        let num = (stateArray[i][index] ^ byte)
        // according to the index, there will be something here
        numberArray.push(INV_SBOX[num]);
    }
    let result = numberArray[0];
    for(let i = 1; i < numberArray.length; i++){
        result ^= numberArray[i];
    }
    if (!result) {
        return true;
    }
}

export const tryBytes = (stateArray: Uint8Array[], index: number): number[] => {
    let possibleNumbers: number[] = [];
    for(let i = 0; i < 256; i++){
        if(tryByte(stateArray, index, i)) {
            possibleNumbers.push(i);
        }
    }
    return possibleNumbers;
}

export const findAllKey = (key: Uint8Array, round: number): Uint8Array[] => {
    let result: Uint8Array[] = [];
    result[0] = key;
    for(let i = 1; i < round+1; i++) {
        result[i] = prevRoundKey(result[i-1], round -i + 1);
    }
    return result.reverse();
}

const rotWord = (w: Uint8Array) => new Uint8Array([w[1], w[2], w[3], w[0]]);
const subWord = (w: Uint8Array) => new Uint8Array([SBOX[w[0]], SBOX[w[1]], SBOX[w[2]], SBOX[w[3]]]);
export const prevRoundKey = (key: Uint8Array, round: number): Uint8Array => {

    // revert addition
    const W4 = key.slice(0, 4);
    const W5 = key.slice(4, 8);
    const W6 = key.slice(8, 12);
    const W7 = key.slice(12, 16);

    const W3 = xor4(W6, W7);
    const W2 = xor4(W5, W6);
    const W1 = xor4(W4, W5);

    // We know that W0 XOR (W3 altered) = W4 xor RCON
    W4[0] ^= RCON[round];
    let W3_Altered = rotWord(W3);
    W3_Altered = subWord(W3_Altered);
    const W0 = xor4(W4, W3_Altered);

    const out = new Uint8Array(16);
    out.set(W0, 0); out.set(W1, 4); out.set(W2, 8); out.set(W3, 12);
    return out;

}
function xor4(a: Uint8Array, b: Uint8Array): Uint8Array {
    return new Uint8Array([a[0]^b[0], a[1]^b[1], a[2]^b[2], a[3]^b[3]]);
}
