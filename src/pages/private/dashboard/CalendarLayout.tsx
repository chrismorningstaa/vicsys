import React, { useState } from "react";
import { Calendar, Modal, theme } from "antd";
import { Moment } from "moment";
import eventService from "../../../firebase/services/eventService";
import { IEvent } from "../../../interfaces/firebase/IEvent";
import { convertUnixToDateText } from "../../../utils/dateTimeFormat";

const CalendarWithModal = () => {
  const _eventService = eventService();
  const [date, setDate] = useState<Moment | null>(null);
  const [events, setEvents] = useState<IEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelect = async (selectedDate: any) => {
    setIsModalOpen(true);
    const newEvents = await _eventService.getByDate(selectedDate);
    setEvents(newEvents);
    setDate(selectedDate);
  };
  const { token } = theme.useToken();
  const wrapperStyle: React.CSSProperties = {
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
  };
  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <div style={wrapperStyle}>
        <Calendar
          fullscreen={false}
          onSelect={(date: any) => handleSelect(date)}
          className="rounded-md border"
        />
      </div>
      {date && (
        <EventList
          selectedDate={date}
          events={events}
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
        />
      )}
    </div>
  );
};
const EventList = (props: {
  selectedDate: Moment;
  events: IEvent[];
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}) => {
  const { events, isOpen, setIsOpen, selectedDate } = props;
  return (
    <Modal
      open={isOpen}
      onCancel={() => setIsOpen(false)}
      width={900}
      title={selectedDate.date()}
    >
      <div className="row g-4">
        {events.map((event) => (
          <div className="col-lg-4" key={event.id}>
            <div className="card h-100">
              <img
                src={event.image}
                alt={event.eventName}
                className="card-img-top"
              />
              <div className="card-body">
                <h5 className="card-title">{event.eventName}</h5>
                <p className="card-text">{event.description}</p>
                <p className="text-muted">Venue: {event.venue}</p>
                <p className="text-muted">
                  Start: {convertUnixToDateText(event.startTime)}
                </p>
                <p className="text-muted">
                  End: {convertUnixToDateText(event.endTime)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default CalendarWithModal;
