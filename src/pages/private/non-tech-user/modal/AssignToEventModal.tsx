import { useState } from "react";
import {
  IEvent,
  ITicketCategory,
} from "../../../../interfaces/firebase/IEvent";
import {
  message,
  Modal,
  Button,
  Card,
  Image,
  Typography,
  Tag,
  Alert,
} from "antd";
import {
  PlusOutlined,
  MinusOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";
import { convertUnixToTimeText } from "../../../../utils/dateTimeFormat";
import {
  IMyPuchaseEvent,
  INonTechUser,
} from "../../../../interfaces/firebase/INonTechUser";
import { TicketStatus } from "../../../../interfaces/firebase/ITicket";
import bookingService from "../../../../firebase/services/bookingService";

interface AssignToEventModalProps {
  selectedUser: INonTechUser | null;
  refetchnontechuser: () => void;
  refetchevent: () => void;
  isOpenAssignEventModal: boolean;
  setIsOpenAssignEventModal: React.Dispatch<React.SetStateAction<boolean>>;
  event: IEvent[];
}

export default function AssignToEventModal(props: AssignToEventModalProps) {
  const {
    selectedUser,
    refetchnontechuser,
    refetchevent,
    isOpenAssignEventModal,
    setIsOpenAssignEventModal,
    event,
  } = props;
  const [myPurchases, setMyPurchases] = useState<IMyPuchaseEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [ticketQuantity, setTicketQuantity] = useState<number>(0);
  const _bookingService = bookingService();
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

  const handleQuantityChange = (
    increment: boolean,
    selectedEvent: IEvent,
    ticketCat: ITicketCategory
  ) => {
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
    if (increment && selectedEvent)
      setMyPurchases((prev) => [
        ...prev,
        {
          eventId: selectedEvent?.id ?? "",
          imageUrl: selectedEvent?.image ?? "",
          isPaid: false,
          ticketId: uuidv4(),
          location: selectedEvent?.venue ?? "",
          status: TicketStatus.Pending,
          ticketName: ticketCat.ticketName,
          startTime: selectedEvent?.startTime ?? "",
          endTime: selectedEvent?.endTime ?? "",
        },
      ]);
    if (!increment && selectedEvent) {
      const foundPurchase = myPurchases.find(
        (m) => m.ticketName == ticketCat.ticketName
      );

      setMyPurchases((prev) =>
        prev.filter((m) => m.ticketId != foundPurchase?.ticketId)
      );
    }
  };

  const resetSelection = () => {
    setTicketQuantity(0);
    setSelectedCategoryId(null);
    setMyPurchases([]);
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
      const setOfEventIds = new Set<string>();
      await myPurchases.map((m) => {
        setOfEventIds.add(m.eventId);
      });

      await Promise.all(
        Array.from(setOfEventIds).map(async (eventId) => {
          await _bookingService.bookEventPurchases(
            eventId,
            "",
            selectedUser?.id ?? "",
            myPurchases
          );
        })
      );

      await refetchnontechuser();
      await refetchevent();

      setIsOpenAssignEventModal(false);
      setSelectedEventId(null);
      resetSelection();
      message.success(`Successfully booked ${ticketQuantity} ticket(s)!`);
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
        setSelectedEventId(null);
        resetSelection();
      }}
      width={600}
    >
      <div className="space-y-4">
        {event?.map((events) => {
          const { total: existingTotal, byCategory } = getExistingTicketsCount(
            events.id || ""
          );
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
                          <div key={index} className="flex items-center gap-2">
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
                              {category.ticketName}: {category.ticketRemaining}/
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
                                      handleQuantityChange(
                                        false,
                                        events,
                                        category
                                      )
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
                                    onClick={() =>
                                      handleQuantityChange(
                                        true,
                                        events,
                                        category
                                      )
                                    }
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
                  <Typography.Paragraph className="mt-2" ellipsis={{ rows: 2 }}>
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
}
