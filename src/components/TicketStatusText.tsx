import { TicketStatus } from "../interfaces/firebase/ITicket";

export interface TicketStatusRepresentation {
  text: TicketStatus;
  color: string;
}
export const ticketStatus: TicketStatusRepresentation[] = [
  {
    text: TicketStatus.Pending,
    color: "#ffa500",
  },
  {
    text: TicketStatus.Paid,
    color: "#198754",
  },
  {
    text: TicketStatus.Completed,
    color: "#0D6EFD",
  },
  {
    text: TicketStatus.Declined,
    color: "#dc3545",
  },
];

export function TicketStatusText(props: { status: TicketStatus | undefined }) {
  const status = ticketStatus.find((t) => t.text == props.status);
  return <span style={{ color: status?.color }}>{status?.text}</span>;
}
