import React from "react";
import { Input, Space } from "antd";
import { NotificationPayload } from "./NotificationForm";

const { TextArea } = Input;

interface NotificationStepProps {
  formData: {
    title: string;
    body: string;
    token: string;
  };
  handleInputChange: (field: keyof NotificationPayload, value: any) => void;
}

const NotificationStep: React.FC<NotificationStepProps> = ({
  formData,
  handleInputChange,
}) => {
  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Input
        placeholder="Notification Title"
        value={formData.title}
        onChange={(e) => handleInputChange("title", e.target.value)}
      />
      <TextArea
        placeholder="Notification Body"
        value={formData.body}
        onChange={(e) => handleInputChange("body", e.target.value)}
        rows={4}
      />
      <Input.TextArea
        value={formData.token}
        readOnly
        rows={2}
        placeholder="Device Registration Token"
        style={{ display: "none" }}
      />
    </Space>
  );
};

export default NotificationStep;
