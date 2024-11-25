import { Badge, Button, Form, Input, Modal } from "antd";
import {
  IEvent,
  ITicketCategory,
} from "../../../../interfaces/firebase/IEvent";
import { useEffect, useState } from "react";
import { convertUnixToDateText } from "../../../../utils/dateTimeFormat";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { IMyPuchaseEvent } from "../../../../interfaces/firebase/INonTechUser";
import { TicketStatus } from "../../../../interfaces/firebase/ITicket";
import { v4 as uuidv4 } from "uuid";
import useUserContext from "../../../../contexts/useUserContext";
import userService from "../../../../firebase/services/userService";
import bookingService from "../../../../firebase/services/bookingService";
import Swal from "sweetalert2";
interface TicketNameStatus {
  ticketName: string;
  ticketBookCount: number;
}

export default function BookingModal(props: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  selectedEvent: IEvent | null;
  refetch: () => void;
}) {
  const { isOpen, setIsOpen, selectedEvent, refetch } = props;
  const { user } = useUserContext();
  if (!selectedEvent || !user?.uid) return;

  const _userService = userService();
  const _bookingService = bookingService();
  const [gcashRefNo, setGcashRefNo] = useState<string>("");
  const [purchaseTotalPrice, setPurchaseTotalPrice] = useState<number>(0);
  const [myPurchase, setMyPurchase] = useState<IMyPuchaseEvent[]>([]);
  const [ticketNameStatus, setTicketNameStatus] = useState<TicketNameStatus[]>(
    []
  );
  const [form] = Form.useForm();
  const handleAddPurchase = (
    ticketName: string,
    price: number,
    ticketCatId: string
  ) => {
    setPurchaseTotalPrice((prev) => prev + price);
    setMyPurchase((prev) => [
      ...prev,
      {
        ticketCategoryId: ticketCatId,
        eventId: selectedEvent.id ?? "",
        imageUrl: selectedEvent.image,
        isPaid: false,
        location: selectedEvent.venue,
        status: TicketStatus.Pending,
        ticketId: uuidv4(),
        ticketName: ticketName,
        startTime: selectedEvent.startTime,
        endTime: selectedEvent.endTime,
      },
    ]);
  };

  const handleRemovePurchase = (ticketName: string, price: number) => {
    setPurchaseTotalPrice((prev) => prev - price);
    const foundPurchase = myPurchase.find((m) => m.ticketName == ticketName);

    setMyPurchase((prev) =>
      prev.filter((m) => m.ticketId != foundPurchase?.ticketId)
    );
  };
  const handleCountPurchase = (ticketName: string) => {
    return myPurchase.filter((m) => m.ticketName == ticketName).length;
  };

  const handleIsPurchased = (ticketName: string, ticketPerUser: number) => {
    return (
      (ticketNameStatus.find((t) => t.ticketName == ticketName)
        ?.ticketBookCount ?? 0) >= ticketPerUser
    );
  };
  const handleSetInitialTicketStatus = async () => {
    const userLogged = await _userService.getById(user.uid);
    const userLoggedPurchase = userLogged?.myPurchaseEvents?.filter(
      (m) => m.eventId == selectedEvent.id
    );

    const initialTicketnameStatus: TicketNameStatus[] =
      selectedEvent.ticketCategories.map((t) => ({
        ticketName: t.ticketName,
        ticketBookCount:
          userLoggedPurchase?.filter((u) => u.ticketName == t.ticketName)
            .length ?? 0,
      }));
    setTicketNameStatus(initialTicketnameStatus);
  };
  const handleBook = async () => {
    form.validateFields();
    const updatedmyPurchase = myPurchase.map((m) => ({
      ...m,
      gcashRefNo: gcashRefNo,
    }));
    if (!selectedEvent.id || !user.uid || myPurchase.length == 0 || !gcashRefNo)
      return;
    await _bookingService.bookEventPurchases(
      selectedEvent.id,
      user.uid,
      "",
      updatedmyPurchase
    );
    refetch();
    setIsOpen(false);
    Swal.fire({
      icon: "success",
      title: "Successfully booked",
      showConfirmButton: false,
      timer: 1500,
    });
  };
  const handleIsDisabledAddTicketCount = (ticket: ITicketCategory) => {
    const userCurrentTicketCount =
      ticketNameStatus.find((t) => t.ticketName == ticket.ticketName)
        ?.ticketBookCount ?? 0;

    if ((ticket.ticketRemaining ?? 0) <= handleCountPurchase(ticket.ticketName))
      return true;
    if (
      ticket.ticketPerUser <=
      handleCountPurchase(ticket.ticketName) + userCurrentTicketCount
    )
      return true;
    return false;
  };

  const handleCancelModal = () => {
    setPurchaseTotalPrice(0);
    setIsOpen(false);
  };
  useEffect(() => {
    handleSetInitialTicketStatus();
    setMyPurchase([]);
  }, [selectedEvent]);

  return (
    <Modal
      open={isOpen}
      onOk={handleBook}
      onCancel={handleCancelModal}
      okText="Book now"
      width={700}
    >
      <center>
        <img
          src={selectedEvent.image}
          alt={selectedEvent.eventName}
          className="img-fluid"
          style={{ width: 200 }}
        />
      </center>
      <center>
        <h3>{selectedEvent.eventName}</h3>
        <p>{selectedEvent.description}</p>

        <div className="d-flex justify-content-between"></div>
      </center>
      <hr />
      <center>
        <div>Venue: {selectedEvent.venue}</div>
        <div>Start: {convertUnixToDateText(selectedEvent.startTime)}</div>
        <div>End: {convertUnixToDateText(selectedEvent.endTime)}</div>
      </center>
      <hr />
      <h5>Ticket Categories</h5>
      {selectedEvent.ticketCategories.map((ticket, index) => {
        return (
          <div key={index} className="d-flex justify-content-between mb-1">
            <Badge count={ticket.ticketName} color="blue" />
            <span>
              Ticket per User: {ticket.ticketPerUser} | Price: ₱
              {ticket.ticketPrice} | Current Purchase:{" "}
              {
                ticketNameStatus.find((t) => t.ticketName == ticket.ticketName)
                  ?.ticketBookCount
              }
            </span>
            {handleIsPurchased(ticket.ticketName, ticket.ticketPerUser) ? (
              <Badge count={"Purchased"} color="blue" />
            ) : (
              <div>
                <Button
                  type="primary"
                  size="small"
                  //   shape="round"
                  onClick={() => {
                    handleRemovePurchase(ticket.ticketName, ticket.ticketPrice);
                  }}
                  icon={<MinusOutlined />}
                  disabled={handleCountPurchase(ticket.ticketName) === 0}
                  className="me-2"
                />

                <span>{handleCountPurchase(ticket.ticketName)}</span>
                <Button
                  type="primary"
                  size="small"
                  //   shape="round"
                  onClick={() => {
                    handleAddPurchase(
                      ticket.ticketName,
                      ticket.ticketPrice,
                      ticket?.ticketCategoryId ?? ""
                    );
                  }}
                  icon={<PlusOutlined />}
                  disabled={handleIsDisabledAddTicketCount(ticket)}
                  className="ms-2"
                />
              </div>
            )}
          </div>
        );
      })}
      <hr />
      <label>
        <strong>Total fee: </strong>₱{purchaseTotalPrice}
      </label>

      {myPurchase.length > 0 && (
        <Form form={form}>
          <Form.Item
            label="Gcash Reference number"
            name="gcashRefNo"
            rules={[
              { required: true, message: "Gcash Reference No. is required" },
            ]}
          >
            <Input
              value={gcashRefNo}
              onChange={(e) => setGcashRefNo(e.target.value)}
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
