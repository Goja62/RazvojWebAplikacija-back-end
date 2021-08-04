/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { Order } from "src/entities/order.entity";
import { AllowToRoles } from "src/misc/allow.to.roles.descriptor";
import { ApiResponse } from "src/misc/api.response.class";
import { RoleCheckedGuard } from "src/misc/role.checked.guard";
import { ChangeOrderStatusDto } from "src/services/order/changeOrderStatus.dto";
import { OrderService } from "src/services/order/order.service";

@Controller('api/order')
export class AdministratorOrderController {
    constructor(
        private orderService: OrderService,
    ) {}
    
    @Get(':id') // GET http://localhost:3000/api/order/:id
    @UseGuards(RoleCheckedGuard)
    @AllowToRoles('administrator')
    async get(@Param('id') id: number): Promise<Order | ApiResponse> {
        const order = await this.orderService.getById(id);

        if(!order) {
            return new ApiResponse('error', -9001, 'No such order found')
        }

        return order;
    }

    @Patch(':id') // PATCH http://localhost:3000/api/order/:id
    @UseGuards(RoleCheckedGuard)
    @AllowToRoles('administrator')
    async changeStatus(@Param('id') id: number, @Body() data: ChangeOrderStatusDto): Promise<Order | ApiResponse> {
        return await this.orderService.changeStatus(id, data.newStatus)
    }
}