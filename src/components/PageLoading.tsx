import React from "react";
import { Spin } from "antd";
import vicsys1 from "../assets/vicsys1.png";
const PageLoading = () => {
  return (
    <div style={containerStyle}>
      <img src={vicsys1} style={{ width: 300 }} />
      <Spin size="large" />
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "50vh",
};

export default PageLoading;
