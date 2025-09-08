import {KeyGenerator, PrintHex, SubkeysGenerator, toHex} from "./helpers";
import {setup, setupRandom, tryBytes, findAllKey} from "./attackRelated";
import {encryptAll} from "./client";

let hashMap: Map<number, number> = new Map();
hashMap.set(1, 0);
hashMap.set(2, 0);
hashMap.set(3, 0);
hashMap.set(4, 0);
hashMap.set(5, 0);
hashMap.set(6, 0);

export const byteFinder = (stateArray: Uint8Array[],  subkeyArray: Uint8Array[],index: number): number => {
    let possibleNumbers: number[] = tryBytes(stateArray, index);
    console.log( index + "th byte might be " + possibleNumbers.map( (num) => toHex(num)));
    let j = 1;
    while(possibleNumbers.length > 1) {
        let plainTexts: Uint8Array[] = setupRandom(index);
        let cipherTexts: Uint8Array[] = encryptAll(plainTexts, subkeyArray, 4);
        let candidateBytes: number[] = tryBytes(cipherTexts, index)
        possibleNumbers = possibleNumbers.filter( (num) => candidateBytes.includes(num));
        j++;
    }
    console.log("The byte in index " + index + " is " + toHex(possibleNumbers[0]));
    console.log("I have done " + j + " try for this");
    // @ts-ignore
    hashMap.set(j, hashMap.get(j) + 1);
    return (possibleNumbers[0]);
}
// console.log("Generating a random key")
const key = KeyGenerator(128);
const exampleKey = new Uint8Array([0x2b,0x7e,0x15,0x16,0x28,0xae,0xd2,0xa6,0xab,0xf7,0x15,0x88,0x09,0xcf,0x4f,0x3c]);
const exampleSentence = 'theblockbreakers'
const ex = Array.from(exampleSentence).map( (chr) => chr.charCodeAt(0));
const subkeyArray = SubkeysGenerator(key);
// console.log("Subkeys are generated");
// console.log(subkeyArray);
subkeyArray.forEach(PrintHex);
// console.log("There are " + subkeyArray.length + " subkeys");

// const cipherText = encrypt(inputFixer(plainText2), subkeyArray);
// PrintState(cipherText);

// The main part
const plainTexts = setup();
let cipherTexts: Uint8Array[] = encryptAll(plainTexts, subkeyArray, 4);

const startTime = performance.now()

let result: Uint8Array = new Uint8Array(16);
const indexArray: number[] = [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15];
for(let i = 0; i < 16; i++){
    result[i] = byteFinder(cipherTexts, subkeyArray, indexArray[i]);
}

const endTime = performance.now();
const foundKeys: Uint8Array[] = findAllKey(result, 4);
console.log(`Call to doSomething took ${endTime - startTime} milliseconds`);


console.log("---- ----");
console.log("Correct keys are");
subkeyArray.forEach(PrintHex);
console.log("---- ----");
console.log("Found keys are");
foundKeys.forEach(PrintHex);

console.log(hashMap)

