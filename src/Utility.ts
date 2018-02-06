/**
 * @author: William Hayward
 */
const alphabet: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export namespace Utility {
    export const generateString: Function = (length: number = 4, characters: string = alphabet): string => {
        if (characters.length === 0) {
            return '';
        }
        let str: string = '';
        let index: number;
        while (str.length < length) {
            index = Math.random() * characters.length;
            index = Math.floor(index);
            str += characters[index];
        }

        return str;
    };
}
