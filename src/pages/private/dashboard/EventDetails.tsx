import { Button, Modal, Progress, Tabs, TabsProps, Tooltip } from "antd";
import { convertUnixToTimeText } from "../../../utils/dateTimeFormat";
import DataTable, { ColumnConfig } from "../../../components/DataTable";
import { IEvent } from "../../../interfaces/firebase/IEvent";
import { useState } from "react";
import MyPurchaseEventCollapse from "../../../components/MyPurchaseEventCollapse";
import eventService from "../../../firebase/services/eventService";
import { IUser } from "../../../interfaces/firebase/IUser";
import {
  IChildWithParent,
  IChildWithParentAndStatus,
} from "../../../interfaces/firebase/IChild";
import {
  CloseCircleOutlined,
  EditOutlined,
  EyeOutlined,
  SmileOutlined,
  UserOutlined,
} from "@ant-design/icons";
import ChildQrCodeModal from "../../../components/ChildQrCodeModal";
import EditChildStatusModal from "../../../components/EditChildStatusModal";

export default function EventDetails(props: {
  events: IEvent[];
  refetch: () => void;
}) {
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const _eventService = eventService();
  const { events, refetch } = props;
  const [nonTechAndUsers, setNonTechAndUsers] = useState<IUser[]>([]);
  const [children, setChildren] = useState<IChildWithParentAndStatus[]>([]);

  const handleGetNonTechAndUsers = async (id: string | undefined) => {
    if (!id) throw new Error("id must not null");
    const attendees = await _eventService.getAttendeesByEventId(id);
    setNonTechAndUsers(attendees);
  };

  const handleGetChildren = async (eventId: string | undefined) => {
    if (!eventId) throw new Error("id must not null");

    const children = await _eventService.getChildAttendeesByEventId(eventId);
    setChildren(children);
  };

  const [isAttendeesModalOpen, setIsAttendeesModalOpen] = useState(false);

  const handleClose = () => {
    setIsAttendeesModalOpen(false);
  };
  const handleClickEvent = async (event: IEvent) => {
    setSelectedEvent(event);
    console.log(event.isForKids);
    if (event.isForKids) handleGetChildren(event.id);
    handleGetNonTechAndUsers(event.id);
    setIsAttendeesModalOpen(true);
  };
  const refetchAll = () => {
    refetch();
    handleGetChildren(selectedEvent?.id);
    handleGetNonTechAndUsers(selectedEvent?.id);
  };

  return (
    <>
      <EventAttendeesDetailModal
        refetch={refetchAll}
        children={children}
        selectedEvent={selectedEvent}
        nonTechAndUsers={nonTechAndUsers}
        isModalOpen={isAttendeesModalOpen}
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

export const EventAttendeesDetailModal = (props: {
  nonTechAndUsers: IUser[];
  children: IChildWithParentAndStatus[];
  selectedEvent: IEvent | null;
  isModalOpen: boolean;
  handleClose: () => void;
  refetch: () => void;
}) => {
  const {
    selectedEvent,
    nonTechAndUsers = [],
    children = [],
    isModalOpen,
    handleClose,
    refetch,
  } = props;

  const [selectedChild, setSelectedChild] = useState<IChildWithParent | null>(
    null
  );
  const [isChildQrModalOpen, setIsChildQrModalOpen] = useState<boolean>(false);
  const [isEditChildStatusModalOpen, setIsEditChildStatusModalOpen] =
    useState<boolean>(false);
  const handleCloseModal = () => {
    setSelectedChild(null);
    setIsEditChildStatusModalOpen(false);
    setIsChildQrModalOpen(false);
    refetch();
  };
  const attendeeColumns: ColumnConfig[] = [
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
  const childColumns: ColumnConfig[] = [
    {
      title: "Parent",
      dataIndex: "parentName",
    },
    {
      title: "First Name",
      dataIndex: "firstName",
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
    },
    {
      title: "Nickname",
      dataIndex: "nickname",
    },
    {
      title: "Food Allergies",
      dataIndex: "",
      width: 200,
      render: (data: IChildWithParent) => {
        if (data?.hasFoodAllergies) {
          return <span>{data.foodAllergies}</span>;
        }
        return (
          <span>
            <CloseCircleOutlined style={{ color: "red" }} />
          </span>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
    },
    {
      title: "Action",
      dataIndex: "",
      render: (data: IChildWithParent) => (
        <>
          <Tooltip title={"View QR"}>
            <Button
              type="primary"
              shape="circle"
              icon={<EyeOutlined />}
              onClick={() => {
                setIsChildQrModalOpen(true);
                setSelectedChild(data);
              }}
            />
          </Tooltip>

          <Tooltip title={"Edit status"}>
            <Button
              type="primary"
              shape="circle"
              style={{ backgroundColor: "green" }}
              icon={<EditOutlined />}
              onClick={() => {
                setIsEditChildStatusModalOpen(true);
                setSelectedChild(data);
              }}
            />
          </Tooltip>
        </>
      ),
    },
  ];
  const tabs: any[] = [
    {
      key: 1,
      label: `Parent`,
      children: (
        <>
          <DataTable dataSource={nonTechAndUsers} columns={attendeeColumns} />
          <h6>Total: {nonTechAndUsers.length}</h6>
        </>
      ),
      icon: <UserOutlined />,
    },
    {
      disabled: !selectedEvent?.isForKids,
      key: 2,
      label: `Children`,
      children: (
        <>
          <DataTable dataSource={children} columns={childColumns} />
          <h6>Total: {children.length}</h6>
        </>
      ),
      icon: <SmileOutlined />,
    },
  ];
  return (
    <>
      <ChildQrCodeModal
        selectedEvent={selectedEvent}
        selectedChild={selectedChild}
        isOpen={isChildQrModalOpen}
        onClose={handleCloseModal}
      />
      <EditChildStatusModal
        selectedChild={selectedChild}
        selectedEvent={selectedEvent}
        isOpen={isEditChildStatusModalOpen}
        onClose={handleCloseModal}
      />
      <Modal
        title={`${selectedEvent?.eventName} Attendees`}
        open={isModalOpen}
        onOk={handleClose}
        onCancel={handleClose}
        width={1200}
      >
        <Tabs defaultActiveKey="1" items={tabs} />
      </Modal>
    </>
  );
};

export const EventChildrenDetailModal = (props: {
  children: IChildWithParentAndStatus[];
  selectedEvent: IEvent | null;
  isModalOpen: boolean;
  handleClose: () => void;
  refetch: () => void;
}) => {
  const { selectedEvent, children, isModalOpen, handleClose, refetch } = props;

  const [selectedChild, setSelectedChild] = useState<IChildWithParent | null>(
    null
  );
  const [isChildQrModalOpen, setIsChildQrModalOpen] = useState<boolean>(false);
  const [isEditChildStatusModalOpen, setIsEditChildStatusModalOpen] =
    useState<boolean>(false);
  const handleCloseModal = () => {
    setSelectedChild(null);
    setIsEditChildStatusModalOpen(false);
    setIsChildQrModalOpen(false);
    refetch();
  };
  const columns: ColumnConfig[] = [
    {
      title: "Parent",
      dataIndex: "parentName",
    },
    {
      title: "First Name",
      dataIndex: "firstName",
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
    },
    {
      title: "Nickname",
      dataIndex: "nickname",
    },
    {
      title: "Food Allergies",
      dataIndex: "",
      width: 200,
      render: (data: IChildWithParent) => {
        if (data?.hasFoodAllergies) {
          return <span>{data.foodAllergies}</span>;
        }
        return (
          <span>
            <CloseCircleOutlined style={{ color: "red" }} />
          </span>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
    },
    {
      title: "Action",
      dataIndex: "",
      render: (data: IChildWithParent) => (
        <>
          <Tooltip title={"View QR"}>
            <Button
              type="primary"
              shape="circle"
              icon={<EyeOutlined />}
              onClick={() => {
                setIsChildQrModalOpen(true);
                setSelectedChild(data);
              }}
            />
          </Tooltip>

          <Tooltip title={"Edit status"}>
            <Button
              type="primary"
              shape="circle"
              style={{ backgroundColor: "green" }}
              icon={<EditOutlined />}
              onClick={() => {
                setIsEditChildStatusModalOpen(true);
                setSelectedChild(data);
              }}
            />
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <>
      <ChildQrCodeModal
        selectedEvent={selectedEvent}
        selectedChild={selectedChild}
        isOpen={isChildQrModalOpen}
        onClose={handleCloseModal}
      />
      <EditChildStatusModal
        selectedChild={selectedChild}
        selectedEvent={selectedEvent}
        isOpen={isEditChildStatusModalOpen}
        onClose={handleCloseModal}
      />
      <Modal
        title={`${selectedEvent?.eventName} Children Attendees`}
        open={isModalOpen}
        onOk={handleClose}
        onCancel={handleClose}
        width={1200}
      >
        <DataTable dataSource={children} columns={columns} />
        <h6>Total: {children.length}</h6>
      </Modal>
    </>
  );
};
