/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
import { Body, Controller, HttpException, HttpStatus, Post, Req } from "@nestjs/common";
import { ApiResponse } from "src/misc/api.response.class";
import { AdministratorService } from "src/services/administrator/administrator.service";
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { Request } from "express";
import { jwtSecret } from "config/jwt.secret";
import { UserRegistrationDto } from "src/dtos/user/user.registration.dto";
import { UserService } from "src/services/user/user.service";
import { JwtDataDto } from "src/dtos/auth/jwt.data.dto";
import { LoginInfoDto } from "src/dtos/auth/login.info.dto";
import { LoginAdministratorDto } from "src/dtos/administrator/login.administrator.dto";
import { LoginUserDto } from "src/dtos/user/login.user.dto";
import { JwtRefreshDataDto } from "src/dtos/auth/jwt.refresh.data.dto";
import { UserRefreshTokenDto } from "src/dtos/auth/user.refresh.token.dto";

@Controller('auth')
export class AuthController {
    constructor(
        public administratorService: AdministratorService,
        public userService: UserService,
    ) { }

    @Post('administrator/login') // http://localhost:3000/auth/administrator/login/
    async doAdministratorLogin(@Body() data: LoginAdministratorDto, @Req() req: Request): Promise<LoginInfoDto | ApiResponse> {
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

        const jwtData =  new JwtDataDto()
        jwtData.role = 'administrator';
        jwtData.id = administrator.administratorId;
        jwtData.identity        = administrator.username;
        jwtData.exp = this.getDatePlus(60 * 60 * 24 * 5);
        jwtData.ip = req.ip.toString();
        jwtData.ua = req.headers['user-agent'];

        let token: string = jwt.sign(jwtData.toPlainObject(), jwtSecret);

        const responseObject = new LoginInfoDto(
            administrator.administratorId,
            administrator.username,
            token,
            "",
            "",
        );

        return new Promise(resolve => resolve(responseObject));
    }

    @Post('user/login') // http://localhost:3000/auth/administrator/login/
    async doUserLogin(@Body() data: LoginUserDto, @Req() req: Request): Promise<LoginInfoDto | ApiResponse> {
        const user = await this.userService.getByEmail(data.email)

        if (!user) {
            return new Promise(resolve => resolve(new ApiResponse('error', -3001, 'User not found!')));
        }

        const passwordHash = crypto.createHash('sha512');
        passwordHash.update(data.password);
        const passwordHashString = passwordHash.digest('hex').toUpperCase();

        if (user.passwordHash !== passwordHashString) {
            return new Promise(resolve => resolve(new ApiResponse('error', -3002, 'Bad password!')));
        }

        const jwtData =  new JwtDataDto()
        jwtData.role = 'user';
        jwtData.id = user.userId;
        jwtData.identity = user.email;
        jwtData.exp = this.getDatePlus(60 * 5)
        jwtData.ip = req.ip.toString();
        jwtData.ua = req.headers['user-agent'];

        let token: string = jwt.sign(jwtData.toPlainObject(), jwtSecret);

        const jwtRefreshData = new JwtRefreshDataDto();
        jwtRefreshData.role = jwtData.role;
        jwtRefreshData.id = jwtData.id;
        jwtRefreshData.identity = jwtData.identity;
        jwtRefreshData.exp = this.getDatePlus(60 * 60 * 24 * 31);
        jwtRefreshData.ip = jwtData.ip;
        jwtRefreshData.ua = jwtData.ua;

        let refreshToken: string = jwt.sign(jwtRefreshData.toPlainObject(), jwtSecret);

        const responseObject = new LoginInfoDto(
            user.userId,
            user.email,
            token,
            refreshToken,
            this.getIsoDate(jwtRefreshData.exp),
        );

        await this.userService.addToken(user.userId, refreshToken, this.getDatabaseDateFormat(this.getIsoDate(jwtRefreshData.exp)));

        return new Promise(resolve => resolve(responseObject));
    }

    @Post('user/refresh') // http://localhost:3000/auth/user/refresh/
    async userTokenRefresh(@Req() req: Request, @Body() data: UserRefreshTokenDto): Promise<LoginInfoDto | ApiResponse> {
        const userToken = await this.userService.getUserToken(data.token);

        if (!userToken) {
            return new ApiResponse('error', -10002, 'No such refresh token found!')
        }

        if (userToken.isValid === 0) {
            return new ApiResponse('error', -10003, 'This token is no longer valid!')
        }

        const sada =  new Date();
        const datunIsteka = new Date(userToken.expiresAt);

        if (datunIsteka.getTime() < sada.getTime()) {
            return new ApiResponse('error', -10004, 'The token has expired!')
        }

        let jwtRefreshData: JwtRefreshDataDto;
        
        try {
            jwtRefreshData = jwt.verify(data.token, jwtSecret);
        } catch (e) {
            throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
        }

        if (!jwtRefreshData) {
            throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
        }

        if (jwtRefreshData.ip !== req.ip.toString()) {
            throw new HttpException('Token not found', HttpStatus.UNAUTHORIZED);
        }

        if (jwtRefreshData.ua !== req.headers['user-agent']) {
            throw new HttpException('Token not found', HttpStatus.UNAUTHORIZED);
        }

        const jwtData =  new JwtDataDto()
        jwtData.role = jwtRefreshData.role;
        jwtData.id = jwtRefreshData.id;
        jwtData.identity = jwtRefreshData.identity;
        jwtData.exp = this.getDatePlus(60 * 5);
        jwtData.ip = jwtRefreshData.ip;
        jwtData.ua = jwtRefreshData.ua;

        const token: string = jwt.sign(jwtData.toPlainObject(), jwtSecret);

        const responseObject = new LoginInfoDto(
            jwtData.id,
            jwtData.identity,
            token,
            data.token,
            this.getIsoDate(jwtRefreshData.exp),
        );

        return responseObject;
    }

    @Post('user/register')  // http://localhost:3000/auth/user/register/
    async userRegister(@Body() data: UserRegistrationDto) {
        return await this.userService.register(data);
    }

    private getDatePlus(numberOfSecundes: number): number {
        return new Date().getTime() / 1000 + numberOfSecundes
    }

    private getIsoDate(timestamo: number): string {
        const date = new Date();
        date.setTime(timestamo * 1000)
        return date.toISOString()
    }

    private getDatabaseDateFormat(isoFormat: string): string {
        return isoFormat.substr(0, 19).replace('T', ' ');
    }
}