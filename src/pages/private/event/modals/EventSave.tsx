import {
  Form,
  Input,
  Button,
  DatePicker,
  InputNumber,
  Space,
  Modal,
  Select,
  Switch,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import useEventContext from "../useEventContext";
import { useEffect, useState } from "react";
import { convertUnixToDateOnlyText } from "../../../../utils/dateTimeFormat";
import EventImageUpload from "../components/EventImageUpload";
import { IEventSave } from "../../../../interfaces/firebase/IEvent";
import eventService from "../../../../firebase/services/eventService";
import Swal from "sweetalert2";
import ticketCategoryService from "../../../../firebase/services/ticketCategoryService";
import { useQuery } from "@tanstack/react-query";

const { Option } = Select;
export default function EventSaveModal() {
  const {
    isSaveModalOpen,
    setIsSaveModalOpen,
    selectedEvent,
    setImageUpload,
    setSelectedEvent,
    imageUpload,
    refetch,
  } = useEventContext();
  const _eventService = eventService();
  const _ticketCategoryService = ticketCategoryService();
  const [form] = Form.useForm();
  const [startTime, setStartTime] = useState("");
  const { data: ticketCategories } = useQuery({
    queryKey: ["ticketCategories"],
    queryFn: _ticketCategoryService.getAll,
  });
  const handleStartTimeChange = (e: any) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);

    // Get current end time value
    const endTime = form.getFieldValue("endTime");

    // If end time exists and is less than or equal to new start time, clear end time
    if (endTime && new Date(endTime) <= new Date(newStartTime)) {
      form.setFieldValue("endTime", "");
    }
  };
  const getMinEndTime = () => {
    if (!startTime) return "";
    const startDate = new Date(startTime);
    startDate.setMinutes(startDate.getMinutes() + 1);
    return startDate.toISOString().slice(0, 16);
  };

  const onFinish = async (values: any) => {
    try {
      const { eventDuration, ...rest } = values;
      const formattedValues: IEventSave = {
        ...rest,
        image: imageUpload ?? values.image,
      };
      form.validateFields();
      if (selectedEvent?.id) {
        await _eventService.update(selectedEvent.id, formattedValues);
      } else {
        await _eventService.add(formattedValues);
      }
      setIsSaveModalOpen(false);
      setImageUpload(null);
      setSelectedEvent(null);
      refetch();
      Swal.fire({
        icon: "success",
        title: "Event successfully saved",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (_e: any) {
      let e: Error = _e;
      Swal.fire({
        icon: "error",
        title: "Error saving event",
        text: e.message,
      });
    }
  };

  useEffect(() => {
    if (selectedEvent) {
      const formattedValues = {
        ...selectedEvent,
        startTime: convertUnixToDateOnlyText(selectedEvent.startTime),
        endTime: convertUnixToDateOnlyText(selectedEvent.endTime),
      };
      setStartTime(convertUnixToDateOnlyText(selectedEvent.startTime));
      form.setFieldsValue(formattedValues);
      return;
    }
    form.setFieldsValue({
      eventName: "",
      description: "",
      startTime: "",
      endTime: "",
      image: "",
      venue: "",
      ticketCategories: [],
      attendees: [],
      children: [],
      isForKids: false,
    });
  }, [isSaveModalOpen]);

  return (
    <Modal
      title={selectedEvent ? "Update Event" : "Create Event"}
      open={isSaveModalOpen}
      width={700}
      onCancel={() => {
        setIsSaveModalOpen(false);
      }}
      footer={null}
    >
      <Form
        name="event-create"
        layout="vertical"
        form={form}
        onFinish={onFinish}
      >
        <div className="overflow-auto" style={{ height: 400 }}>
          {/* Upload Image */}
          <EventImageUpload initialSrc={selectedEvent?.image} />

          <Form.Item
            label="Event Name"
            name="eventName"
            rules={[
              { required: true, message: "Please input the event name!" },
            ]}
          >
            <Input placeholder="Enter event name" />
          </Form.Item>

          {/* Venue */}
          <Form.Item
            label="Venue"
            name="venue"
            rules={[{ required: true, message: "Please input the venue!" }]}
          >
            <Input placeholder="Enter venue" />
          </Form.Item>

          {/* Description */}
          <Form.Item
            label="Description"
            name="description"
            rules={[
              {
                required: true,
                message: "Please input the event description!",
              },
            ]}
          >
            <Input.TextArea rows={4} placeholder="Enter event description" />
          </Form.Item>

          {/* Is for Kids */}
          <Form.Item
            label="Is this event for kids?"
            name="isForKids"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <div className="d-flex gap-2">
            {/* Start Time */}
            <Form.Item
              label="Start time"
              name="startTime"
              rules={[
                {
                  required: true,
                  message: "Please select the start time duration!",
                },
              ]}
            >
              <input
                type="datetime-local"
                className="ant-input"
                style={{ width: "100%", padding: "4px 11px" }}
                onChange={handleStartTimeChange}
              />
            </Form.Item>
            <Form.Item
              label="End time"
              name="endTime"
              rules={[
                {
                  required: true,
                  message: "Please select the end time duration!",
                },
              ]}
            >
              <input
                type="datetime-local"
                className="ant-input"
                style={{ width: "100%", padding: "4px 11px" }}
                min={getMinEndTime()}
              />
            </Form.Item>
          </div>

          {/* Ticket Categories */}
          <Form.List name="ticketCategories">
            {(fields, { add, remove }) => (
              <>
                <label>Ticket Categories</label>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "ticketCategoryId"]}
                      label="Ticket Name"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Select>
                        {ticketCategories?.map((t) => (
                          <Option value={t.id}>{t.description}</Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "ticketPrice"]}
                      label="Price"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <InputNumber
                        placeholder="Price"
                        min={0}
                        formatter={(value) => `₱${value}`}
                      />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "ticketTotal"]}
                      label="Total Ticket"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <InputNumber placeholder="Total Tickets" min={0} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "ticketPerUser"]}
                      label="Ticket Per User"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <InputNumber placeholder="Ticket per User" min={0} />
                    </Form.Item>
                    <MinusCircleOutlined
                      style={{ color: "red" }}
                      onClick={() => remove(name)}
                    />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Ticket Category
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </div>
        <Form.Item className="p-2 d-flex justify-content-end">
          <Button type="primary" htmlType="submit" style={{ marginRight: 5 }}>
            {selectedEvent ? "Update" : "Create"}
          </Button>
          <Button
            onClick={() => {
              setIsSaveModalOpen(false);
            }}
          >
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
