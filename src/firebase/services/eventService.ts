import {
  EventChildStatus,
  IEvent,
  IEventSave,
  IOngoingEvent,
} from "../../interfaces/firebase/IEvent";
import documentRepository from "../repositories/documentRepository";
import eventRepository from "../repositories/eventRepository";
import { v4 as uuidv4 } from "uuid";
import { convertUnixToDate } from "../../utils/dateTimeFormat";
import moment, { Moment } from "moment";
export default function eventService() {
  const _eventRepository = eventRepository();
  const _documentRepository = documentRepository();

  const add = async (data: IEventSave) => {
    let imageUrl = "";
    if (data.image instanceof File) {
      const { url } = await _documentRepository.uploadToFirebase(
        data.image,
        `event_images/${uuidv4()}.png`
      );
      const newTicketCategories = data.ticketCategories.map((t) => ({
        ...t,
        ticketSold: 0,
        ticketRemaining: t.ticketTotal,
      }));

      imageUrl = url;
      const newData: IEvent = {
        ...data,
        attendees: [],
        childrenAttendees: [],
        endTime: new Date(data.endTime),
        startTime: new Date(data.startTime),
        image: typeof data.image == "string" ? data.image : imageUrl,
        ticketCategories: newTicketCategories,
      };
      return _eventRepository.add(newData);
    }
  };

  const update = async (id: string, data: IEventSave) => {
    if (data.image instanceof File) {
      const { url } = await _documentRepository.uploadToFirebase(
        data.image,
        `event_images/${uuidv4()}.png`
      );
      const newData: IEvent = {
        ...data,
        endTime: new Date(data.endTime),
        startTime: new Date(data.startTime),
        image: url,
      };
      return await _eventRepository.update(id, newData);
    }
    const newData: IEvent = {
      ...data,
      endTime: new Date(data.endTime),
      startTime: new Date(data.startTime),
      image: data.image,
    };
    return await _eventRepository.update(id, newData);
  };
  const deleteById = async (id: string) => {
    await _eventRepository.deleteById(id);
  };

  const getById = async (id: string) => {
    return await _eventRepository.getById(id);
  };

  const getAll = async () => {
    return await _eventRepository.getAll();
  };

  const getTotalEvents = async () => {
    const events = await _eventRepository.getAll();
    return events.length;
  };

  const addAttendee = async (eventId: string, userId: string) => {
    return await _eventRepository.addAttendee(eventId, userId);
  };
  const getAttendeesByEventId = async (eventId: string) => {
    return await _eventRepository.getAttendeesByEventId(eventId);
  };
  const getChildAttendeesByEventId = async (eventId: string) => {
    return await _eventRepository.getChildAttendeesByEventId(eventId);
  };

  const getOngoingEvents = async (): Promise<IOngoingEvent[]> => {
    const events = await _eventRepository.getAll();
    const dateNow = moment();

    const ongoingEvents = events.filter((event) => {
      const startDate = convertUnixToDate(event.startTime);
      const endDate = convertUnixToDate(event.endTime);
      return startDate <= dateNow && endDate >= dateNow;
    });

    const result = await Promise.all(
      ongoingEvents.map(async (event) => {
        if (!event.id) {
          throw new Error(`Event found with no ID: ${JSON.stringify(event)}`);
        }
        const attendees = await _eventRepository.getAttendeesByEventId(
          event.id
        );
        return {
          ...event,
          attendees,
        };
      })
    );

    return result;
  };
  const getByDate = async (date: Moment): Promise<IEvent[]> => {
    const events = await _eventRepository.getAll();

    const filteredEvents = events.filter((event) => {
      const startDate = convertUnixToDate(event.startTime);
      const endDate = convertUnixToDate(event.endTime);
      return startDate <= date && endDate >= date;
    });
    return filteredEvents;
  };
  const updateChildAttendeeStatusEventById = async (
    eventId: string,
    newStatus: EventChildStatus,
    childId: string
  ) => {
    await _eventRepository.updateChildAttendeeStatusEventById(
      eventId,
      newStatus,
      childId
    );
  };

  return {
    updateChildAttendeeStatusEventById,
    getByDate,
    getOngoingEvents,
    getAttendeesByEventId,
    getChildAttendeesByEventId,
    add,
    update,
    deleteById,
    getAll,
    getById,
    getTotalEvents,
    addAttendee,
  };
}
