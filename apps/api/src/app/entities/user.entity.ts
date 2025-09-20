import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Organization } from './organization.entity';
import { Role } from './role.entity';
import { Task } from './task.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    username: string;

    @Column()
    password: string;

    @ManyToOne(() => Role) // Many users can have one role
    role: string; // Owner, Admin, Viewer

    @ManyToOne(() => Organization, org => org.users) // Many users can belong to one organization
    organization: Organization;

    @OneToMany(() => Task, task => task.owner) // One user can have many tasks
    tasks: Task[];

}