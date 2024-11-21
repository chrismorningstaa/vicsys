import IDahsboard from "../../interfaces/firebase/IDashboard";
import childrenService from "./childrenService";
import eventService from "./eventService";
import ticketService from "./ticketService";
import userService from "./userService";

export default function dashboardService() {
  const _eventService = eventService();
  const _userService = userService();
  const _ticketService = ticketService();
  const _childrenService = childrenService();

  const getDashboardDetails = async (): Promise<IDahsboard> => {
    const totalUsers = await _userService.getTotalUsers();
    const totalTicketSold = await _ticketService.getTotalTicketSold();
    const totalEvents = await _eventService.getTotalEvents();
    const totalChildren = await _childrenService.getTotalChildren();
    const ongoingEvents = await _eventService.getOngoingEvents();
    const totalKidsPieDetails =
      await _childrenService.getChildrenCategoryPieChart();
    const totalUserPieChart = await _userService.getUserRolePieChart();
    const events = await _eventService.getAll();

    const result: IDahsboard = {
      totalRegistration: totalUsers,
      totalKids: totalChildren,
      totalEvents: totalEvents,
      totalTicketSold: totalTicketSold,
      totalKidsPieDetails: totalKidsPieDetails,
      totalUserPieChart: totalUserPieChart,
      ongoingEvents: ongoingEvents,
      events: events,
    };
    return result;
  };

  return {
    getDashboardDetails,
  };
}
