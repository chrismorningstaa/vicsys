import Button, { BaseButtonProps } from "antd/es/button/button";
import { TicketStatus } from "../interfaces/firebase/ITicket";
import { IMyPuchaseEvent } from "../interfaces/firebase/INonTechUser";
import { IEvent } from "../interfaces/firebase/IEvent";
import { Modal } from "antd";
import { TicketStatusText } from "./TicketStatusText";

export default function EditTicketStatusModal(props: {
  handleUpdateStatus: (value: TicketStatus) => void;
  isModalOpen: boolean;
  handleClose: () => void;
  selectedPurchase: IMyPuchaseEvent | null;
  selectedEvent: IEvent | null;
}) {
  const {
    isModalOpen,
    handleClose,
    selectedPurchase,
    selectedEvent,
    handleUpdateStatus,
  } = props;

  const buttons: BaseButtonProps[] = [
    { children: TicketStatus.Declined, className: "bg-danger" },
    { children: TicketStatus.Pending, className: "bg-warning text-dark" },
    { children: TicketStatus.Completed, className: "bg-primary" },
    { children: TicketStatus.Paid, className: "bg-success" },
  ];

  const FooterButton = () => (
    <>
      {buttons
        .filter((b) => b.children != selectedPurchase?.status)
        .map((b) => (
          <Button
            {...b}
            type="primary"
            onClick={() => {
              handleUpdateStatus(b.children as TicketStatus);
            }}
          />
        ))}
    </>
  );

  return (
    <Modal
      title="Update Status"
      open={isModalOpen}
      footer={<FooterButton />}
      onCancel={handleClose}
    >
      <div className="container">
        <div className="row mb-2">
          <div className="col font-weight-bold">Event:</div>
          <div className="col">{selectedEvent?.eventName}</div>
        </div>
        <div className="row mb-2">
          <div className="col font-weight-bold">Ticket Name:</div>
          <div className="col">{selectedPurchase?.ticketName}</div>
        </div>
        <div className="row mb-2">
          <div className="col font-weight-bold">Current Status:</div>
          <div className="col">
            {" "}
            <TicketStatusText status={selectedPurchase?.status} />
          </div>
        </div>
      </div>
    </Modal>
  );
}
