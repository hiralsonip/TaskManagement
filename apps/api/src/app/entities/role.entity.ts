import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Permission } from "./permission.entity";

@Entity()
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string; //* Owner, Admin, Viewer

    @ManyToMany(() => Permission, { eager: true }) // Many roles can have many permissions
    permissions: Permission[];
}