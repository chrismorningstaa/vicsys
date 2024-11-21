import { Button, Card, Collapse } from "antd";
import { IEvent } from "../../../../interfaces/firebase/IEvent";
import { convertUnixToDateText } from "../../../../utils/dateTimeFormat";
import { BookOutlined } from "@ant-design/icons";
const { Panel } = Collapse;
export default function BookingEventCard(props: {
  event: IEvent;
  setSelectedEvent: (value: IEvent) => void;
  setIsBookingModalVisible: (value: boolean) => void;
}) {
  const { event, setSelectedEvent, setIsBookingModalVisible } = props;
  const {
    eventName,
    image,
    description,
    ticketCategories,
    venue,
    startTime,
    endTime,
  } = event;
  return (
    <Card
      style={{ width: 350, marginBottom: 20 }}
      cover={
        <img
          alt={eventName}
          src={typeof image == "string" ? image : ""}
          style={{ width: 350, height: 150 }}
        />
      }
      bodyStyle={{ height: 470, overflowY: "auto" }}
      actions={[
        <Button
          type="primary"
          icon={<BookOutlined />}
          onClick={() => {
            setSelectedEvent(event);
            setIsBookingModalVisible(true);
          }}
        >
          Book now
        </Button>,
      ]}
    >
      <h4>{eventName}</h4>
      <p>{description}</p>
      <p>
        <strong>Date and Time: </strong>
        {convertUnixToDateText(startTime)}-{convertUnixToDateText(endTime)}
      </p>
      <p>
        <strong>Venue: </strong>
        {venue}
      </p>
      <p>
        <strong>Available Tickets by Category: </strong>
      </p>
      <Collapse accordion style={{ width: 240 }}>
        <Panel header="Available Tickets by Category" key="1">
          {ticketCategories?.map((ticket, index) => (
            <p key={index}>
              {ticket.ticketName} - ₱{ticket.ticketPrice}
              <br />
              Tickets Available: {ticket.ticketRemaining}
              <br />
              Tickets Per user: {ticket.ticketPerUser}
            </p>
          ))}
        </Panel>
      </Collapse>
    </Card>
  );
}
