/**
 * @author: William Hayward
 */
import * as http from 'http';
import * as https from 'https';

export enum ErrorCode {
    SUCCESS = 0,
    MALFORMED = 1,
    ROOMNOTFOUND = 2,
    ROOMFULL = 3,
    USERNOTFOUND = 4,
    INSUFFICIENTPERMISSIONS = 5,
    INCORRECTPASSWORD = 6
}

export type Message = {
    [key: string]: unknown;
    event: string;
    data: unknown[];
    recipient: string[];
    sender: string;
};

export type LipwigOptions = {
    port: number;
    roomNumberLimit: number;
    roomSizeLimit: number;
    http: http.Server | https.Server | (http.Server | https.Server)[];
    name: string;
};

export type LipwigConfig = Partial<LipwigOptions>;

export type RoomOptions = {
    size: number;
    password: string;
    name: string;
    remote: boolean;
};

export type RoomConfig = Partial<RoomOptions>;

export type UserOptions = {
    [index: string]: unknown;
};

export const DEFAULTS = {
     port: 8989
};

