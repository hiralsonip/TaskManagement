import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
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

    @ManyToMany(() => Role) // Many users can have many role
    @JoinTable()
    roles: Role[]; // Owner, Admin, Viewer

    @ManyToOne(() => Organization, org => org.users, { nullable: true }) // Many users can belong to one organization
    @JoinColumn({ name: 'organizationId' })
    organization?: Organization;

    @OneToMany(() => Task, task => task.owner) // One user can have many tasks
    tasks: Task[];

}