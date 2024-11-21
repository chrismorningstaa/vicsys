import { IUser } from "./IUser";

export interface IAttendee {
  userId: string;
}
export interface IChildAttendee {
  childId: string;
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
