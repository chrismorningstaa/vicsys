import { ITicketCategory } from "./IEvent";

export interface ITIcket {
  created: Date;
  eventId: string;
  ticketBooks: ITicketCategory[];
  qrcodeUrl: string;
}

export enum TicketStatus {
  Completed = "Completed",
  Paid = "Paid",
  Pending = "Pending",
}
