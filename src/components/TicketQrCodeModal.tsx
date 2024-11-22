import { Button, Modal, QRCode } from "antd";
import { IMyPuchaseEvent } from "../interfaces/firebase/INonTechUser";
import { convertUnixToDateText } from "../utils/dateTimeFormat";
import documentService from "../firebase/services/documentService";
import eventService from "../firebase/services/eventService";
import { useQuery } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import IChild from "../interfaces/firebase/IChild";
import childrenService from "../firebase/services/childrenService";

export default function TicketQrCodeModal(props: {
  purchaseEvent: IMyPuchaseEvent | null;
  userId: string;
  isForKids: boolean;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}) {
  const { userId, purchaseEvent, isForKids, isOpen, setIsOpen } = props;
  const _documentService = documentService();
  const _eventService = eventService();
  const _childrenService = childrenService();
  const {
    data: event,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["event"],
    queryFn: async () =>
      await _eventService.getById(purchaseEvent?.eventId ?? ""),
  });
  const [child, setChild] = useState<IChild | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  useEffect(() => {
    if (isOpen) {
      refetch();
      if (purchaseEvent?.ticketId) {
        _childrenService.getById(purchaseEvent.ticketId).then(setChild);
      }
    }
  }, [isOpen]);

  return (
    <Modal
      open={isOpen}
      onCancel={() => setIsOpen(false)}
      width={400}
      footer={
        <>
          <Button
            type="primary"
            onClick={() =>
              _documentService.downloadHTMLToImage("print", `${uuidv4()}.jpg`)
            }
            disabled={isFetching}
          >
            Download
          </Button>
          <Button
            type="primary"
            onClick={() => reactToPrintFn()}
            disabled={isFetching}
          >
            Print
          </Button>
        </>
      }
    >
      <center ref={contentRef}>
        {event?.image && (
          <img src={event.image} alt="Event" className="img-fluid mb-3" />
        )}
        <center id="print">
          <h3 className="mb-3">{event?.eventName}</h3>
          <p className="mb-1">
            <span className="fw-bold"> Venue:</span> {event?.venue}
          </p>
          <p className="mb-1">
            <span className="fw-bold"> Type:</span> {purchaseEvent?.ticketName}
          </p>
          <p className="mb-1">
            <span className="fw-bold"> Start:</span>{" "}
            {convertUnixToDateText(event?.startTime)}
          </p>
          <p className="mb-3">
            <span className="fw-bold"> End:</span>{" "}
            {convertUnixToDateText(event?.endTime)}
          </p>

          <div className="qr-code-wrapper mb-4">
            <QRCode
              value={
                isForKids
                  ? `${userId}.${child?.qrId ?? ""}`
                  : `${userId}.${purchaseEvent?.ticketId ?? ""}`
              }
              style={{ backgroundColor: "transparent" }}
            />
          </div>
        </center>
      </center>
    </Modal>
  );
}
