import { arrayUnion, doc, getFirestore, updateDoc } from "firebase/firestore";
import { IEvent } from "../../interfaces/firebase/IEvent";
import genericRepository from "./genericRepository";
import userRepository from "./userRepository";
import { IUser } from "../../interfaces/firebase/IUser";
import nonTechUserRepository from "./nonTechUserRepository";
import { TicketStatus } from "../../interfaces/firebase/ITicket";
import { IMyPuchaseEvent } from "../../interfaces/firebase/INonTechUser";

export default function eventRepository() {
  const _genericRepository = genericRepository<IEvent>("events");
  const _userRepository = userRepository();
  const _nonTechUserRepository = nonTechUserRepository();
  const getAll = async () => {
    const events = await _genericRepository.getAll();
    return events;
  };

  const addAttendee = async (
    eventId: string,
    userId: string
  ): Promise<void> => {
    const db = getFirestore();
    const eventRef = doc(db, "events", eventId);

    await updateDoc(eventRef, {
      attendees: arrayUnion({ userId: userId }),
    });
  };

  const getAttendeesByEventId = async (id: string): Promise<IUser[]> => {
    const users = await _userRepository.getAll();
    const nonTechUsers = await _nonTechUserRepository.getAll();

    const allUsers = [...users, ...nonTechUsers].filter(
      (user): user is IUser =>
        user !== null &&
        user !== undefined &&
        user.hasOwnProperty("myPurchaseEvents")
    );

    const filtered = await allUsers
      .filter((u) => u.myPurchaseEvents.some((m) => m.eventId == id))
      .map((user) => ({
        ...user,
        myPurchaseEvents: user?.myPurchaseEvents
          ? user.myPurchaseEvents.filter((p) => p.eventId == id)
          : [],
      }));
    return filtered;
  };
  const updateTicketRemainingAndSold = async (
    userId: string,
    myPurchase: IMyPuchaseEvent
  ) => {
    let user;
    user = await _userRepository.getById(userId);
    if (!user) {
      user = await _nonTechUserRepository.getById(userId);
    }
    console.log(user);
    if (!user?.myPurchaseEvents)
      throw new Error("user has no myPurchaseEvents");
    const userPurchased = user?.myPurchaseEvents.find(
      (m) => m.ticketId == myPurchase.ticketId
    );
    if (!userPurchased) throw new Error("user myPurchaseEvent is not found");

    const event = await _genericRepository.getById(myPurchase.eventId);
    if (!event?.id) throw new Error("event is not found");

    const updatetedTcketCategories = event.ticketCategories.map((t) => {
      if (t.ticketName == myPurchase.ticketName)
        return {
          ...t,
          ticketRemaining:
            (t.ticketRemaining ?? 0) +
            handleTicketRemaining(userPurchased.status, myPurchase.status),
          ticketSold:
            t.ticketSold +
            handleTicketSold(userPurchased.status, myPurchase.status),
        };
      return t;
    });
    await _genericRepository.update(event?.id, {
      ...event,
      ticketCategories: updatetedTcketCategories,
    });
  };

  const handleTicketRemaining = (
    currentStatus: TicketStatus,
    newStatus: TicketStatus
  ) => {
    if (
      currentStatus == TicketStatus.Pending &&
      newStatus != TicketStatus.Pending
    )
      return -1;
    if (
      currentStatus != TicketStatus.Pending &&
      newStatus != TicketStatus.Pending
    )
      return 0;
    else return +1;
  };
  const handleTicketSold = (
    currentStatus: TicketStatus,
    newStatus: TicketStatus
  ) => {
    if (
      currentStatus == TicketStatus.Pending &&
      newStatus != TicketStatus.Pending
    )
      return +1;
    if (
      currentStatus != TicketStatus.Pending &&
      newStatus != TicketStatus.Pending
    )
      return 0;
    else return -1;
  };
  return {
    ..._genericRepository,
    getAttendeesByEventId,
    getAll,
    addAttendee,
    updateTicketRemainingAndSold,
  };
}
