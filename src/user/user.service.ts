import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { ERROR_MESSAGES } from '../constants/error-messages';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
    ) { }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        if (!createUserDto.email || !createUserDto.password) {
            throw new BadRequestException(ERROR_MESSAGES.EMAIL_AND_PASSWORD_REQUIRED);
        }

        const existingUser = await this.userModel.findOne({ email: createUserDto.email }).exec();
        if (existingUser) {
            throw new ConflictException(ERROR_MESSAGES.EMAIL_IN_USE);
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        const user = new this.userModel({
            ...createUserDto,
            password: hashedPassword,
        });

        try {
            return await user.save();
        } catch (error) {
            throw new BadRequestException(ERROR_MESSAGES.FAILED_TO_CREATE_USER);
        }
    }

    async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new BadRequestException(ERROR_MESSAGES.INVALID_USER_ID);
        }

        const user = await this.userModel.findById(id);
        if (!user) {
            throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.userModel.findOne({ email: updateUserDto.email }).exec();
            if (existingUser && existingUser._id.toString() !== id) {
                throw new ConflictException(ERROR_MESSAGES.EMAIL_IN_USE);
            }
        }

        Object.assign(user, updateUserDto);

        try {
            return await user.save();
        } catch (error) {
            throw new BadRequestException(ERROR_MESSAGES.FAILED_TO_UPDATE_USER);
        }
    }

    async deleteUser(id: string): Promise<User> {
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new BadRequestException(ERROR_MESSAGES.INVALID_USER_ID);
        }

        const user = await this.userModel.findByIdAndDelete(id);
        if (!user) {
            throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        return user;
    }

    async findAllUsers(page: number, pageSize: number): Promise<{ data: User[], total: number }> {
        // Count total users for pagination
        const total = await this.userModel.countDocuments();

        // Fetch users with pagination, excluding the password field
        const users = await this.userModel
            .find({}, { password: 0 }) // Exclude the password field
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .exec();

        return {
            data: users,
            total,
        };
    }


    async findUserByEmail(email: string): Promise<User> {
        if (!email) {
            throw new BadRequestException(ERROR_MESSAGES.EMAIL_REQUIRED);
        }

        const user = await this.userModel.findOne({ email }).exec();
        if (!user) {
            throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        return user;
    }
}
