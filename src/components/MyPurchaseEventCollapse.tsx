import { Button, Collapse, Modal } from "antd";
import { IMyPuchaseEvent } from "../interfaces/firebase/INonTechUser";
import eventService from "../firebase/services/eventService";
import { useQuery } from "@tanstack/react-query";
import { EditOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { IEvent } from "../interfaces/firebase/IEvent";
import { BaseButtonProps } from "antd/es/button/button";
import { TicketStatus } from "../interfaces/firebase/ITicket";
import userService from "../firebase/services/userService";
import Swal from "sweetalert2";
import { TicketStatusText } from "./TicketStatusText";
import TicketQrCodeModal from "./TicketQrCodeModal";
import EditTicketStatusModal from "./EditTicketStatusModal";

export default function MyPurchaseEventCollapse(props: {
  purchaseEvents: IMyPuchaseEvent[];
  userId: string;
  refetch: () => void;
}) {
  const { userId, refetch } = props;
  const [purchaseEvents, setMyPurchaseEvents] = useState<IMyPuchaseEvent[]>([]);
  useEffect(() => {
    setMyPurchaseEvents(props.purchaseEvents);
  }, [props.purchaseEvents]);

  const _eventService = eventService();
  const _userService = userService();
  const [isUpdateStatusModalVisible, setIsUpdateStatusModalVisible] =
    useState<boolean>(false);
  const [isQrModalVisible, setIsQrModalVisible] = useState<boolean>(false);
  const [selectedPurchase, setSelectedPurchase] =
    useState<IMyPuchaseEvent | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const { data: events } = useQuery({
    queryKey: ["events"],
    queryFn: _eventService.getAll,
    initialData: [],
  });
  if (!purchaseEvents?.length) {
    return <span className="text-sm text-gray-500">No events</span>;
  }

  const handleGetEventById = (id: string) => {
    return events.find((e) => e.id == id);
  };
  const handleCloseUpdateStratusModal = () => {
    setIsUpdateStatusModalVisible(false);
  };

  const handleUpdateStatus = async (status: TicketStatus) => {
    if (!selectedPurchase) return;

    await _userService.updateUserPurchaseEvent(
      userId,
      selectedPurchase?.ticketId ?? "",
      { ...selectedPurchase, status }
    );
    setIsUpdateStatusModalVisible(false);
    refetch();
    Swal.fire({
      icon: "success",
      title: "Ticket status succesfully updated",
      showConfirmButton: false,
      timer: 1500,
    });
  };
  const CollapsibleChildren = () => (
    <div className="space-y-2">
      {purchaseEvents?.map((event) => (
        <div key={event.eventId} className="text-sm row">
          <span className="font-medium">
            Event: {handleGetEventById(event.eventId)?.eventName}
          </span>

          <span>Ticket Name: {event.ticketName}</span>
          <span>Gcash RefNo: {event.gcashRefNo}</span>
          <span>
            Status: <TicketStatusText status={event?.status} />{" "}
            <Button
              type="primary"
              shape="round"
              size="small"
              onClick={() => {
                setSelectedPurchase(event);
                setIsUpdateStatusModalVisible(true);
                setSelectedEvent(handleGetEventById(event.eventId) ?? null);
              }}
              icon={<EditOutlined />}
            />
          </span>

          <a
            // href={event.qrcodeUrl}
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              setSelectedPurchase(event);
              setIsQrModalVisible(true);
            }}
          >
            View QR Code
          </a>
        </div>
      ))}
    </div>
  );
  return (
    <>
      <TicketQrCodeModal
        isForKids={
          handleGetEventById(selectedPurchase?.eventId ?? "")?.isForKids ??
          false
        }
        userId={userId}
        setIsOpen={setIsQrModalVisible}
        isOpen={isQrModalVisible}
        purchaseEvent={selectedPurchase}
      />

      <EditTicketStatusModal
        handleUpdateStatus={handleUpdateStatus}
        handleClose={handleCloseUpdateStratusModal}
        isModalOpen={isUpdateStatusModalVisible}
        selectedPurchase={selectedPurchase}
        selectedEvent={selectedEvent}
      />
      <Collapse
        bordered={false}
        size="small"
        className="bg-transparent"
        items={[
          {
            key: "1",
            label: `${purchaseEvents.length} Ticket${
              purchaseEvents.length > 1 ? "s" : ""
            }`,
            children: <CollapsibleChildren />,
          },
        ]}
      />
    </>
  );
}
