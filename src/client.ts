import {addRoundKey, inputFixer, mixColumns, shiftRows, subBytes} from "./helpers";

export const encryptWithRound = (state: Uint8Array, subkeyArray: Uint8Array[], round: number): Uint8Array => {
    addRoundKey(state, inputFixer(subkeyArray[0]));

    // rounds
    for(let i = 1; i < round+1; i++) {

        subBytes(state);
        shiftRows(state);

        if( i != round) {
            mixColumns(state);
        }

        addRoundKey(state, inputFixer(subkeyArray[i]));
    }
    return state;
}

export const encryptAll = (stateArray: Uint8Array[], subkeyArray: Uint8Array[], round: number): Uint8Array[] => {

    let cipherTexts: Uint8Array[] = [];

    for( let i = 0; i < stateArray.length; i++ ) {
        cipherTexts.push(encryptWithRound(stateArray[i], subkeyArray, 4));
    }

    return cipherTexts;
}