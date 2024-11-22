import IChild from "../../interfaces/firebase/IChild";
import {
  EventChildStatus,
  IChildAttendee,
  IEvent,
} from "../../interfaces/firebase/IEvent";
import { IMyPuchaseEvent } from "../../interfaces/firebase/INonTechUser";
import eventRepository from "../repositories/eventRepository";
import nonTechUserRepository from "../repositories/nonTechUserRepository";
import userRepository from "../repositories/userRepository";

export default function bookingService() {
  const _userRepository = userRepository();
  const _nonTechUserRepository = nonTechUserRepository();
  const _eventRepository = eventRepository();

  const bookEventPurchases = async (
    eventId: string,
    userId: string,
    nonTectUserId: string,
    myPurchases: IMyPuchaseEvent[]
  ) => {
    const event = await _eventRepository.getById(eventId);
    let user;
    if (userId) user = await _userRepository.getById(userId);
    if (nonTectUserId)
      user = await _nonTechUserRepository.getById(nonTectUserId);
    if (!event || !user) throw new Error("Event or user not found");

    const updatedTicketCategories = event.ticketCategories.map((t) => ({
      ...t,
      ticketRemaining:
        (t.ticketRemaining ?? 0) -
        myPurchases.filter((m) => m.ticketName == t.ticketName).length,
    }));

    const udpatedAttendees = () => {
      if (event.attendees.some((u) => u.userId == userId) && event.attendees)
        return event.attendees;
      if (event.attendees) return [...event.attendees, { userId: userId }];

      return [{ userId: userId }];
    };

    await _eventRepository.update(event?.id || "", {
      ...event,
      ticketCategories: updatedTicketCategories,
      attendees: udpatedAttendees(),
    });

    if (userId)
      return await _userRepository.update(userId, {
        ...user,
        myPurchaseEvents: user.myPurchaseEvents
          ? [...user.myPurchaseEvents, ...myPurchases]
          : [...myPurchases],
      });

    return await _nonTechUserRepository.update(nonTectUserId, {
      ...user,
      myPurchaseEvents: user.myPurchaseEvents
        ? [...user.myPurchaseEvents, ...myPurchases]
        : [...myPurchases],
    });
  };

  const bookChildren = async (eventId: string, newChildren: IChild[]) => {
    const event = await _eventRepository.getById(eventId);
    if (!event) throw new Error("Event not found");

    const newChildrenIds: IChildAttendee[] = newChildren.map((n) => ({
      childId: n?.id ?? "",
      status: EventChildStatus.Pending,
    }));

    const updatedEvent: IEvent = {
      ...event,
      childrenAttendees: [...event.childrenAttendees, ...newChildrenIds],
    };
    await _eventRepository.update(eventId, updatedEvent);
  };

  return {
    bookChildren,
    bookEventPurchases,
  };
}
