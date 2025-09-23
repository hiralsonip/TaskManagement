import { OrganizationDto } from "./organization.dto";
import { TaskDto } from "./task.dto";

export interface UserDto {
    id: string;
    username: string;
    roles: string[];
    permissions: string[];
    organization?: OrganizationDto;
    tasks?: TaskDto[];
}