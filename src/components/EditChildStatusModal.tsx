import Button, { BaseButtonProps } from "antd/es/button/button";
import { EventChildStatus, IEvent } from "../interfaces/firebase/IEvent";
import { Modal } from "antd";
import { IChildWithParentAndStatus } from "../interfaces/firebase/IChild";
import Swal from "sweetalert2";
import eventService from "../firebase/services/eventService";

export default function EditChildStatusModal(props: {
  isOpen: boolean;
  onClose: () => void;
  selectedEvent: IEvent | null;
  selectedChild: IChildWithParentAndStatus | null;
}) {
  const { isOpen, onClose, selectedEvent, selectedChild } = props;

  const _eventService = eventService();
  const buttons: BaseButtonProps[] = [
    { children: EventChildStatus.Arrived, className: "bg-success" },
    { children: EventChildStatus.Fetch, className: "bg-primary" },
    { children: EventChildStatus.Pending, className: "bg-warning text-dark" },
  ];
  const handleUpdateChildStatus = async (newStatus: EventChildStatus) => {
    if (!selectedEvent?.id || !selectedChild?.id) return;
    await _eventService.updateChildAttendeeStatusEventById(
      selectedEvent.id,
      newStatus,
      selectedChild?.id
    );
    Swal.fire({
      icon: "success",
      title: "Child Status successfully saved",
      showConfirmButton: false,
      timer: 1500,
    });
    onClose();
  };

  const FooterButton = () => (
    <>
      {buttons
        .filter((b) => b.children != selectedChild?.status)
        .map((b) => (
          <Button
            {...b}
            type="primary"
            onClick={() => {
              handleUpdateChildStatus(b.children as EventChildStatus);
              //   handleUpdateStatus(b.children as TicketStatus);
            }}
          />
        ))}
    </>
  );

  return (
    <Modal
      title="Update Status"
      open={isOpen}
      footer={<FooterButton />}
      onCancel={onClose}
    >
      <div className="container">
        <div className="row mb-2">
          <div className="col font-weight-bold">Event:</div>
          <div className="col">{selectedEvent?.eventName}</div>
        </div>
        <div className="row mb-2">
          <div className="col font-weight-bold">Parent: </div>
          <div className="col">{selectedChild?.parentName}</div>
        </div>
        <div className="row mb-2">
          <div className="col font-weight-bold">Child's Name: </div>
          <div className="col">
            {selectedChild?.lastName + ", " + selectedChild?.firstName}
          </div>
        </div>
        <div className="row mb-2">
          <div className="col font-weight-bold">Current Status:</div>

          <div className="col">{selectedChild?.status}</div>
        </div>
      </div>
    </Modal>
  );
}
