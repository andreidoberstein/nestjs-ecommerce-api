import { UserEntity } from "src/users/entities/user.entity";

export interface IUsersService {
  findAll(user: any): Promise<UserEntity[]>;
  findOne(id: number, user: any): Promise<UserEntity>;
}