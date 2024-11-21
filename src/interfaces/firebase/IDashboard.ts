import IPieValue from "../components/IPieValue";
import { IEvent, IOngoingEvent } from "./IEvent";
import { TicketStatus } from "./ITicket";

export default interface IDahsboard {
  totalRegistration: number;
  totalKids: number;
  totalEvents: number;
  totalTicketSold: number;
  totalKidsPieDetails: IPieValue[];
  totalUserPieChart: IPieValue[];
  ongoingEvents: IOngoingEvent[];
  events: IEvent[];
}
export interface ITicketDetails {
  id?: string;
  image: string;
  eventName: string;
  endTime: Date;
  startTime: Date;
  totalTickets: number;
  ticketSolds: number;
  status: TicketStatus;
}
