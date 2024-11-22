import { useState } from "react";
import { Layout, Alert } from "antd";
import { SidebarContext } from "./contexts/useSidebarContext";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { Link, Outlet } from "react-router-dom";
import HeaderLayout from "./HeaderLayout";
import accountService from "../../firebase/services/accountService";
import { MainContext } from "./contexts/useMainContext";
import { useQuery } from "@tanstack/react-query";

const { Content } = Layout;

export default function Main() {
  const [collapsed, setCollapsed] = useState(false);
  const _accounService = accountService();
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  useQuery({
    queryKey: ["emailVerified"],
    queryFn: () => {
      const isVerified = _accounService.isEmailVerified();
      setIsEmailVerified(isVerified);
      return isVerified;
    },
  });

  return (
    <MainContext.Provider value={{ isEmailVerified, setIsEmailVerified }}>
      <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
        <Layout style={{ minHeight: "100vh" }}>
          <Sidebar />
          <Layout style={{ marginInlineStart: collapsed ? 0 : 200 }}>
            <HeaderLayout />

            {/* Show alert if email is not verified */}
            {!isEmailVerified && (
              <Alert
                message="Email not verified"
                description={
                  <>
                    Your email address is not verified. Please{" "}
                    <Link to="email-verification" style={{ color: "#1890ff" }}>
                      click here to verify
                    </Link>{" "}
                    to unlock all features.
                  </>
                }
                type="warning"
                showIcon
                banner
                style={{ marginBottom: 16 }}
              />
            )}

            <Content style={{ margin: "24px 16px 0", overflow: "auto" }}>
              <Outlet />
            </Content>
            <Footer />
          </Layout>
        </Layout>
      </SidebarContext.Provider>
    </MainContext.Provider>
  );
}
