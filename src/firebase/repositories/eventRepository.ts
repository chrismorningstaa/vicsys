import { arrayUnion, doc, getFirestore, updateDoc } from "firebase/firestore";
import { EventChildStatus, IEvent } from "../../interfaces/firebase/IEvent";
import genericRepository from "./genericRepository";
import userRepository from "./userRepository";
import { IUser } from "../../interfaces/firebase/IUser";
import nonTechUserRepository from "./nonTechUserRepository";
import { TicketStatus } from "../../interfaces/firebase/ITicket";
import { IMyPuchaseEvent } from "../../interfaces/firebase/INonTechUser";
import childrenRepository from "./childrenRepository";
import {
  IChildWithParent,
  IChildWithParentAndStatus,
} from "../../interfaces/firebase/IChild";

export default function eventRepository() {
  const _genericRepository = genericRepository<IEvent>("events");
  const _userRepository = userRepository();
  const _childrenRepository = childrenRepository();
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

  const getChildAttendeesByEventId = async (
    id: string
  ): Promise<IChildWithParentAndStatus[]> => {
    const event = await _genericRepository.getById(id);
    if (!event) throw new Error("Event not found");

    const newChildren: IChildWithParent[] = await Promise.all(
      event.childrenAttendees.map(async (c) => {
        const child = await _childrenRepository.getById(c.childId);
        if (!child?.userId) throw new Error("Child's user id not found");

        let parent =
          (await _userRepository.getById(child.userId)) ||
          (await _nonTechUserRepository.getById(child.userId));

        return { ...child, parentName: parent?.name, status: c.status };
      })
    );

    return newChildren;
  };
  const updateChildAttendeeStatusEventById = async (
    eventId: string,
    newStatus: EventChildStatus,
    childId: string
  ) => {
    const event = await _genericRepository.getById(eventId);
    if (!event) throw new Error("Event not found");

    const updatedChildrenAttendees = event.childrenAttendees.map((c) => {
      if (c.childId == childId)
        return {
          childId,
          status: newStatus,
        };
      return c;
    });
    await _genericRepository.update(eventId, {
      ...event,
      childrenAttendees: updatedChildrenAttendees,
    });
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
    if (!user?.myPurchaseEvents)
      throw new Error("user has no myPurchaseEvents");
    const userPurchased = user?.myPurchaseEvents.find(
      (m) => m.ticketId == myPurchase.ticketId
    );
    if (!userPurchased) throw new Error("user myPurchaseEvent is not found");

    const event = await _genericRepository.getById(myPurchase.eventId);
    if (!event?.id) throw new Error("event is not found");

    const updatetedTcketCategories = event.ticketCategories.map((t) => {
      console.log(t.ticketCategoryId, myPurchase.ticketCategoryId);
      if (t.ticketCategoryId === myPurchase.ticketCategoryId) {
        const soldChange = handleTicketSold(
          userPurchased.status,
          myPurchase.status
        );
        console.log("Ticket sold change:", soldChange);

        return {
          ...t,
          ticketSold: t.ticketSold + soldChange,
        };
      }
      return t;
    });
    await _genericRepository.update(event?.id, {
      ...event,
      ticketCategories: updatetedTcketCategories,
    });
  };

  const handleTicketSold = (
    currentStatus: TicketStatus,
    newStatus: TicketStatus
  ): number => {
    console.log("HandleTicketSold - Current status:", currentStatus);
    console.log("HandleTicketSold - New status:", newStatus);

    if (
      currentStatus !== TicketStatus.Pending && // Changed != to !==
      currentStatus !== TicketStatus.Declined && // Changed != to !==
      (newStatus === TicketStatus.Pending ||
        newStatus === TicketStatus.Declined)
    ) {
      return -1;
    }

    if (
      (currentStatus === TicketStatus.Pending ||
        currentStatus === TicketStatus.Declined) &&
      (newStatus === TicketStatus.Completed || newStatus === TicketStatus.Paid)
    ) {
      return 1;
    }

    return 0;
  };

  return {
    ..._genericRepository,
    updateChildAttendeeStatusEventById,
    getChildAttendeesByEventId,
    getAttendeesByEventId,
    getAll,
    addAttendee,
    updateTicketRemainingAndSold,
  };
}
