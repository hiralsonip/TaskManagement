import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Organization } from "./organization.entity";

@Entity()
export class Task {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ default: 'todo' })
    status: 'todo' | 'inprogress' | 'done';

    @ManyToOne(() => User) // Many tasks can belong to one user
    @JoinColumn()
    owner: User;

    @ManyToOne(() => Organization) // Many tasks can belong to one organization
    @JoinColumn()
    organization: Organization;

    @CreateDateColumn()
    createdAt: Date
}