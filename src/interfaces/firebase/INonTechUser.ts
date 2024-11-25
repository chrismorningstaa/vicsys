import { TicketStatus } from "./ITicket";

export interface IMyPuchaseEvent {
  eventId: string;
  imageUrl: string;
  isPaid: boolean;
  location: string;
  status: TicketStatus;
  startTime: Date;
  endTime: Date;
  ticketId?: string;
  ticketName: string;
  gcashRefNo?: string;
  ticketCategoryId: string,
}

export interface INonTechUser {
  id?: string;
  name: string;
  email: string;
  password: string;
  birthday: Date | "";
  age: number;
  gender: string;
  contact: string;
  ministry: string;
  myPurchaseEvents?: IMyPuchaseEvent[];
}

export interface INonTechUserLogin {
  email: string;
  password: string;
}
export interface INonTechUserPublic {
  id?: string;
  name: string;
  email: string;
  password: string;
  birthday: Date | "";
  age: number;
  gender: string;
  contact: string;
  ministry: string;
}
