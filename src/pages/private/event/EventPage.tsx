import { Button, Input } from "antd";
import EventCard from "./components/EventCard";
import { useQuery } from "@tanstack/react-query";
import eventService from "../../../firebase/services/eventService";
import { useState } from "react";
import { IEvent } from "../../../interfaces/firebase/IEvent";
import Swal from "sweetalert2";
import { EventContext } from "./useEventContext";
import EventSaveModal from "./modals/EventSave";
import { SearchOutlined } from "@ant-design/icons";

export default function EventPage() {
  const _eventService = eventService();
  const [events, setEvents] = useState<IEvent[]>([]);
  const { refetch } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const result = await _eventService.getAll();
      setEvents(result);
      return result;
    },
  });

  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [imageUpload, setImageUpload] = useState<File | null>(null);
  const handleDeleteConfirmation = () => {
    Swal.fire({
      icon: "warning",
      title: "Are you sure you want to delete?",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "red",
    }).then(async (result) => {
      if (result.isConfirmed && selectedEvent?.id) {
        await _eventService.deleteById(selectedEvent.id);
        refetch();
        Swal.fire({
          icon: "success",
          title: "Successfully deleted",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  };
  const handleSearch = (value: string) => {
    if (!value) return refetch();

    const filteredEvents = events.filter((e) =>
      e.eventName.toLocaleLowerCase().includes(value.toLocaleLowerCase())
    );
    setEvents(filteredEvents);
  };
  return (
    <EventContext.Provider
      value={{
        selectedEvent,
        setSelectedEvent,
        isSaveModalOpen,
        setIsSaveModalOpen,
        imageUpload,
        setImageUpload,
        handleDeleteConfirmation,
        refetch,
      }}
    >
      <EventSaveModal />
      <div className="d-flex justify-content-between">
        <h1>Events</h1>
        <div>
          <Input
            className="m-2"
            placeholder="Search..."
            onChange={(e) => handleSearch(e.target.value)}
            prefix={<SearchOutlined />}
            style={{ width: "300px" }}
          />
          <Button
            type="primary"
            onClick={() => {
              setSelectedEvent(null);
              setIsSaveModalOpen(true);
              setImageUpload(null);
            }}
          >
            Create Event
          </Button>
        </div>
      </div>
      <div className="row">
        {events?.map((event, index) => (
          <div key={index} className="col-lg-4">
            <EventCard {...event} />
          </div>
        ))}
      </div>
    </EventContext.Provider>
  );
}
