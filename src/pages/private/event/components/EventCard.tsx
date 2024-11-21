import { Button, Card, Collapse } from "antd";
import { IEvent, IEventSave } from "../../../../interfaces/firebase/IEvent";
import { convertUnixToDateText } from "../../../../utils/dateTimeFormat";
import useEventContext from "../useEventContext";

const { Panel } = Collapse;

export default function EventCard(props: IEvent) {
  const {
    eventName,
    image,
    description,
    ticketCategories,
    venue,
    startTime,
    endTime,
  } = props;
  const {
    handleDeleteConfirmation,
    setSelectedEvent,
    setIsSaveModalOpen,
    setImageUpload,
  } = useEventContext();

  return (
    <Card
      style={{ width: 300, marginBottom: 20 }}
      cover={
        <img
          alt={eventName}
          src={typeof image == "string" ? image : ""}
          style={{ width: 300, height: 150 }}
        />
      }
      bodyStyle={{ height: 350, overflowY: "auto" }}
      actions={[
        <Button
          type="primary"
          onClick={() => {
            setImageUpload(null);
            setSelectedEvent(props);
            setIsSaveModalOpen(true);
          }}
        >
          View and Edit
        </Button>,
        <Button
          danger
          onClick={() => {
            setSelectedEvent(props);
            handleDeleteConfirmation();
          }}
        >
          Delete
        </Button>,
      ]}
    >
      <h4>{eventName}</h4>
      <div>
        <strong>Description: </strong>
        {description}
      </div>
      <p>
        <strong>Date and Time: </strong>
        {convertUnixToDateText(startTime)}-{convertUnixToDateText(endTime)}
      </p>
      <p>
        <strong>Venue: </strong>
        {venue}
      </p>
      <Collapse accordion style={{ width: 250 }}>
        <Panel header="Available Tickets by Category" key="1">
          {ticketCategories?.map((ticket, index) => (
            <div key={index}>
              {ticket.ticketName} - ₱{ticket.ticketPrice}
              <br />
              Tickets Available: {ticket.ticketRemaining}
              <br />
              Tickets Per user: {ticket.ticketPerUser}
              <hr />
            </div>
          ))}
        </Panel>
      </Collapse>
    </Card>
  );
}
