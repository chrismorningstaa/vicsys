import { Avatar, Button, Layout, theme } from "antd";
import useSidebarContext from "./contexts/useSidebarContext";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import vicsys1 from "../../assets/vicsys1.png";
import useUserContext from "../../contexts/useUserContext";
import userService from "../../firebase/services/userService";
import { useEffect, useState } from "react";
import { IUser } from "../../interfaces/firebase/IUser";

const { Header } = Layout;
export default function HeaderLayout() {
  const { user } = useUserContext();
  if (!user?.uid) return;
  const { collapsed, setCollapsed } = useSidebarContext();

  const [userLogged, setUserLogged] = useState<IUser | null>(null);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const _userService = userService();
  const getUserProfile = async () => {
    const newUser = await _userService.getById(user.uid);
    setUserLogged(newUser);
  };
  useEffect(() => {
    getUserProfile();
  }, []);
  return (
    <Header
      style={{
        padding: 0,
        background: colorBgContainer,
        display: "flex",
        justifyContent: " space-between",
      }}
    >
      <div>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            fontSize: "16px",
            width: 64,
            height: 64,
          }}
        />
        <img src={vicsys1} style={{ width: 120 }} />
      </div>
      <div style={{ marginRight: 40 }}>
        <Avatar
          size={30}
          style={{ marginRight: 6 }}
          icon={
            <img
              src={userLogged?.profile_picture_url ?? user.photoURL ?? ""}
              alt="profile"
            />
          }
        />
        {userLogged?.name}
      </div>
    </Header>
  );
}
