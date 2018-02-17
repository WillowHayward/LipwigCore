/**
 * @author: William Hayward
 */
import * as http from 'http';

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
    [key: string]: any; // tslint:disable-line:no-any
    event: string;
    data: any[]; // tslint:disable-line:no-any
    recipient: string[];
    sender: string;
};

type LipwigOptionsRaw = {
    port: number;
    roomNumberLimit: number;
    roomSizeLimit: number;
    http: http.Server;
    name: string;
};

export type LipwigOptions = Partial<LipwigOptionsRaw>;

export type RoomOptionsRaw = {
    size: number;
    password: string;
    name: string;
};

export type RoomOptions = Partial<RoomOptionsRaw>;

export type UserOptions = {
    [index: string]: any; // tslint:disable-line:no-any
};
