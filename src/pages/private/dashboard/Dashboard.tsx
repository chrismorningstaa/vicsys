import "./Dashboard.css";
import TotalKidsPieChart from "./TotalKidsPieChart";
import TotalUsersPieChart from "./TotalUsersPieChart";
import CalendarLayout from "./CalendarLayout";
import { useQuery } from "@tanstack/react-query";
import dashboardService from "../../../firebase/services/dasboardService";
import moneyFormat from "../../../utils/moneyFormat";
import EventDetails from "./EventDetails";
import OngoingEventsPieCharts from "./OngoingEventsPieCharts";

export default function Dashboard() {
  const _dahsboardService = dashboardService();
  const { data, refetch } = useQuery({
    queryKey: ["dashboardDetails"],
    queryFn: _dahsboardService.getDashboardDetails,
    initialData: {
      totalRegistration: 0,
      totalKids: 0,
      totalEvents: 0,
      totalTicketSold: 0,
      totalKidsPieDetails: [],
      totalUserPieChart: [],
      ongoingEvents: [],
      events: [],
    },
  });
  return (
    <div className="row">
      {/* <!-- Main content --> */}
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mb-3 border-bottom">
        <h1 className="h2">Dashboard</h1>
      </div>

      {/* <!-- Stats Section --> */}
      <div className="row stats">
        <div className="col-md-3">
          <div className="card text-white bg-primary mb-3">
            <div className="card-body">
              <h5 className="card-title text-center">Total Registration</h5>
              <p className="card-text text-center">{data?.totalRegistration}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-success mb-3">
            <div className="card-body">
              <h5 className="card-title text-center">Total of Kids</h5>
              <p className="card-text text-center">{data?.totalKids}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-info mb-3">
            <div className="card-body">
              <h5 className="card-title text-center">Total Events</h5>
              <p className="card-text text-center" id="eventCount">
                {data?.totalEvents}
              </p>
              {/* <!-- Dynamic event count --> */}
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-warning mb-3">
            <div className="card-body">
              <h5 className="card-title text-center">Total Ticket Sold</h5>
              <p className="card-text text-center">
                ₱{moneyFormat(data?.totalTicketSold || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* <!-- Events Section --> */}
      <div className="row">
        <div className="col-md-6">
          <div className="card mb-3">
            <div className="card-header">Events</div>
            <div className="card-body">
              <EventDetails events={data.events} refetch={refetch} />
            </div>
          </div>
        </div>

        {/* <!-- Pie Chart for Total of Kids --> */}
        <div className="col-md-6">
          <div className="card mb-3">
            <div className="card-header">Total of Kids (Kids Registration)</div>
            <div className="pie-chart">
              <TotalKidsPieChart childrens={data.totalKidsPieDetails} />
            </div>
          </div>
        </div>

        {/* <!-- Pie Chart for Total Users --> */}
        <div className="col-md-6">
          <div className="card mb-3">
            <div className="card-header">Total of Users</div>
            <div className="card-body">
              <TotalUsersPieChart users={data.totalUserPieChart} />
            </div>
          </div>
        </div>

        {/* <!-- Calendar --> */}
        <div className="col-md-6">
          <div className="card mb-3">
            <div className="card-header">Calendar</div>
            <CalendarLayout />
          </div>
        </div>

        <div className="card">
          <div className="card-header">Ongoing events</div>
          <OngoingEventsPieCharts events={data?.ongoingEvents} />
        </div>
      </div>
    </div>
  );
}
