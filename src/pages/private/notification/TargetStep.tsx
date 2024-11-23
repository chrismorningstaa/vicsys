import React from "react";
import { Select, Space, Input } from "antd";
import { NotificationPayload } from "./NotificationForm";

const { TextArea } = Input;

interface TargetStepProps {
  formData: {
    targetType: "all" | "topic" | "specific";
    targetValue: string;
  };
  handleInputChange: (field: keyof NotificationPayload, value: any) => void;
}

const TargetStep: React.FC<TargetStepProps> = ({
  formData,
  handleInputChange,
}) => {
  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Select
        style={{ width: "100%" }}
        value={formData.targetType}
        onChange={(value) => handleInputChange("targetType", value)}
        options={[
          { label: "All Platforms", value: "all" },
          { label: "Topic Subscribers", value: "topic" },
          { label: "Specific Device", value: "specific" },
        ]}
      />
      {formData.targetType !== "all" && (
        <TextArea
          placeholder={
            formData.targetType === "specific"
              ? "Enter device token"
              : 'Enter topic name (e.g., "android", "ios", or "web")'
          }
          value={formData.targetValue}
          onChange={(e) => handleInputChange("targetValue", e.target.value)}
          rows={4}
        />
      )}
    </Space>
  );
};

export default TargetStep;
