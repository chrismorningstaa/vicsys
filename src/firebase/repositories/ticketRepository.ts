import { ITIcket } from "../../interfaces/firebase/ITicket";
import genericRepository from "./genericRepository";

export default function ticketRepository() {
  const _genericRepository = genericRepository<ITIcket>("tickets");

  const getByEventId = async (eventId: string, category?: string) => {
    const tickets = await _genericRepository.getAll();
    return tickets.filter(
      (t) =>
        t.eventId == eventId &&
        t.ticketBooks.some((tb) => tb.ticketName == category || !category)
    );
  };
  return { ..._genericRepository, getByEventId };
}
