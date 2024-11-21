import { Modal, Progress } from "antd";
import { convertUnixToTimeText } from "../../../utils/dateTimeFormat";
import DataTable, { ColumnConfig } from "../../../components/DataTable";
import { IEvent } from "../../../interfaces/firebase/IEvent";
import { useState } from "react";
import MyPurchaseEventCollapse from "../../../components/MyPurchaseEventCollapse";
import eventService from "../../../firebase/services/eventService";
import { IUser } from "../../../interfaces/firebase/IUser";

export default function EventDetails(props: {
  events: IEvent[];
  refetch: () => void;
}) {
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const _eventService = eventService();
  const { events, refetch } = props;
  const [nonTechAndUsers, setNonTechAndUsers] = useState<IUser[]>([]);
  // const { data: nonTechAndUsers, refetch: refetchUsers } = useQuery({
  //   queryKey: ["nonTechAndUsers"],
  //   queryFn: async () =>
  //     await _eventService.getAttendeesByEventId(selectedEvent?.id ?? ""),
  //   initialData: [],
  // });
  const handleGetNonTechAndUsers = async (id: string | undefined) => {
    if (!id) throw new Error("id must not null");
    const attendees = await _eventService.getAttendeesByEventId(id);
    setNonTechAndUsers(attendees);
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleClose = () => {
    setIsModalOpen(false);
  };
  const handleClickEvent = async (event: IEvent) => {
    setSelectedEvent(event);
    handleGetNonTechAndUsers(event.id);
    setIsModalOpen(true);
  };
  const refetchAll = () => {
    refetch();
    handleGetNonTechAndUsers(selectedEvent?.id);
  };

  return (
    <>
      <EventDetailModal
        refetch={refetchAll}
        eventName={selectedEvent?.eventName || ""}
        nonTechAndUsers={nonTechAndUsers}
        isModalOpen={isModalOpen}
        handleClose={handleClose}
      />
      {events?.map((event, index) => {
        const { image, eventName, endTime, startTime } = event;
        const ticketTotal = event.ticketCategories.reduce(
          (curr, prev) => (curr += prev.ticketTotal),
          0
        );
        const totalSold = event.ticketCategories.reduce(
          (curr, prev) => (curr += prev.ticketSold ?? 0),
          0
        );
        const ticketPercent = (totalSold / ticketTotal) * 100;

        return (
          <div
            key={index}
            onClick={() => {
              handleClickEvent(event);
            }}
            className="cursor-pointer"
          >
            <div className="event-item">
              <img
                src={image}
                alt={`${eventName} event`}
                className="w-full object-cover rounded-t-lg"
              />
              <div className="event-details">
                <p className="event-title font-semibold text-lg">{eventName}</p>
                <p className="event-time text-gray-600">
                  {convertUnixToTimeText(startTime)} -{" "}
                  {convertUnixToTimeText(endTime)}
                </p>
                <Progress percent={ticketPercent} showInfo={false} />
                <p className="ticket-count text-sm text-gray-700">
                  {totalSold} / {ticketTotal}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

export const EventDetailModal = (props: {
  nonTechAndUsers: IUser[];
  eventName: string;
  isModalOpen: boolean;
  handleClose: () => void;
  refetch: () => void;
}) => {
  const {
    eventName,
    nonTechAndUsers = [],
    isModalOpen,
    handleClose,
    refetch,
  } = props;

  const columns: ColumnConfig[] = [
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Gender",
      dataIndex: "gender",
    },
    {
      title: "Contact",
      dataIndex: "contact",
    },
    {
      title: "Ministry",
      dataIndex: "ministry",
    },
    {
      title: "My Purchases",
      dataIndex: "",
      render: (data: IUser) => {
        return (
          <MyPurchaseEventCollapse
            refetch={refetch}
            userId={data.id ?? ""}
            purchaseEvents={data?.myPurchaseEvents ?? []}
          />
        );
      },
    },
  ];

  return (
    <Modal
      title={`${eventName} Attendees`}
      open={isModalOpen}
      onOk={handleClose}
      onCancel={handleClose}
      width={1200}
    >
      <DataTable dataSource={nonTechAndUsers} columns={columns} />
      <h6>Total: {nonTechAndUsers.length}</h6>
    </Modal>
  );
};
