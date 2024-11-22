import { Button, Modal, QRCode } from "antd";
import { IChildWithParent } from "../interfaces/firebase/IChild";
import documentService from "../firebase/services/documentService";
import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { IEvent } from "../interfaces/firebase/IEvent";
import { v4 as uuidv4 } from "uuid";
import { convertUnixToDateText } from "../utils/dateTimeFormat";
import eventService from "../firebase/services/eventService";

interface ChildQrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedChild: IChildWithParent | null;
  selectedEvent: IEvent | null;
  title?: string;
}

export default function ChildQrCodeModal(props: ChildQrCodeModalProps) {
  const { isOpen, onClose, selectedEvent, selectedChild } = props;
  if (!selectedChild) return;
  const _documentService = documentService();
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      width={400}
      footer={
        <>
          <Button
            type="primary"
            onClick={() =>
              _documentService.downloadHTMLToImage("print", `${uuidv4()}.jpg`)
            }
            //   disabled={isFetching}
          >
            Download
          </Button>
          <Button
            type="primary"
            onClick={() => reactToPrintFn()}
            //   disabled={isFetching}
          >
            Print
          </Button>
        </>
      }
    >
      <center ref={contentRef}>
        {selectedEvent?.image && (
          <img
            src={selectedEvent.image}
            alt="Event"
            className="img-fluid mb-3"
          />
        )}
        <center id="print">
          <h3 className="mb-3">{selectedEvent?.eventName}</h3>
          <p className="mb-1">
            <span className="fw-bold"> Venue:</span> {selectedEvent?.venue}
          </p>

          <p className="mb-1">
            <span className="fw-bold"> Start:</span>{" "}
            {convertUnixToDateText(selectedEvent?.startTime)}
          </p>
          <p className="mb-3">
            <span className="fw-bold"> End:</span>{" "}
            {convertUnixToDateText(selectedEvent?.endTime)}
          </p>
          <p className="mb-3">
            <span className="fw-bold"> Parent:</span> {selectedChild.parentName}
          </p>
          <p className="mb-3">
            <span className="fw-bold">Child's Name :</span>{" "}
            {selectedChild.lastName + ", " + selectedChild.firstName}
          </p>
          <div className="qr-code-wrapper mb-4">
            <QRCode
              value={`${selectedChild.userId}.${selectedChild.id}`}
              style={{ backgroundColor: "transparent" }}
            />
          </div>
        </center>
      </center>
    </Modal>
  );
}
