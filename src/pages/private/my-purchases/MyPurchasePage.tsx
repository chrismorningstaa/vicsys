import { useQuery } from "@tanstack/react-query";
import { Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import DataTable, { ColumnConfig } from "../../../components/DataTable";
import useUserContext from "../../../contexts/useUserContext";
import userService from "../../../firebase/services/userService";
import { IMyPuchaseEvent } from "../../../interfaces/firebase/INonTechUser";
import eventService from "../../../firebase/services/eventService";
import { TicketStatus } from "../../../interfaces/firebase/ITicket";
import { TicketStatusText } from "../../../components/TicketStatusText";
import TicketQrCodeModal from "../../../components/TicketQrCodeModal";

interface NewMyPurchase extends IMyPuchaseEvent {
  event?: string;
}
export default function MyPurchasePage() {
  const { user } = useUserContext();
  const _userService = userService();
  const _eventService = eventService();
  const [myPurchaseEvents, setMyPurchaseEvents] = useState<NewMyPurchase[]>([]);
  const [isQrModalVisible, setIsQrModalVisible] = useState<boolean>(false);
  const [selectedPurchase, setSelectedPurchase] =
    useState<IMyPuchaseEvent | null>(null);

  const { data: events } = useQuery({
    queryKey: ["events"],
    queryFn: _eventService.getAll,
  });
  const handleGetEvent = (eventId: string) => {
    return events?.find((e) => e.id == eventId);
  };
  // const { data: myPurchaseEvents } = useQuery({
  //   queryKey: ["me"],
  //   queryFn: async () => {
  //     const newUser = await _userService.getById(user?.uid ?? "");
  //     return newUser?.myPurchaseEvents.map((m) => ({
  //       ...m,
  //       event: handleGetEvent(m.eventId ?? "")?.eventName,
  //     }));
  //   },
  // });
  const handleGetMyPurchase = async () => {
    const newUser = await _userService.getById(user?.uid ?? "");
    const newMyPurchase = newUser?.myPurchaseEvents.map((m) => ({
      ...m,
      event: handleGetEvent(m.eventId ?? "")?.eventName,
    }));
    console.log(newMyPurchase);
    setMyPurchaseEvents(newMyPurchase ?? []);
  };
  useEffect(() => {
    if (events) handleGetMyPurchase();
  }, [events]);
  const columns: ColumnConfig[] = [
    {
      title: "Event",
      dataIndex: "event",
      width: 600,
      // render: (eventId: string) => (
      //   <span>{handleGetEvent(eventId)?.eventName}</span>
      // ),
    },
    {
      title: "location",
      dataIndex: "location",
      width: 600,
    },
    {
      title: "ticketName",
      dataIndex: "ticketName",
      width: 600,
    },
    {
      title: "status",
      dataIndex: "status",
      width: 600,
      render: (status: TicketStatus) => <TicketStatusText status={status} />,
    },
    {
      title: "ticketName",
      dataIndex: "ticketName",
      width: 600,
    },
    {
      title: "Gcash RefNo",
      dataIndex: "gcashRefNo",
      width: 600,
    },
    {
      title: " QR code",
      dataIndex: "",
      width: 300,
      render: (data: IMyPuchaseEvent) => (
        <>
          <Button
            type="primary"
            shape="round"
            icon={<EyeOutlined />}
            onClick={() => {
              setIsQrModalVisible(true);
              setSelectedPurchase(data);
            }}
          />
        </>
      ),
    },
  ];
  if (!user) return;

  return (
    <>
      <TicketQrCodeModal
        isForKids={
          handleGetEvent(selectedPurchase?.eventId ?? "")?.isForKids ?? false
        }
        userId={user.uid}
        purchaseEvent={selectedPurchase}
        isOpen={isQrModalVisible}
        setIsOpen={setIsQrModalVisible}
      />
      <DataTable dataSource={myPurchaseEvents} columns={columns} />
    </>
  );
}
