import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement } from 'sequelize-typescript';

@Table
export class Contact extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.STRING)
  phoneNumber?: string;

  @Column(DataType.STRING)
  email?: string;

  @Column(DataType.INTEGER)
  linkedId?: number;

  @Column(DataType.ENUM('primary', 'secondary'))
  linkPrecedence!: 'primary' | 'secondary';

  @Column(DataType.DATE)
  createdAt!: Date;

  @Column(DataType.DATE)
  updatedAt!: Date;

  @Column(DataType.DATE)
  deletedAt?: Date;
}

