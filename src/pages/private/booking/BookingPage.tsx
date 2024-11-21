import { useQuery } from "@tanstack/react-query";
import eventService from "../../../firebase/services/eventService";
import BookingEventCard from "./components/BookingEventCard";
import { Input, Switch, Typography } from "antd";
import BookingModal from "./components/BookingModal";
import { useState } from "react";
import { IEvent } from "../../../interfaces/firebase/IEvent";
import { SearchOutlined } from "@ant-design/icons";
import BookingKidsModal from "./components/BookingKidsModal";

export default function BookingPage() {
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const [events, setEvents] = useState<IEvent[]>([]);
  const [isForKids, setIsforKids] = useState<boolean>(false);
  const [isBookingModalVisible, setIsBookingModalVisible] =
    useState<boolean>(false);
  const _eventService = eventService();
  const { refetch } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const events = await _eventService.getAll();
      const filtredEvents = events.filter((e) => e.isForKids == isForKids);
      setEvents(filtredEvents);
      return filtredEvents;
    },
  });
  const handleIsKidChange = async (value: boolean) => {
    setIsforKids(value);
    const events = await _eventService.getAll();
    const filtredEvents = events.filter((e) => e.isForKids == value);
    setEvents(filtredEvents);
  };
  const handleSearch = async (value: string) => {
    if (!value) refetch();

    const events = await _eventService.getAll();
    const filtredEvents = events.filter(
      (e) =>
        e.isForKids == isForKids &&
        e.eventName.toLocaleLowerCase().includes(value.toLocaleLowerCase())
    );
    setEvents(filtredEvents);
  };
  return (
    <>
      {isForKids ? (
        <BookingKidsModal
          isOpen={isBookingModalVisible}
          setIsOpen={setIsBookingModalVisible}
          selectedEvent={selectedEvent}
          setSelectedEvent={setSelectedEvent}
        />
      ) : (
        <BookingModal
          isOpen={isBookingModalVisible}
          setIsOpen={setIsBookingModalVisible}
          selectedEvent={selectedEvent}
          refetch={refetch}
        />
      )}

      <div className="d-flex ">
        <Input
          placeholder="Search..."
          onChange={(e) => handleSearch(e.target.value)}
          prefix={<SearchOutlined />}
          style={{ width: "300px", marginRight: "2rem" }}
        />
        <Typography>
          <Switch
            defaultValue={isForKids}
            onChange={(value) => {
              handleIsKidChange(value);
              console.log(value);
            }}
          />
          <label style={{marginLeft: "1rem"}}> For Kids </label>
          
        </Typography>
      </div>

      <div className="row mt-2">
        {events?.map((event) => (
          <div className="col-sm">
            <BookingEventCard
              event={event}
              setSelectedEvent={setSelectedEvent}
              setIsBookingModalVisible={setIsBookingModalVisible}
            />
          </div>
        ))}
      </div>
    </>
  );
}
