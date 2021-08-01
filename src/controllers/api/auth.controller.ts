/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */
import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiResponse } from "src/misc/api.response.class";
import { AdministratorService } from "src/services/administrator/administrator.service";
import * as crypto from 'crypto';
import { LoginAdministratorDto } from "src/dtos/administrator/login.administrator.dto";
import { LoginInfoAdministratorDto } from "src/dtos/administrator/login.info.administrator.dto";
import * as jwt from 'jsonwebtoken';
import { JwtDataAdministratorDto } from "src/dtos/administrator/jwt.data.administrator.dto";
import { Request } from "express";
import { jwtSecret } from "config/jwt.secret";

@Controller('auth')
export class AuthController {
    constructor(
        public administratorService: AdministratorService,
    ) { }

    @Post('login') // http://localhost:3000/auth/administrator/login/
    async doAdministratorLogin(@Body() data: LoginAdministratorDto, @Req() req: Request) {
        const administrator = await this.administratorService.getByUsername(data.username)

        if (!administrator) {
            return new Promise(resolve => resolve(new ApiResponse('error', -3001, 'Administrattor not found!')));
        }

        const passwordHash = crypto.createHash('sha512');
        passwordHash.update(data.password);
        const passwordHashString = passwordHash.digest('hex').toUpperCase();

        if (administrator.passwordHash !== passwordHashString) {
            return new Promise(resolve => resolve(new ApiResponse('error', -3002, 'Bad password!')));
        }

        const jwtData =  new JwtDataAdministratorDto()
        jwtData.administratorId = administrator.administratorId;
        jwtData.username        = administrator.username;

        let sada = new Date();
        sada.setDate(sada.getDate() + 14)
        const istekTimestamp = sada.getTime() / 1000;
        jwtData.exp = istekTimestamp

        jwtData.ip = req.ip.toString();
        jwtData.ua = req.headers['user-agent'];

        let token: string = jwt.sign(jwtData.toPlainObject(), jwtSecret);

        const responseObject = new LoginInfoAdministratorDto(
            administrator.administratorId,
            administrator.username,
            token
        );

        return new Promise(resolve => resolve(responseObject));
            
    }
}