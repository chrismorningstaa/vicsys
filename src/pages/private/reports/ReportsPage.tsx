import { useQuery } from "@tanstack/react-query";
import eventService from "../../../firebase/services/eventService";
import {
  ITicketCategory,
  IOngoingEvent,
} from "../../../interfaces/firebase/IEvent";
import { IUser } from "../../../interfaces/firebase/IUser";
import { TicketStatus } from "../../../interfaces/firebase/ITicket";
import { Card, Typography, DatePicker, Space } from "antd";
import type { Dayjs } from "dayjs";
import { Table } from "antd";
import { useState } from "react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

import { ExportButtons } from "../../../components/ExportButtons";
import PrintButton from "../../../components/PrintButtons";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const normalizeTimestamp = (timestamp: any): Dayjs | null => {
  if (!timestamp) return null;

  try {
    if (typeof timestamp === "number") {
      return dayjs.unix(timestamp);
    }
    if (timestamp instanceof Date) {
      return dayjs(timestamp);
    }
    if (timestamp?.seconds) {
      return dayjs.unix(timestamp.seconds);
    }
    return dayjs(timestamp);
  } catch (error) {
    console.error("Error normalizing timestamp:", error, timestamp);
    return null;
  }
};

export default function ReportsPage() {
  const _eventService = eventService();
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);

  const { data: events } = useQuery({
    queryKey: ["events"],
    queryFn: _eventService.getAll,
  });

  const getCompletedEvents = (allEvents: any[]) => {
    if (!allEvents) return [];

    const currentDate = dayjs();
    return allEvents.filter((event) => {
      const endTime = normalizeTimestamp(event.endTime);
      return endTime && endTime.isBefore(currentDate, "day");
    });
  };

  const getOngoingEvents = (allEvents: any[]) => {
    if (!allEvents) return [];

    const currentDate = dayjs();
    return allEvents.filter((event) => {
      const startTime = normalizeTimestamp(event.startTime);
      const endTime = normalizeTimestamp(event.endTime);

      return (
        startTime &&
        endTime &&
        startTime.isSameOrBefore(currentDate, "day") &&
        endTime.isSameOrAfter(currentDate, "day")
      );
    });
  };

  const getPendingTicketsCount = (event: IOngoingEvent) => {
    let pendingCount = 0;
    for (const attendee of event.attendees) {
      for (const purchase of attendee.myPurchaseEvents ?? []) {
        if (purchase.status === TicketStatus.Pending) {
          pendingCount++;
        }
      }
    }
    return pendingCount;
  };

  const filterEventsByDateRange = (events: any[]) => {
    if (!dateRange[0] || !dateRange[1] || !events?.length) {
      return events;
    }

    const startDate = dateRange[0].startOf("day");
    const endDate = dateRange[1].endOf("day");

    return events.filter((event) => {
      const eventStartTime = normalizeTimestamp(event.startTime);

      if (!eventStartTime) return false;

      if (process.env.NODE_ENV === "development") {
        console.log({
          eventName: event.eventName,
          eventStartTime: eventStartTime.format("YYYY-MM-DD HH:mm:ss"),
          rangeStart: startDate.format("YYYY-MM-DD HH:mm:ss"),
          rangeEnd: endDate.format("YYYY-MM-DD HH:mm:ss"),
          isInRange: eventStartTime.isBetween(startDate, endDate, "day", "[]"),
        });
      }

      return eventStartTime.isBetween(startDate, endDate, "day", "[]");
    });
  };

  const handleRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates) {
      const [start, end] = dates;
      const normalizedStart = start?.startOf("day") || null;
      const normalizedEnd = end?.endOf("day") || null;

      if (process.env.NODE_ENV === "development") {
        console.log("Setting date range:", {
          start: normalizedStart?.format("YYYY-MM-DD HH:mm:ss"),
          end: normalizedEnd?.format("YYYY-MM-DD HH:mm:ss"),
        });
      }

      setDateRange([normalizedStart, normalizedEnd]);
    } else {
      setDateRange([null, null]);
    }
  };

  const filteredEvents = filterEventsByDateRange(events ?? []);
  const ongoingEventsList = filterEventsByDateRange(getOngoingEvents(events ?? []));
  const completedEvents = filterEventsByDateRange(
    getCompletedEvents(events ?? [])
  );

  const totalEventsColumns = [
    { title: "Event Name", dataIndex: "eventName" },
    {
      title: "Start Date",
      dataIndex: "startTime",
      render: (date: any) => {
        const timestamp = normalizeTimestamp(date);
        return timestamp ? timestamp.format("MMMM D, YYYY") : "";
      },
    },
    {
      title: "End Date",
      dataIndex: "endTime",
      render: (date: any) => {
        const timestamp = normalizeTimestamp(date);
        return timestamp ? timestamp.format("MMMM D, YYYY") : "";
      },
    },
  ];

  const ongoingEventsColumns = [
    { title: "Event Name", dataIndex: "eventName" },
    { title: "Venue", dataIndex: "venue" },
    {
      title: "Start Date",
      dataIndex: "startTime",
      render: (date: any) => {
        const timestamp = normalizeTimestamp(date);
        return timestamp ? timestamp.format("MMMM D, YYYY") : "";
      },
    },
    {
      title: "End Date",
      dataIndex: "endTime",
      render: (date: any) => {
        const timestamp = normalizeTimestamp(date);
        return timestamp ? timestamp.format("MMMM D, YYYY") : "";
      },
    },
    {
      title: "Attendees",
      dataIndex: "attendees",
      render: (attendees: IUser[]) => attendees.length,
    },
    {
      title: "Total Pending Tickets",
      dataIndex: "",
      render: (event: IOngoingEvent) => getPendingTicketsCount(event),
    },
    {
      title: "Total Tickets Sold",
      dataIndex: "ticketCategories",
      render: (ticketCategories: ITicketCategory[]) =>
        ticketCategories.reduce(
          (total, category) => total + category.ticketSold,
          0
        ),
    },
  ];

  const completedEventsColumns = [
    {
      title: "Event Name",
      dataIndex: "eventName",
      sorter: (a: any, b: any) => a.eventName.localeCompare(b.eventName),
    },
    {
      title: "Venue",
      dataIndex: "venue",
    },
    {
      title: "Start Date",
      dataIndex: "startTime",
      render: (date: any) => {
        const timestamp = normalizeTimestamp(date);
        return timestamp ? timestamp.format("MMMM D, YYYY") : "";
      },
      sorter: (a: any, b: any) => {
        const aTime = normalizeTimestamp(a.startTime);
        const bTime = normalizeTimestamp(b.startTime);
        if (!aTime || !bTime) return 0;
        return aTime.diff(bTime);
      },
    },
    {
      title: "End Date",
      dataIndex: "endTime",
      render: (date: any) => {
        const timestamp = normalizeTimestamp(date);
        return timestamp ? timestamp.format("MMMM D, YYYY") : "";
      },
      sorter: (a: any, b: any) => {
        const aTime = normalizeTimestamp(a.endTime);
        const bTime = normalizeTimestamp(b.endTime);
        if (!aTime || !bTime) return 0;
        return aTime.diff(bTime);
      },
    },
    {
      title: "Total Attendees",
      dataIndex: "attendees",
      render: (attendees: IUser[]) => attendees?.length || 0,
      sorter: (a: any, b: any) =>
        (a.attendees?.length || 0) - (b.attendees?.length || 0),
    },
    {
      title: "Total Tickets Sold",
      dataIndex: "ticketCategories",
      render: (ticketCategories: ITicketCategory[]) =>
        ticketCategories?.reduce(
          (total, category) => total + (category.ticketSold || 0),
          0
        ) || 0,
      sorter: (a: any, b: any) => {
        const aTotal =
          a.ticketCategories?.reduce(
            (total: number, cat: ITicketCategory) =>
              total + (cat.ticketSold || 0),
            0
          ) || 0;
        const bTotal =
          b.ticketCategories?.reduce(
            (total: number, cat: ITicketCategory) =>
              total + (cat.ticketSold || 0),
            0
          ) || 0;
        return aTotal - bTotal;
      },
    },
    {
      title: "Revenue",
      dataIndex: "ticketCategories",
      render: (ticketCategories: ITicketCategory[]) => {
        const amount =
          ticketCategories?.reduce(
            (total, category) =>
              total + (category.ticketSold || 0) * (category.ticketPrice || 0),
            0
          ) || 0;
        return `₱${amount.toLocaleString("en-PH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      },
      sorter: (a: any, b: any) => {
        const aRevenue =
          a.ticketCategories?.reduce(
            (total: number, cat: ITicketCategory) =>
              total + (cat.ticketSold || 0) * (cat.ticketPrice || 0),
            0
          ) || 0;
        const bRevenue =
          b.ticketCategories?.reduce(
            (total: number, cat: ITicketCategory) =>
              total + (cat.ticketSold || 0) * (cat.ticketPrice || 0),
            0
          ) || 0;
        return aRevenue - bRevenue;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <Title level={4}>Date Range Filter</Title>
          <RangePicker
            className="w-96"
            format="YYYY-MM-DD"
            onChange={handleRangeChange}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        <Card>
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <Title level={4}>Total Events</Title>
              <Space>
                <span className="text-gray-500">
                  Showing {filteredEvents?.length} of {events?.length} events
                </span>
                <ExportButtons
                  data={filteredEvents}
                  columns={totalEventsColumns}
                  fileName="total-events"
                  title="Total Events Report"
                />
                <PrintButton
                  tableId="total-events-table"
                  title="Total Events Report"
                />
              </Space>
            </div>
          </div>
          <Table
            id="total-events-table"
            dataSource={filteredEvents}
            columns={totalEventsColumns}
          />
        </Card>

        <Card>
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <Title level={4}>Ongoing Events</Title>
              <Space>
                <span className="text-gray-500">
                  Showing {ongoingEventsList?.length} ongoing events
                </span>
                <ExportButtons
                  data={ongoingEventsList}
                  columns={ongoingEventsColumns}
                  fileName="ongoing-events"
                  title="Ongoing Events Report"
                />
                <PrintButton
                  tableId="ongoing-events-table"
                  title="Ongoing Events Report"
                />
              </Space>
            </div>
          </div>
          <Table
            id="ongoing-events-table"
            dataSource={ongoingEventsList}
            columns={ongoingEventsColumns}
          />
        </Card>

        <Card>
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <Title level={4}>Completed Events</Title>
              <Space>
                <span className="text-gray-500">
                  Showing {completedEvents?.length} completed events
                </span>
                <ExportButtons
                  data={completedEvents}
                  columns={completedEventsColumns}
                  fileName="completed-events"
                  title="Completed Events Report"
                />
                <PrintButton
                  tableId="completed-events-table"
                  title="Completed Events Report"
                />
              </Space>
            </div>
          </div>
          <Table
            id="completed-events-table"
            dataSource={completedEvents}
            columns={completedEventsColumns}
            scroll={{ x: true }}
          />
        </Card>
      </div>
    </div>
  );
}
