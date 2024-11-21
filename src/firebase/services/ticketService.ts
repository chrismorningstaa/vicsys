import eventService from "./eventService";
import userService from "./userService";
import { TicketStatus } from "../../interfaces/firebase/ITicket";
export default function ticketService() {
  const _eventService = eventService();
  const _userService = userService();

  const getTotalTicketSold = async () => {
    const users = await _userService.getAll();
    let totalCost = 0;

    await Promise.all(
      users.flatMap((u) => {
        if (!u.myPurchaseEvents || !Array.isArray(u.myPurchaseEvents)) {
          return [];
        }

        return u.myPurchaseEvents.map(async (m) => {
          const event = await _eventService.getById(m.eventId);
          if (event) {
            event.ticketCategories.forEach((t) => {
              if (m.status !== TicketStatus.Pending) {
                totalCost += t.ticketPrice;
              }
            });
          }
        });
      })
    );

    return totalCost;
  };
  return { getTotalTicketSold };
}
