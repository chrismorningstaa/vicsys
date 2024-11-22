import React, { useState, useEffect } from "react";
import {
  Card,
  Steps,
  Button,
  Input,
  Select,
  DatePicker,
  Alert,
  Space,
  Tag,
  Modal,
  Typography,
} from "antd";
import { LeftOutlined, RightOutlined, SendOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { messaging, requestForToken } from "../../../firebase/firebaseConfig";
import { isSupported } from "firebase/messaging";

const { Step } = Steps;
const { TextArea } = Input;
const { Text } = Typography;

interface NotificationPayload {
  title: string;
  body: string;
  token: string;
  targetType: "all" | "specific" | "topic";
  targetValue: string;
  scheduledTime: dayjs.Dayjs | null;
  campaignId?: string;
}

const NotificationCreate: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [formData, setFormData] = useState<NotificationPayload>({
    title: "",
    body: "",
    token: "",
    targetType: "all",
    targetValue: "",
    scheduledTime: null,
  });
  const [previewModal, setPreviewModal] = useState<{
    visible: boolean;
    notification: NotificationPayload | null;
  }>({
    visible: false,
    notification: null,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [isMessagingSupported, setIsMessagingSupported] =
    useState<boolean>(true);

  useEffect(() => {
    const checkMessagingSupport = async () => {
      try {
        const isFirebaseMessagingSupported = await isSupported();
        setIsMessagingSupported(isFirebaseMessagingSupported);

        if (isFirebaseMessagingSupported && messaging) {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            const token = await requestForToken();
            if (token) {
              setFormData((prev) => ({ ...prev, token }));
              console.log("FCM Token:", token);
            }
          }
        }
      } catch (err) {
        console.error("Error initializing messaging:", err);
        setError("Failed to initialize push notifications");
        setIsMessagingSupported(false);
      }
    };

    checkMessagingSupport();
  }, []);

  const steps = [
    {
      title: "Notification",
      description: "Set message content",
    },
    {
      title: "Target",
      description: "Choose recipients",
    },
    {
      title: "Scheduling",
      description: "Set delivery time",
    },
  ];

  const formatTarget = (targetType: string, targetValue: string) => {
    switch (targetType) {
      case "all":
        return <Tag color="blue">All Users</Tag>;
      case "topic":
        return <Tag color="green">Topic: {targetValue}</Tag>;
      case "specific":
        return <Tag color="orange">Specific Device</Tag>;
      default:
        return <Tag color="default">Unknown</Tag>;
    }
  };

  const handleInputChange = (field: keyof NotificationPayload, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
  };

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 0:
        if (!formData.title.trim() || !formData.body.trim()) {
          setError("Title and body are required");
          return false;
        }
        break;
      case 1:
        if (
          formData.targetType === "specific" &&
          !formData.targetValue.trim()
        ) {
          setError("Please specify device tokens");
          return false;
        }
        if (formData.targetType === "topic" && !formData.targetValue.trim()) {
          setError("Please specify topic name");
          return false;
        }
        break;
      case 2:
        // Scheduling validation (optional)
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSend = async () => {
    if (!validateStep()) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        title: formData.title,
        body: formData.body,
        targetType: formData.targetType,
        ...(formData.targetType !== "all" && {
          targetValue: formData.targetValue,
        }),
        ...(formData.scheduledTime && {
          scheduledFor: formData.scheduledTime.toISOString(),
        }),
      };

      console.log("Creating notification campaign:", payload);

      const response = await fetch("http://localhost:5000/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.details || data.error || `HTTP error! status: ${response.status}`
        );
      }

      console.log("Campaign created:", data);
      setSuccess(true);
      setCampaignId(data.campaignId);

      setFormData({
        title: "",
        body: "",
        token: formData.token,
        targetType: "all",
        targetValue: "",
        scheduledTime: null,
      });
      setCurrentStep(0);
    } catch (err) {
      console.error("Campaign creation error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create campaign"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isMessagingSupported) {
    return (
      <Alert
        message="Error"
        description="Firebase Cloud Messaging is not supported in this browser or failed to initialize."
        type="error"
        showIcon
      />
    );
  }

  const NotificationStep = () => (
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

  const TargetStep = () => (
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

  const SchedulingStep = () => (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <DatePicker
        showTime
        style={{ width: "100%" }}
        placeholder="Send now or Select date and time"
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
              disabledMinutes: (selectedHour) =>
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

  const renderScheduledTime = (time: dayjs.Dayjs | null) => {
    if (!time) return "Not scheduled";
    return time.format("YYYY-MM-DD HH:mm:ss");
  };

  const getCurrentStepContent = () => {
    switch (currentStep) {
      case 0:
        return <NotificationStep />;
      case 1:
        return <TargetStep />;
      case 2:
        return <SchedulingStep />;
      default:
        return null;
    }
  };

  return (
    <Card style={{ maxWidth: 800, margin: "0 auto" }}>
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        {steps.map((step, index) => (
          <Step key={index} title={step.title} description={step.description} />
        ))}
      </Steps>

      <div style={{ marginBottom: 24 }}>{getCurrentStepContent()}</div>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {success && (
        <Alert
          message="Success"
          description={
            <div>
              Notification created successfully!
              {campaignId && (
                <div style={{ marginTop: 8 }}>
                  Notification ID: <Tag color="blue">{campaignId}</Tag>
                </div>
              )}
            </div>
          }
          type="success"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Space>
          <Button
            onClick={handleBack}
            disabled={currentStep === 0}
            icon={<LeftOutlined />}
          >
            Back
          </Button>

          <Button
            onClick={() =>
              setPreviewModal({ visible: true, notification: formData })
            }
            disabled={currentStep < 2}
          >
            Preview
          </Button>
        </Space>

        {currentStep < steps.length - 1 ? (
          <Button type="primary" onClick={handleNext}>
            Next <RightOutlined />
          </Button>
        ) : (
          <Button
            type="primary"
            onClick={handleSend}
            loading={loading}
            icon={<SendOutlined />}
          >
            Create Notification
          </Button>
        )}
      </div>
      <Modal
        title="Notification Preview"
        open={previewModal.visible}
        onCancel={() => setPreviewModal({ visible: false, notification: null })}
        footer={[
          <Button
            key="close"
            onClick={() =>
              setPreviewModal({ visible: false, notification: null })
            }
          >
            Close
          </Button>,
        ]}
      >
        {previewModal.notification && (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Card>
              <Space direction="vertical">
                <Text strong>Title:</Text>
                <Text>{previewModal.notification.title}</Text>

                <Text strong>Content:</Text>
                <Text>{previewModal.notification.body}</Text>

                <Text strong>Target:</Text>
                {formatTarget(
                  previewModal.notification.targetType,
                  previewModal.notification.targetValue
                )}

                <Text strong>Scheduled At:</Text>
                <Text>
                  {renderScheduledTime(previewModal.notification.scheduledTime)}
                </Text>
              </Space>
            </Card>
          </Space>
        )}
      </Modal>
    </Card>
  );
};

export default NotificationCreate;