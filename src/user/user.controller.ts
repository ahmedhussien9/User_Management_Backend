import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Roles(Role.Admin)
    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
        const user = await this.userService.createUser(createUserDto);
        return {
            status: 'success',
            message: 'User created successfully',
            data: user,
        };
    }

    @Roles(Role.Admin)
    @Put(':id')
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        const user = await this.userService.updateUser(id, updateUserDto);
        return {
            status: 'success',
            message: 'User updated successfully',
            data: user,
        };
    }

    @Roles(Role.Admin)
    @Delete(':id')
    async delete(@Param('id') id: string) {
        const user = await this.userService.deleteUser(id);
        return {
            status: 'success',
            message: 'User deleted successfully',
            data: user,
        };
    }

    
    @Roles(Role.Admin, Role.Manager, Role.Editor)
    @Get()
    async findAll(
        @Query('page') page: string = '1',
        @Query('pageSize') pageSize: string = '10'
    ) {
        const pageNumber = parseInt(page, 10);
        const pageSizeNumber = parseInt(pageSize, 10);

        // Get users with pagination
        const { data: users, total } = await this.userService.findAllUsers(pageNumber, pageSizeNumber);

        // Return the response with the necessary details
        return {
            status: 'success',
            message: 'Users retrieved successfully',
            data: users,
            total, // Include the total number of users for pagination
            currentPage: pageNumber,
            pageSize: pageSizeNumber,
        };
    }
}
