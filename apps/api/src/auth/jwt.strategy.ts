import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    private prisma = new PrismaClient();

    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'supersecret_jwt_key', // Hardcoded for debugging
        });
    }

    async validate(payload: any) {
        console.log('JwtStrategy validating payload:', payload);
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
        });

        if (!user) {
            console.log('JwtStrategy: User not found for payload:', payload);
            throw new UnauthorizedException();
        }

        console.log('JwtStrategy: User valid:', user.email);
        return { userId: user.id, email: user.email };
    }
}
