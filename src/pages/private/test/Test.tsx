import { IMyPuchaseEvent } from "../../../interfaces/firebase/INonTechUser";
import { TicketStatus } from "../../../interfaces/firebase/ITicket";
import BookingPage from "../booking/BookingPage";

export default function Test() {
  const purchaseEvent: IMyPuchaseEvent = {
    eventId: "mjZhiWrChLfQyV4EHeSJ",
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/vicsys-a6039.appspot.com/o/event_images%2FVictory%20Weekend.jfif?alt=media&token=352b7eed-a94e-4860-8efa-d0484f2f9f78",
    isPaid: true,
    location: "Victory Church Lipa",
    status: TicketStatus.Completed,
    ticketId: "76e80a56-d726-4d9f-87c3-56c041263407",
    ticketName: "VIP",
  };

  return <BookingPage />;
}
