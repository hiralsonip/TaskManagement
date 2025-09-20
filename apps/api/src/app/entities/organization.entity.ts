import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Organization {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    //* Parent Organization ID for hierarchical structure
    @ManyToOne(() => Organization, org => org.children, { nullable: true }) //* Many child orgs can have one parent org
    @JoinColumn()
    parent?: Organization

    // Child orgs
    @OneToMany(() => Organization, org => org.parent) //* One parent org can have many child orgs
    children: Organization[];

    @OneToMany(() => User, user => user.organization) //* One organization can have many users
    users?: User[];
}