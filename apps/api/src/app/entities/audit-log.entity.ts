import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    action: string; //* e.g., 'CREATE_USER', 'DELETE_TASK'

    @Column('simple-json')
    meta: string; //* Optional details about the action

    @Column()
    userId: string;

    @CreateDateColumn()
    createdAt: Date;
}