import { UserEntity } from "src/users/entities/user.entity";
import { UpdateUserDto } from "../dto/update-user.dto";

export interface IUsersService {
  findAll(user: any): Promise<UserEntity[]>;
  findOne(id: number, user: any): Promise<UserEntity>;
  update(id: number, dto: UpdateUserDto, user: any): Promise<UserEntity>;
}