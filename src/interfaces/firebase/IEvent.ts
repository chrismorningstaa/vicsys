import { IUser } from "./IUser";

export interface IAttendee {
  userId: string;
}
export interface IChildAttendee {
  childId: string;
  status: EventChildStatus;
}

export interface IEvent {
  id?: string;
  eventName: string;
  description: string;
  endTime: Date;
  startTime: Date;
  image: string;
  venue: string;
  ticketCategories: ITicketCategory[];
  ticketCategoryId: string,
  attendees: IAttendee[];
  childrenAttendees: IChildAttendee[];
  isForKids: boolean;
}
export interface IEventSave {
  id?: string;
  eventName: string;
  description: string;
  endTime: Date;
  startTime: Date;
  image: string | File;
  venue: string;
  ticketCategories: ITicketCategory[];
  attendees: IAttendee[];
  childrenAttendees: IChildAttendee[];
  isForKids: boolean;
}
export interface ITicketCategory {
  ticketCategoryId?: string;
  ticketName: string;
  ticketPerUser: number;
  ticketPrice: number;
  ticketRemaining?: number;
  ticketSold: number;
  ticketTotal: number;
}
export interface IOngoingEvent {
  attendees: IUser[];
  id?: string;
  eventName: string;
  description: string;
  endTime: Date;
  startTime: Date;
  image: string;
  venue: string;
  ticketCategories: ITicketCategory[];
}
export enum EventChildStatus {
  Arrived = "Arrived",
  Fetch = "Fetch",
  Pending = "Pending",
}
