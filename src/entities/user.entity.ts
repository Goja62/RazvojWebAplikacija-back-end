/* eslint-disable prettier/prettier */
import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { Cart } from "./cart.entity";


@Index("uq_user_email", ["email"], { unique: true })
@Index("uq_user_phone_number", ["phoneNumber"], { unique: true })
@Entity("user")
export class User {
  @PrimaryGeneratedColumn({ type: "int", name: "user_id", unsigned: true })
  userId: number;

  @Column({
    type: "varchar",
    unique: true,
    length: 255
  })
  email: string;

  @Column({
    type: "varchar",
    name: "password_hash",
    length: 128
  })
  passwordHash: string;

  @Column({ type: "varchar", length: 64 })
  forename: string;

  @Column({ type: "varchar", length: 64 })
  surname: string;

  @Column({
    type: "varchar",
    name: "phone_number",
    unique: true,
    length: 24
  })
  phoneNumber: string;

  @Column({ type: "text", name: "postal_address" })
  postalAddress: string;

  @OneToMany(
    () => Cart,
    cart => cart.user
  )
  carts: Cart[];
}
