/* eslint-disable prettier/prettier */
import { Get, Param, UseGuards } from "@nestjs/common";
import { Controller } from "@nestjs/common";
import { Crud } from "@nestjsx/crud";
import DistinctFeatureValuesDto from "src/dtos/feature/distinct.feature.values.dto";
import { Feature } from "src/entities/feature.entity";
import { AllowToRoles } from "src/misc/allow.to.roles.descriptor";
import { RoleCheckedGuard } from "src/misc/role.checked.guard";
import { FeatureService } from "src/services/feature/feature.service";

@Controller('api/feature')
@Crud({
    model: {
        type: Feature
    },
    params: {
        id: {
            field: 'featureId',
            type: 'number',
            primary: true
        }
    },
    query: {
        join: {
            category: {
                eager: true
            },
            articleFeatures: {
                eager: false
            },
            articles: {
                eager: false
            }
        }
    },
    routes: {
        only: [
            'createOneBase',
            'createManyBase',
            'updateOneBase',
            'getOneBase',
            'getManyBase',
        ],
        createOneBase: {
            decorators: [
                UseGuards(RoleCheckedGuard),
                AllowToRoles('administrator'),
            ]
        },
        createManyBase: {
            decorators: [
                UseGuards(RoleCheckedGuard),
                AllowToRoles('administrator'),
            ]
        },
        updateOneBase: {
            decorators: [
                UseGuards(RoleCheckedGuard),
                AllowToRoles('administrator'),
            ]
        },
        getOneBase: {
            decorators: [
                UseGuards(RoleCheckedGuard),
                AllowToRoles('administrator', 'user'),
            ]
        },
        getManyBase: {
            decorators: [
                UseGuards(RoleCheckedGuard),
                AllowToRoles('administrator', 'user'),
            ]
        },
    }
})
export class FeatureController {
    constructor(public service: FeatureService) { }

    @Get('values/:categoryId')  // POST http://localhost:3000/api/feature/values/:categoryId
    @UseGuards(RoleCheckedGuard)
    @AllowToRoles('administrator', 'user')
    async getDistinctValuesByCategoryId(@Param('categoryId') categoryId: number): Promise<DistinctFeatureValuesDto> {
        return await this.service.getDistinctValuesByCategoryId(categoryId)
    }
}