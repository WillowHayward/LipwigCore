/**
 * @author: William Hayward
 */
export type Message = {
    event: string;
    data: any[]; // tslint:disable-line:no-any
    recipient: string[];
    sender: string;
};

export enum ErrorCode {
    SUCCESS = 0,
    MALFORMED = 1,
    ROOMNOTFOUND = 2,
    ROOMFULL = 3,
    USERNOTFOUND = 4,
    INSUFFICIENTPERMISSIONS = 5
}
