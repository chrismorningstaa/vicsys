import { Button, Card, Form, Input, Modal, message } from "antd";
import { IEvent } from "../../../../interfaces/firebase/IEvent";
import childrenService from "../../../../firebase/services/childrenService";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import IChild from "../../../../interfaces/firebase/IChild";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import DataTable, { ColumnConfig } from "../../../../components/DataTable";
import bookingService from "../../../../firebase/services/bookingService";
import Swal from "sweetalert2";
import useUserContext from "../../../../contexts/useUserContext";
import nonTechUserService from "../../../../firebase/services/nonTechUserService";
import userService from "../../../../firebase/services/userService";
import {
  IMyPuchaseEvent,
  INonTechUser,
} from "../../../../interfaces/firebase/INonTechUser";
import { TicketStatus } from "../../../../interfaces/firebase/ITicket";

interface IChildBook extends IChild {
  status?: "New" | "Current";
}

export default function BookingKidsModal(props: {
  selectedEvent: IEvent | null;
  setSelectedEvent: (value: IEvent) => void;
  setIsOpen: (value: boolean) => void;
  isOpen: boolean;
}) {
  const { selectedEvent, isOpen, setIsOpen } = props;
  const { user } = useUserContext();
  if (!user?.uid) return;

  const _childrenService = childrenService();
  const _nonTechUserService = nonTechUserService();
  const _userService = userService();
  const [newBookChildren, setNewBookChildren] = useState<IChildBook[]>([]);
  const [bookedChildren, setBookedChildren] = useState<IChild[]>([]);
  const [children, setChildren] = useState<IChild[]>([]);
  const [gcashRefNo, setGcashRefNo] = useState<string>("");
  const _bookingService = bookingService();
  const [form] = Form.useForm();

  const getAllBookedChildren = () => {
    return newBookChildren.concat(bookedChildren);
  };

  const handlGetCurrentChildren = async () => {
    const currentChildren = await _childrenService.getByEventId(
      selectedEvent?.id || ""
    );
    setBookedChildren(currentChildren);

    const response = await _childrenService.getAll();
    const filteredChildren = response.filter(
      (child) =>
        !currentChildren.some((currentChild) => currentChild.id === child.id)
    );

    setChildren(filteredChildren ?? []);
  };
  useEffect(() => {
    if (isOpen) {
      handlGetCurrentChildren();
    }

    return () => {
      setChildren([]);
      setBookedChildren([]);
      setNewBookChildren([]);
    };
  }, [isOpen]);

  const handleSaveToPurchase = async (childId: string) => {
    if (!selectedEvent?.id) return;

    try {
      console.log(childId);
      const child = await _childrenService.getById(childId);
      if (!child?.userId) throw new Error("Child's parent not found");
      let nonTechParent = await _nonTechUserService.getById(child.userId);

      if (nonTechParent) {
        const purchaseEvent: IMyPuchaseEvent = {
          eventId: selectedEvent.id,
          imageUrl: selectedEvent.image ?? "",
          isPaid: false,
          ticketId: uuidv4(),
          location: selectedEvent.venue ?? "",
          status: TicketStatus.Pending,
          ticketName: "Kids Ticket",
          gcashRefNo: gcashRefNo,
          startTime: selectedEvent.startTime,
          endTime: selectedEvent.endTime,
        };

        const updatedUser: INonTechUser = {
          ...nonTechParent,
          myPurchaseEvents: [
            ...(nonTechParent.myPurchaseEvents || []),
            purchaseEvent,
          ],
        };

        await _nonTechUserService.update(child.userId, updatedUser);
      } else {
        const regularParent = await _userService.getById(child.userId);
        if (!regularParent)
          throw new Error("Parent not found in either user system");

        const purchaseEvent: IMyPuchaseEvent = {
          eventId: selectedEvent.id,
          imageUrl: selectedEvent.image ?? "",
          isPaid: false,
          ticketId: uuidv4(),
          location: selectedEvent.venue ?? "",
          status: TicketStatus.Pending,
          ticketName: "Kids Ticket",
          gcashRefNo: gcashRefNo,
          startTime: selectedEvent.startTime,
          endTime: selectedEvent.endTime,
        };

        const updatedUser = {
          ...regularParent,
          myPurchaseEvents: [
            ...(regularParent.myPurchaseEvents || []),
            purchaseEvent,
          ],
        };

        await _userService.update(child.userId, updatedUser);
      }
    } catch (error) {
      console.error("Failed to save purchase:", error);
      throw error;
    }
  };

  const handleBookChild = async (child: IChild) => {
    try {
      setNewBookChildren((prev) => [...prev, { ...child, status: "New" }]);
      setChildren(children.filter((c) => c.id !== child.id));
      message.success(`${child.firstName} has been booked successfully!`);
    } catch (error) {
      console.error("Failed to book child:", error);
      message.error(`Failed to book ${child.firstName}. Please try again.`);
    }
  };

  const handleRemoveBooking = async (child: IChild) => {
    try {
      const childData = await _childrenService.getById(child.id || "");
      if (childData?.userId) {
        const nonTechParent = await _nonTechUserService.getById(
          childData.userId
        );
        if (nonTechParent?.myPurchaseEvents) {
          const updatedPurchases = nonTechParent.myPurchaseEvents.filter(
            (purchase) => purchase.eventId !== selectedEvent?.id
          );
          await _nonTechUserService.update(childData.userId, {
            ...nonTechParent,
            myPurchaseEvents: updatedPurchases,
          });
        } else {
          const regularParent = await _userService.getById(childData.userId);
          if (regularParent?.myPurchaseEvents) {
            const updatedPurchases = regularParent.myPurchaseEvents.filter(
              (purchase) => purchase.eventId !== selectedEvent?.id
            );
            await _userService.update(childData.userId, {
              ...regularParent,
              myPurchaseEvents: updatedPurchases,
            });
          }
        }
      }

      setChildren([...children, child]);
      setNewBookChildren(newBookChildren.filter((c) => c.id !== child.id));
      message.info(`${child.firstName}'s booking has been removed.`);
    } catch (error) {
      console.error("Failed to remove booking:", error);
      message.error(
        `Failed to remove ${child.firstName}'s booking. Please try again.`
      );
    }
  };

  const handleBookChildren = async () => {
    form.validateFields();
    if (!selectedEvent?.id || newBookChildren.length == 0 || !gcashRefNo)
      throw new Error("selectedEvent.id or newBookChildren must not null");
    await _bookingService.bookChildren(selectedEvent.id, newBookChildren);
    Promise.all(
      newBookChildren.map(async (n) => {
        await handleSaveToPurchase(n.id || "");
      })
    );

    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Children successfully booked",
      showConfirmButton: false,
      timer: 1500,
    });
    setIsOpen(false);
  };

  const availableChildrenColumns: ColumnConfig[] = [
    {
      title: "Parent",
      dataIndex: "parentName",
    },
    {
      title: "Name",
      dataIndex: "",
      render: (value: IChild) => `${value.lastName}, ${value.firstName}`,
    },
    {
      title: "Age",
      dataIndex: "age",
    },
    {
      title: "Action",
      dataIndex: "",
      render: (_: any, record: IChild) => (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleBookChild(record)}
        >
          Book
        </Button>
      ),
    },
  ];

  const bookedChildrenColumns: ColumnConfig[] = [
    {
      title: "Parent Name",
      dataIndex: "parentName",
    },
    {
      title: "Name",
      dataIndex: "",
      render: (value: IChild) => `${value.lastName}, ${value.firstName}`,
    },
    {
      title: "Age",
      dataIndex: "age",
    },
    {
      title: "Action",
      dataIndex: "",
      render: (child: IChildBook) => {
        if (child?.status == "New")
          return (
            <Button
              danger
              icon={<MinusOutlined />}
              onClick={() => handleRemoveBooking(child)}
            />
          );
        return "Current";
      },
    },
  ];

  return (
    <Modal
      open={isOpen}
      onOk={handleBookChildren}
      onCancel={() => setIsOpen(false)}
      okText="Book now"
      width={1500}
    >
      <Card>
        <div>
          <Card title="My Available Children">
            <DataTable
              columns={availableChildrenColumns}
              dataSource={children}
            />
          </Card>

          <Card title="My Booked Children">
            <DataTable
              columns={bookedChildrenColumns}
              dataSource={getAllBookedChildren()}
            />
            <Form form={form}>
              <Form.Item
                label="Gcash Reference number"
                name="gcashRefNo"
                rules={[
                  {
                    required: true,
                    message: "Gcash Reference No. is required",
                  },
                ]}
              >
                <Input
                  value={gcashRefNo}
                  onChange={(e) => setGcashRefNo(e.target.value)}
                />
              </Form.Item>
            </Form>
          </Card>
        </div>
      </Card>
    </Modal>
  );
}
