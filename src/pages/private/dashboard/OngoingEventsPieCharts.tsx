import { Column, ColumnConfig } from "@ant-design/charts";
import { IOngoingEvent } from "../../../interfaces/firebase/IEvent";
import { TicketStatus } from "../../../interfaces/firebase/ITicket";

export default function OngoingEventsPieCharts(props: {
  events: IOngoingEvent[] | undefined;
}) {
  const { events } = props;

  return (
    <div className="row">
      {events?.map((e) => (
        <OngoingEventPieChart {...e} />
      ))}
    </div>
  );
}

export function OngoingEventPieChart(ongoingEvent: IOngoingEvent) {
  let attendedCount = 0;
  let notAttendedCount = 0;
  ongoingEvent.attendees.map((a) =>
    a.myPurchaseEvents.map((m) => {
      if (m.status == TicketStatus.Completed) {
        attendedCount = attendedCount + 1;
      } else {
        notAttendedCount = notAttendedCount + 1;
      }
    })
  );
  const config: ColumnConfig = {
    data: [
      {
        type: `Attended (${attendedCount})`,
        value: attendedCount,
        color: "#4CAF50",
      },
      {
        type: `Not Attended (${notAttendedCount})`,
        name: "Not Attended",
        value: notAttendedCount,
        color: "#FF5252",
      },
    ],

    xField: "type",
    yField: "value",
    colorField: "type",
    state: {
      unselected: { opacity: 0.5 },
      selected: { lineWidth: 3, stroke: "red" },
    },
    interaction: {
      elementSelect: true,
    },
    width: 300,
    height: 300,
  };
  return (
    <div className="col-lg-6">
      <h6>{ongoingEvent.eventName}</h6>
      <Column {...config} />
    </div>
  );
}
