/* eslint-disable prettier/prettier */
export class LoginInfoAdministratorDto {
    administratorId: number;
    username: string;
    token: string;

    constructor(administratorId: number, username: string, token: string) {
        this.administratorId = administratorId;
        this.username = username;
        this.token = token;
    }
}
