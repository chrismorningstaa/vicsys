import React from "react";
import { DatePicker, Space } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { NotificationPayload } from "./NotificationForm";

interface SchedulingStepProps {
  formData: {
    scheduledTime: Dayjs | null;
  };
  handleInputChange: (field: keyof NotificationPayload, value: any) => void;
}

const SchedulingStep: React.FC<SchedulingStepProps> = ({
  formData,
  handleInputChange,
}) => {
  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <DatePicker
        showTime
        style={{ width: "100%" }}
        placeholder="Select date and time"
        value={formData.scheduledTime}
        onChange={(date) => handleInputChange("scheduledTime", date)}
        disabledDate={(current) => {
          return current && current < dayjs().startOf("day");
        }}
        disabledTime={(date) => {
          if (date && date.isSame(dayjs(), "day")) {
            const currentHour = dayjs().hour();
            const currentMinute = dayjs().minute();
            return {
              disabledHours: () =>
                Array.from({ length: currentHour }, (_, i) => i),
              disabledMinutes: (selectedHour: number) =>
                selectedHour === currentHour
                  ? Array.from({ length: currentMinute }, (_, i) => i)
                  : [],
            };
          }
          return {};
        }}
        showNow={false}
      />
    </Space>
  );
};

export default SchedulingStep;
