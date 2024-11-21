import { useQuery } from "@tanstack/react-query";
import nonTechUserService from "../../../firebase/services/nonTechUserService";
import {
  Button,
  Modal,
  Form,
  Input,
  message,
  Card,
  Image,
  Typography,
  Tag,
  Select,
  Alert,
} from "antd";
import {
  INonTechUser,
  IMyPuchaseEvent,
} from "../../../interfaces/firebase/INonTechUser";
import {
  BookOutlined,
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  MinusOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import DataTable, { ColumnConfig } from "../../../components/DataTable";
import { FormGroupItemsProps } from "../../../components/FormControl";
import eventService from "../../../firebase/services/eventService";
import { IEvent, ITicketCategory } from "../../../interfaces/firebase/IEvent";
import { convertUnixToTimeText } from "../../../utils/dateTimeFormat";
import MyPurchaseEventCollapse from "../../../components/MyPurchaseEventCollapse";
import { TicketStatus } from "../../../interfaces/firebase/ITicket";
import { v4 as uuidv4 } from "uuid";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import SaveNonTechModal from "./modal/SaveNonTechModal";
import ChildrenModal, {
  useChildrenModal,
} from "../../../components/ChildrenModal";
import childrenService from "../../../firebase/services/childrenService";
import Swal from "sweetalert2";

const ministryOptions = [
  { value: "Victory Group Leaders", label: "Victory Group Leaders" },
  { value: "Ushering Ministry", label: "Ushering Ministry" },
  { value: "Music Ministry", label: "Music Ministry" },
  { value: "Kids Ministry", label: "Kids Ministry" },
  { value: "Stage Management", label: "Stage Management" },
  { value: "Technical Support", label: "Technical Support" },
  { value: "Communication", label: "Communication" },
  { value: "Prayer Ministry", label: "Prayer Ministry" },
  { value: "Admin Support", label: "Admin Support" },
  { value: "Real Life Coaches", label: "Real Life Coaches" },
  { value: "Special Project Teams", label: "Special Project teams" },
];

export default function NonTechUserPage() {
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState<boolean>(false);
  const [isOpenSaveModal, setIsOpenSaveModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<INonTechUser | null>(null);

  const [isOpenAssignEventModal, setIsOpenAssignEventModal] =
    useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);

  const [error, setError] = useState<string>("");
  const [form] = Form.useForm();
  const _nonTechUserService = nonTechUserService();
  const _childrenService = childrenService();
  const _eventservice = eventService();
  const { data: nontechuser, refetch: refetchnontechuser } = useQuery({
    queryKey: ["nontechuser"],
    queryFn: async () => await _nonTechUserService.getAll(),
    initialData: [],
  });

  const { data: event, refetch: refetchevent } = useQuery({
    queryKey: ["events"],
    queryFn: async () => await _eventservice.getAll(),
    initialData: [],
  });

  const {
    children,
    setChildren,
    isChildrenModalVisible,
    setIsChildrenModalVisible,
    childData,
  } = useChildrenModal();
  useQuery({
    queryKey: ["nontechuser", selectedUser],
    queryFn: async () => {
      const result = await _childrenService.getByUserId(selectedUser?.id ?? "");
      setChildren(result);
      return result;
    },

    initialData: [],
  });

  const handleMinistryChange = async (value: string, userId: string) => {
    try {
      const currentUser = nontechuser.find((user) => user.id === userId);

      if (!currentUser) {
        throw new Error("User not found");
      }

      await _nonTechUserService.update(userId, {
        ...currentUser,
        ministry: value,
      });

      message.success("Ministry updated successfully");
      refetchnontechuser();
    } catch (error) {
      message.error("Failed to update ministry");
      console.error("Error updating ministry:", error);
    }
  };
  const addFormGroups: FormGroupItemsProps[] = [
    {
      name: "name",
      label: "Name",
      rules: [{ required: true, message: "Please input the name!" }],
      component: <Input />,
    },
    {
      name: "contact",
      label: "Contact",
      rules: [{ required: true, message: "Please input the contact!" }],
      component: <Input />,
    },
    {
      name: "age",
      label: "Age",
      rules: [{ required: true, message: "Please input the age!" }],
      component: <Input type="number" />,
    },
    {
      name: "email",
      label: "Email",
      rules: [{ required: true, message: "Please input the email!" }],
      component: <Input type="email" />,
    },
    {
      name: "password",
      label: "Password",
      rules: [
        { required: !selectedUser, message: "Please input the password!" },
        { min: 6, message: "Password should be at least 6 characters" },
      ],
      component: <Input type="password" />,
    },
    {
      name: "birthday",
      label: "Birthday",
      rules: [{ required: true, message: "Please input the birthday!" }],
      component: <Input type="date" />,
    },
    {
      name: "gender",
      label: "Gender",
      rules: [{ required: true, message: "Please input the gender!" }],
      component: (
        <Select placeholder="Select Gender">
          <Select.Option value="Male">Male</Select.Option>
          <Select.Option value="Female">Female</Select.Option>
        </Select>
      ),
    },
    {
      name: "ministry",
      label: "Ministry",
      rules: [{ required: true, message: "Please input the ministry!" }],
      component: (
        <Select placeholder="Select Ministry">
          <Select.Option value="Victory Group Leaders">
            Victory Group Leaders
          </Select.Option>
          <Select.Option value="Ushering Ministry">
            Ushering Ministry
          </Select.Option>
          <Select.Option value="Music Ministry">Music Ministry</Select.Option>
          <Select.Option value="Kids Ministry">Kids Ministry</Select.Option>
          <Select.Option value="Stage Management">
            Stage Management
          </Select.Option>
          <Select.Option value="Technical Support">
            Technical Support
          </Select.Option>
          <Select.Option value="Communication">Communication</Select.Option>
          <Select.Option value="Prayer Ministry">Prayer Ministry</Select.Option>
          <Select.Option value="Admin Support">Admin Support</Select.Option>
          <Select.Option value="Real Life Coaches">
            Real Life Coaches
          </Select.Option>
          <Select.Option value="Special Project Teams">
            Special Project teams
          </Select.Option>
        </Select>
      ),
    },
  ];
  const updateFromGroups: FormGroupItemsProps[] = addFormGroups.filter(
    (c) => c.name !== "password"
  );

  const columns: ColumnConfig[] = [
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Contact",
      dataIndex: "contact",
    },
    {
      title: "Age",
      dataIndex: "age",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Birthday",
      dataIndex: "birthday",
    },
    {
      title: "Gender",
      dataIndex: "gender",
    },
    {
      title: "Ministry",
      dataIndex: "ministry",
      render: (value: string, record: INonTechUser) => (
        <Select
          value={value}
          style={{ width: 180 }}
          onChange={(newValue) =>
            handleMinistryChange(newValue, record.id || "")
          }
        >
          {ministryOptions.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: "My Events",
      dataIndex: "",
      render: (data: INonTechUser) => (
        <MyPurchaseEventCollapse
          refetch={refetchnontechuser}
          userId={data.id ?? ""}
          purchaseEvents={data.myPurchaseEvents ?? []}
        />
      ),
    },
    {
      title: "Actions",
      dataIndex: "",
      render: (data: INonTechUser) => (
        <>
          <Button
            type="primary"
            danger
            shape="circle"
            icon={<DeleteOutlined />}
            onClick={() => {
              form.setFieldsValue(data);
              setSelectedUser(data);
              setIsOpenDeleteModal(true);
            }}
          />
          <Button
            type="primary"
            shape="circle"
            icon={<EditOutlined />}
            style={{ marginLeft: 8 }}
            onClick={() => {
              form.setFieldsValue(data);
              setSelectedUser(data);
              setIsOpenSaveModal(true);
            }}
          />
          <Button
            type="primary"
            shape="circle"
            icon={<BookOutlined />}
            style={{
              marginLeft: 8,
              backgroundColor: "#52c41a",
              borderColor: "#52c41a",
            }}
            onClick={() => {
              setSelectedUser(data);
              setIsOpenAssignEventModal(true);
            }}
          />
        </>
      ),
    },
  ];

  const handleSaveUser = async (values: INonTechUser) => {
    setError("");
    try {
      if (selectedUser) {
        await _nonTechUserService.update(selectedUser.id || "", values);
        await _childrenService.updateManyByUserId(
          selectedUser.id || "",
          children
        );
      } else {
        await _nonTechUserService.add(values);
      }
      Swal.fire({
        icon: "success",
        title: "User successfully saved!",
        showConfirmButton: false,
        timer: 1500,
      });
      refetchnontechuser();
      setIsOpenSaveModal(false);
    } catch (_e: any) {
      let e: Error = _e;
      setError(e.message);
      throw new Error(e.message);
    }
  };

  const handleSaveToPurchase = async (
    event: IEvent,
    selectedTicketCategory: ITicketCategory
  ) => {
    if (!selectedUser?.id) return;

    try {
      const purchaseEvent: IMyPuchaseEvent = {
        eventId: event.id ?? "",
        imageUrl: event?.image ?? "",
        isPaid: false,
        ticketId: uuidv4(),
        location: event?.venue ?? "",
        status: TicketStatus.Pending,
        ticketName: selectedTicketCategory.ticketName,
        startTime: event.startTime,
        endTime: event.endTime,
      };

      const updatedUser: INonTechUser = {
        ...selectedUser,
        myPurchaseEvents: [
          ...(selectedUser.myPurchaseEvents || []),
          purchaseEvent,
        ],
      };

      await _nonTechUserService.update(selectedUser.id, updatedUser);
    } catch (error) {
      console.error("Failed to save purchase:", error);
      throw error;
    }
  };

  const handleSaveToAttendees = async (eventId: string) => {
    if (!selectedUser?.id) return;

    try {
      const selectedEvent = event.find((e) => e.id === eventId);
      if (!selectedEvent) throw new Error("Event not found");
      await _eventservice.addAttendee(eventId, selectedUser.id);
    } catch (error) {
      console.error("Failed to save attendee:", error);
      throw error;
    }
  };

  const DeleteModalConfirmation = () => (
    <Modal
      title="Are you sure you want to delete?"
      open={isOpenDeleteModal}
      onOk={async () => {
        await _nonTechUserService.deleteById(selectedUser?.id || "");
        refetchnontechuser();
        setIsOpenDeleteModal(false);
      }}
      onCancel={() => setIsOpenDeleteModal(false)}
    >
      <p>Email: {selectedUser?.email}</p>
    </Modal>
  );

  const AssignToEventModal = () => {
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
      null
    );
    const [ticketQuantity, setTicketQuantity] = useState<number>(0);

    const MAX_TICKETS_PER_CATEGORY = 2;

    const getExistingTicketsCount = (
      eventId: string
    ): {
      total: number;
      byCategory: { [key: string]: number };
    } => {
      if (!selectedUser?.myPurchaseEvents) return { total: 0, byCategory: {} };

      const purchases = selectedUser.myPurchaseEvents.filter(
        (purchase) => purchase.eventId === eventId
      );

      const byCategory = purchases.reduce((acc, purchase) => {
        acc[purchase.ticketName] = (acc[purchase.ticketName] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      return {
        total: purchases.length,
        byCategory,
      };
    };

    const getMaxTicketsForEvent = (event: IEvent): number => {
      return event.ticketCategories.length * MAX_TICKETS_PER_CATEGORY;
    };

    const handleQuantityChange = (increment: boolean) => {
      setTicketQuantity((prev) => {
        if (!selectedEventId || !selectedCategoryId) return prev;

        const selectedEvent = event.find((e) => e.id === selectedEventId);
        if (!selectedEvent) return prev;

        const selectedCategory = selectedEvent.ticketCategories.find(
          (tc) => tc.ticketCategoryId === selectedCategoryId
        );
        if (!selectedCategory) return prev;

        const { byCategory } = getExistingTicketsCount(selectedEventId);
        const existingCategoryTickets =
          byCategory[selectedCategory.ticketName] || 0;

        const remainingInCategory =
          MAX_TICKETS_PER_CATEGORY - existingCategoryTickets;

        const newQuantity = increment
          ? Math.min(prev + 1, remainingInCategory)
          : Math.max(prev - 1, 0);

        return newQuantity;
      });
    };

    const resetSelection = () => {
      setTicketQuantity(0);
      setSelectedCategoryId(null);
    };

    const updateTicketCounts = async (
      eventId: string,
      ticketCategoryId: string,
      quantity: number
    ) => {
      try {
        const eventRef = doc(db, "events", eventId);
        const eventDoc = await getDoc(eventRef);

        if (!eventDoc.exists()) {
          throw new Error("Event not found");
        }

        const eventData = eventDoc.data();
        const updatedTicketCategories = eventData.ticketCategories.map(
          (category: ITicketCategory) => {
            if (category.ticketCategoryId === ticketCategoryId) {
              const newRemaining = Math.max(
                0,
                (category.ticketRemaining || 0) - quantity
              );
              return {
                ...category,
                ticketRemaining: newRemaining,
                ticketSold: (category.ticketSold || 0) + quantity,
              };
            }
            return category;
          }
        );

        await updateDoc(eventRef, {
          ticketCategories: updatedTicketCategories,
        });
      } catch (error) {
        console.error("Failed to update ticket counts:", error);
        throw error;
      }
    };

    const handleBooking = async () => {
      if (!selectedEventId || !selectedCategoryId) {
        message.error("Please select an event and ticket category");
        return;
      }

      if (ticketQuantity === 0) {
        message.error("Please select at least 1 ticket");
        return;
      }

      const selectedEvent = event.find((e) => e.id === selectedEventId);
      if (!selectedEvent) throw new Error("Event not found");

      const selectedCategory = selectedEvent.ticketCategories.find(
        (tc) => tc.ticketCategoryId === selectedCategoryId
      );
      if (!selectedCategory) throw new Error("Ticket category not found");

      const { total: existingTotal, byCategory } =
        getExistingTicketsCount(selectedEventId);
      const existingCategoryTickets =
        byCategory[selectedCategory.ticketName] || 0;
      const maxEventTickets = getMaxTicketsForEvent(selectedEvent);

      if (existingTotal + ticketQuantity > maxEventTickets) {
        message.error(
          `You can only have a maximum of ${maxEventTickets} tickets total for this event`
        );
        return;
      }

      if (existingCategoryTickets + ticketQuantity > MAX_TICKETS_PER_CATEGORY) {
        message.error(
          `You can only have a maximum of ${MAX_TICKETS_PER_CATEGORY} tickets for the ${selectedCategory.ticketName} category`
        );
        return;
      }

      try {
        if ((selectedCategory.ticketRemaining || 0) < ticketQuantity) {
          message.error("Not enough tickets remaining!");
          return;
        }

        await updateTicketCounts(
          selectedEventId,
          selectedCategoryId,
          ticketQuantity
        );

        const purchasePromises = [];
        const attendeePromises = [];

        for (let i = 0; i < ticketQuantity; i++) {
          purchasePromises.push(
            handleSaveToPurchase(selectedEvent, selectedCategory)
          );
          attendeePromises.push(handleSaveToAttendees(selectedEventId));
        }

        await Promise.all(purchasePromises);
        await Promise.all(attendeePromises);

        await Promise.all([refetchnontechuser(), refetchevent()]);

        message.success(`Successfully booked ${ticketQuantity} ticket(s)!`);
        setIsOpenAssignEventModal(false);
        setSelectedEvent(null);
        setSelectedEventId(null);
        resetSelection();
      } catch (error) {
        console.error("Failed to book event:", error);
        message.error("Failed to book event. Please try again.");
      }
    };

    return (
      <Modal
        title="Book an Event"
        open={isOpenAssignEventModal}
        onOk={handleBooking}
        onCancel={() => {
          setIsOpenAssignEventModal(false);
          setSelectedEvent(null);
          setSelectedEventId(null);
          resetSelection();
        }}
        width={600}
      >
        <div className="space-y-4">
          {event?.map((events) => {
            const { total: existingTotal, byCategory } =
              getExistingTicketsCount(events.id || "");
            const maxEventTickets = getMaxTicketsForEvent(events);
            const remainingEventTickets = maxEventTickets - existingTotal;

            return (
              <Card
                key={events.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedEventId === events.id
                    ? "border-2 border-blue-500 bg-blue-50 shadow-lg transform scale-[1.02]"
                    : "border border-blue-300 hover:border-blue-300"
                }`}
                onClick={() => {
                  if (events.id) {
                    if (selectedEventId !== events.id) {
                      resetSelection();
                    }
                    setSelectedEventId(events.id);
                  }
                }}
                style={{
                  backgroundColor:
                    selectedEventId === events.id ? "#ebf8ff" : "white",
                }}
              >
                <div className="flex items-start gap-4">
                  <Image
                    src={events.image}
                    alt={events.eventName}
                    style={{ width: 120, height: 80, objectFit: "cover" }}
                  />

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <Typography.Title level={5} className="!mb-1">
                          {events.eventName}
                        </Typography.Title>
                        <Typography.Text type="secondary">
                          {events.venue} <br />
                          <br />
                          {existingTotal >= maxEventTickets ? (
                            <Tag color="red">Maximum tickets reached</Tag>
                          ) : (
                            `You can book ${remainingEventTickets} more ticket(s) for this event`
                          )}
                        </Typography.Text>
                      </div>
                      <div className="flex flex-col gap-1">
                        {events.ticketCategories?.map((category, index) => {
                          const isSelected =
                            selectedEventId === events.id &&
                            selectedCategoryId === category.ticketCategoryId;

                          const existingCategoryTickets =
                            byCategory[category.ticketName] || 0;
                          const remainingCategoryTickets =
                            MAX_TICKETS_PER_CATEGORY - existingCategoryTickets;

                          return (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <Tag
                                color={isSelected ? "green" : "blue"}
                                className={`cursor-pointer px-4 py-2 text-lg font-semibold ${
                                  existingCategoryTickets >=
                                  MAX_TICKETS_PER_CATEGORY
                                    ? "opacity-50"
                                    : ""
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (
                                    existingCategoryTickets >=
                                    MAX_TICKETS_PER_CATEGORY
                                  ) {
                                    message.warning(
                                      `Maximum ${MAX_TICKETS_PER_CATEGORY} tickets per category allowed`
                                    );
                                    return;
                                  }
                                  if (events.id) {
                                    if (
                                      selectedCategoryId !==
                                      category.ticketCategoryId
                                    ) {
                                      setTicketQuantity(0);
                                    }
                                    setSelectedEventId(events.id);
                                    setSelectedCategoryId(
                                      category.ticketCategoryId || null
                                    );
                                  }
                                }}
                              >
                                {category.ticketName}:{" "}
                                {category.ticketRemaining}/
                                {category.ticketTotal} Available
                                {existingCategoryTickets > 0 && (
                                  <span className="ml-2">
                                    (You have {existingCategoryTickets})
                                  </span>
                                )}
                              </Tag>
                              {isSelected &&
                                remainingCategoryTickets > 0 &&
                                remainingEventTickets > 0 && (
                                  <div
                                    className="flex items-center gap-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Button
                                      size="small"
                                      type="text"
                                      icon={<MinusOutlined />}
                                      onClick={() =>
                                        handleQuantityChange(false)
                                      }
                                      disabled={ticketQuantity === 0}
                                    />
                                    <span className="min-w-[20px] text-center">
                                      {ticketQuantity}
                                    </span>
                                    <Button
                                      size="small"
                                      type="text"
                                      icon={<PlusOutlined />}
                                      onClick={() => handleQuantityChange(true)}
                                      disabled={
                                        ticketQuantity >=
                                          remainingCategoryTickets ||
                                        ticketQuantity >=
                                          (category.ticketRemaining || 0)
                                      }
                                    />
                                  </div>
                                )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <Typography.Paragraph
                      className="mt-2"
                      ellipsis={{ rows: 2 }}
                    >
                      {events.description}
                    </Typography.Paragraph>
                    <div className="flex justify-between items-start mt-2">
                      <Typography.Text>
                        <CalendarOutlined className="mr-2" />
                        {convertUnixToTimeText(events.startTime)}
                      </Typography.Text>
                      <div className="flex flex-col items-end gap-2">
                        {events.ticketCategories?.map((category, index) => {
                          const isSelected =
                            selectedEventId === events.id &&
                            selectedCategoryId === category.ticketCategoryId;
                          return (
                            <Typography.Text
                              key={index}
                              className={`whitespace-nowrap ${
                                isSelected ? "font-bold text-blue-600" : ""
                              }`}
                            >
                              {category.ticketName}: ₱
                              {category.ticketPrice.toLocaleString()}{" "}
                              {isSelected && ticketQuantity > 0 && (
                                <span className="ml-2 text-green-600">
                                  {" "}
                                  × {ticketQuantity} = ₱
                                  {(
                                    category.ticketPrice * ticketQuantity
                                  ).toLocaleString()}{" "}
                                </span>
                              )}
                            </Typography.Text>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {selectedEventId && selectedCategoryId && (
          <Alert
            message="Ready to book!"
            description={
              ticketQuantity > 0
                ? `Click OK to confirm your booking of ${ticketQuantity} ticket(s).`
                : "Please select the number of tickets you want to book."
            }
            type={ticketQuantity > 0 ? "success" : "info"}
            showIcon
            className="mt-4"
          />
        )}
      </Modal>
    );
  };

  return (
    <>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        style={{ marginBottom: 16 }}
        onClick={() => {
          setIsOpenSaveModal(true);
          setSelectedUser(null);
        }}
      >
        Add User
      </Button>
      <DeleteModalConfirmation />
      <SaveNonTechModal
        form={form}
        handleSave={handleSaveUser}
        setSelectedUser={setSelectedUser}
        selectedUser={selectedUser}
        isOpenSaveModal={isOpenSaveModal}
        setIsOpenSaveModal={setIsOpenSaveModal}
        setIsChildrenModalVisible={setIsChildrenModalVisible}
        updateFromGroups={updateFromGroups}
        addFormGroups={addFormGroups}
        children={children}
        error={error}
      />
      <ChildrenModal
        children={children}
        setChildren={setChildren}
        isModalVisible={isChildrenModalVisible}
        setIsModalVisible={setIsChildrenModalVisible}
        childData={childData}
      />
      <AssignToEventModal />
      <DataTable dataSource={nontechuser} columns={columns} />
    </>
  );
}
