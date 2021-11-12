/**
 * @author: WillHayCode
 */
const alphabet= 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export class Utility {
    static generateString(length = 4, characters: string = alphabet): string {
        if (characters.length === 0) {
            return '';
        }
        let str = '';
        while (str.length < length) {
            let index = Math.random() * characters.length;
            index = Math.floor(index);
            str += characters[index];
        }

        return str;
    }
}
