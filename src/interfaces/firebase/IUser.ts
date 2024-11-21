import { User } from "firebase/auth";
import { Role } from "./Role";
import { IMyPuchaseEvent } from "./INonTechUser";

export interface IUserDetails extends User {
  provider: IUserProvider;
}
export enum IUserProvider {
  password = "password",
  facebook = "facebook.com",
  google = "google.com",
}

export interface IUser {
  id?: string;
  name: string;
  email: string;
  password: string;
  birthday: Date | "";
  age: number;
  gender: string;
  contact: string;
  ministry: string;
  role: Role;
  myPurchaseEvents: IMyPuchaseEvent[];
  profile_picture_url?: string;
}

export interface IUserLogin {
  email: string;
  password: string;
}
export interface IUserPublic {
  id?: string;
  name: string;
  email: string;
  birthday: Date | "";
  age: number;
  gender: string;
  contact: string;
  ministry: string;
  role: Role;
  myPurchaseEvents: IMyPuchaseEvent[];
  profile_picture_url?: string;
}

export interface IUserChangePassword {
  currentPassword: string;
  newPassword: string;
}

// export interface IMyPuchaseEvent {
//   eventId: string;
//   imageUrl: string;
//   isPaid: boolean;
//   location: string;
//   status: TicketStatus;
//   ticketId: string;
//   ticketName: string;
// }
