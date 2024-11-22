import { Menu, Modal } from "antd";
import Sider from "antd/es/layout/Sider";
import {
  PieChartOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  HomeOutlined,
  ShoppingCartOutlined,
  FolderOpenOutlined,
  EyeOutlined,
  BellOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import useSidebarContext from "./contexts/useSidebarContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Swal from "sweetalert2";
import accountService from "../../firebase/services/accountService";

type MenuItem = Required<MenuProps>["items"][number];

export default function Sidebar() {
  const navigate = useNavigate();
  const [isLogoutModelOpen, setIsLogoutModelOpen] = useState(false);
  const _accountService = accountService();
  const items: MenuItem[] = [
    {
      label: "Dashboard",
      key: "1",
      icon: <HomeOutlined />,
      onClick: () => navigate("/"),
    },
    {
      label: "Peoples",
      key: "2",
      icon: <UserOutlined />,
      onClick: () => navigate("users"),
    },
    {
      label: "Non-Tech Users",
      key: "3",
      icon: <UserOutlined />,
      onClick: () => navigate("nontechusers"),
    },
    {
      label: "Events",
      key: "4",
      icon: <PieChartOutlined />,
      onClick: () => navigate("events"),
    },
    {
      label: "Ticket Categories",
      key: "5",
      icon: <UserOutlined />,
      onClick: () => navigate("ticket-categories"),
    },
    {
      label: "Kids list",
      key: "6",
      icon: <UserOutlined />,
      onClick: () => navigate("kids-list"),
    },
    // {
    //   label: "My Purchase",
    //   key: "7",
    //   icon: <ShoppingCartOutlined />,
    //   onClick: () => navigate("my-purchase"),
    // },
    // {
    //   label: "My Kids",
    //   key: "8",
    //   icon: <ShoppingCartOutlined />,
    //   onClick: () => navigate("my-kids"),
    // },
    {
      label: "Event Booking",
      key: "8",
      icon: <ShoppingCartOutlined />,
      onClick: () => navigate("event-booking"),
    },
    {
      label: "Reports",
      key: "9",
      icon: <FolderOpenOutlined />,
      onClick: () => navigate("reports"),
    },
    {
      label: "Account",
      key: "sub1",
      icon: <SettingOutlined />,
      children: [
        {
          label: "Settings",
          key: "10",
          icon: <SettingOutlined />,
          onClick: () => navigate("account-settings"),
        },
        {
          label: "Logout",
          key: "11",
          icon: <LogoutOutlined />,
          onClick: () => handleLogout(),
        },
      ],
    },
    {
      label: "Notification",
      key: "sub2",
      icon: <BellOutlined />,
      children: [
        {
          label: "Create",
          key: "12",
          icon: <ShoppingCartOutlined />,
          onClick: () => navigate("notification/create"),
        },
        {
          label: "View",
          key: "13",
          icon: <EyeOutlined />,
          onClick: () => navigate("notification/view"),
        },
      ],
    },
  ];

  const { collapsed, setCollapsed } = useSidebarContext();
  const siderStyle: React.CSSProperties = {
    overflow: "auto",
    position: "fixed",
    insetInlineStart: 0,
    top: 0,
    bottom: 0,
    scrollbarWidth: "thin",
    scrollbarColor: "unset",
  };

  const handleLogout = async () => {
    Swal.fire({
      title: "Are you sure you want to logout?",
      showCancelButton: true,
      confirmButtonColor: "red",
      confirmButtonText: "Logout",
    }).then(async ({ isConfirmed }) => {
      if (isConfirmed) {
        await _accountService.logout();
        navigate("/login");
      }
    });
  };

  const LogoutConfimationModal = () => {
    return (
      <Modal
        open={isLogoutModelOpen}
        onOk={handleLogout}
        onCancel={() => setIsLogoutModelOpen(false)}
      >
        <center>
          <h4>Logout</h4>
          <p>Are you sure you want to logout?</p>
        </center>
      </Modal>
    );
  };

  return (
    <>
      <LogoutConfimationModal />
      {!collapsed && (
        <Sider
          style={siderStyle}
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
        >
          <Menu theme="dark" mode="inline" items={items} />
        </Sider>
      )}
    </>
  );
}
