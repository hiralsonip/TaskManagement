import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Permission } from "./permission.entity";

@Entity()
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string; //* Owner, Admin, Viewer

    @ManyToMany(() => Permission, { eager: true }) // Many roles can have many permissions
    @JoinTable() 
    permissions: Permission[];
}