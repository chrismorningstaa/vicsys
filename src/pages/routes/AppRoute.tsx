import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import LogIn from "../auth/login/LogIn";
import SignUp from "../auth/signup/SignUp";
import UserPage from "../private/user/UserPage";
import NonTechUserPage from "../private/non-tech-user/NonTechUser";
import Main from "../layouts/Main";
import useUserContext from "../../contexts/useUserContext";
import Dashboard from "../private/dashboard/Dashboard";
import Test from "../private/test/Test";
import EventPage from "../private/event/EventPage";
import AccountSettingPage from "../private/account-settings/AccountSettingPage";
import EmailVerificationPage from "../private/email-verification/EmailVerificationPage";
import TicketCategoriesPage from "../private/ticket-categories/TicketCategoriesPage";
import KidsListPage from "../private/kids-list/KidsListPage";
import MyPurchasePage from "../private/my-purchases/MyPurchasePage";
import MyKidsPage from "../private/my-kids/MyKidsPage";
import BookingPage from "../private/booking/BookingPage";
import ReportsPage from "../private/reports/ReportsPage";
import NotificationCreate from "../private/notification/NotificationForm";
import ViewNotification from "../private/notification/ViewNotification";

export default function AppRoute() {
  const { user } = useUserContext();
  const router = createBrowserRouter([
    {
      element: <Outlet />,
      children: [
        {
          path: "login",
          element: <LogIn />,
        },
        {
          path: "signup",
          element: <SignUp />,
        },
      ],
    },
    {
      element: user ? <Main /> : <Navigate to="/login" />,
      children: [
        {
          path: "users",
          element: <UserPage />,
        },
        {
          path: "nontechusers",
          element: <NonTechUserPage />,
        },
        {
          path: "/",
          element: <Dashboard />,
        },
        {
          path: "/test",
          element: <Test />,
        },
        {
          path: "events",
          element: <EventPage />,
        },
        {
          path: "account-settings",
          element: <AccountSettingPage />,
        },
        {
          path: "email-verification",
          element: <EmailVerificationPage />,
        },
        {
          path: "ticket-categories",
          element: <TicketCategoriesPage />,
        },
        {
          path: "kids-list",
          element: <KidsListPage />,
        },
        {
          path: "my-purchase",
          element: <MyPurchasePage />,
        },
        {
          path: "my-kids",
          element: <MyKidsPage />,
        },
        {
          path: "event-booking",
          element: <BookingPage />,
        },
        {
          path: "reports",
          element: <ReportsPage />,
        },
        {
          path: "notification/create",
          element: <NotificationCreate />,
        },
        {
          path: "notification/view",
          element: <ViewNotification />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}
