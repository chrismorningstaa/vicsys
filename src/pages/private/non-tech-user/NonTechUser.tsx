import { useQuery } from "@tanstack/react-query";
import nonTechUserService from "../../../firebase/services/nonTechUserService";
import { Button, Modal, Form, Input, message, Select } from "antd";
import { INonTechUser } from "../../../interfaces/firebase/INonTechUser";
import {
  BookOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import DataTable, { ColumnConfig } from "../../../components/DataTable";
import { FormGroupItemsProps } from "../../../components/FormControl";
import eventService from "../../../firebase/services/eventService";
import MyPurchaseEventCollapse from "../../../components/MyPurchaseEventCollapse";

import SaveNonTechModal from "./modal/SaveNonTechModal";
import ChildrenModal, {
  useChildrenModal,
} from "../../../components/ChildrenModal";
import childrenService from "../../../firebase/services/childrenService";
import Swal from "sweetalert2";
import AssignToEventModal from "./modal/AssignToEventModal";

const ministryOptions = [
  { value: "Victory Group Leaders", label: "Victory Group Leaders" },
  { value: "Ushering Ministry", label: "Ushering Ministry" },
  { value: "Music Ministry", label: "Music Ministry" },
  { value: "Kids Ministry", label: "Kids Ministry" },
  { value: "Stage Management", label: "Stage Management" },
  { value: "Technical Support", label: "Technical Support" },
  { value: "Communication", label: "Communication" },
  { value: "Prayer Ministry", label: "Prayer Ministry" },
  { value: "Admin Support", label: "Admin Support" },
  { value: "Real Life Coaches", label: "Real Life Coaches" },
  { value: "Special Project Teams", label: "Special Project teams" },
];

export default function NonTechUserPage() {
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState<boolean>(false);
  const [isOpenSaveModal, setIsOpenSaveModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<INonTechUser | null>(null);

  const [isOpenAssignEventModal, setIsOpenAssignEventModal] =
    useState<boolean>(false);

  const [error, setError] = useState<string>("");
  const [form] = Form.useForm();
  const _nonTechUserService = nonTechUserService();
  const _childrenService = childrenService();
  const _eventservice = eventService();
  const { data: nontechuser, refetch: refetchnontechuser } = useQuery({
    queryKey: ["nontechuser"],
    queryFn: async () => await _nonTechUserService.getAll(),
    initialData: [],
  });

  const { data: event, refetch: refetchevent } = useQuery({
    queryKey: ["events"],
    queryFn: async () => await _eventservice.getAll(),
    initialData: [],
  });

  const {
    children,
    setChildren,
    isChildrenModalVisible,
    setIsChildrenModalVisible,
    childData,
  } = useChildrenModal();
  useQuery({
    queryKey: ["nontechuser", selectedUser],
    queryFn: async () => {
      const result = await _childrenService.getByUserId(selectedUser?.id ?? "");
      setChildren(result);
      return result;
    },

    initialData: [],
  });

  const handleMinistryChange = async (value: string, userId: string) => {
    try {
      const currentUser = nontechuser.find((user) => user.id === userId);

      if (!currentUser) {
        throw new Error("User not found");
      }

      await _nonTechUserService.update(userId, {
        ...currentUser,
        ministry: value,
      });

      message.success("Ministry updated successfully");
      refetchnontechuser();
    } catch (error) {
      message.error("Failed to update ministry");
      console.error("Error updating ministry:", error);
    }
  };
  const addFormGroups: FormGroupItemsProps[] = [
    {
      name: "name",
      label: "Name",
      rules: [{ required: true, message: "Please input the name!" }],
      component: <Input />,
    },
    {
      name: "contact",
      label: "Contact",
      rules: [{ required: true, message: "Please input the contact!" }],
      component: <Input />,
    },
    {
      name: "age",
      label: "Age",
      rules: [{ required: true, message: "Please input the age!" }],
      component: <Input type="number" />,
    },
    {
      name: "email",
      label: "Email",
      rules: [{ required: true, message: "Please input the email!" }],
      component: <Input type="email" />,
    },
    {
      name: "password",
      label: "Password",
      rules: [
        { required: !selectedUser, message: "Please input the password!" },
        { min: 6, message: "Password should be at least 6 characters" },
      ],
      component: <Input type="password" />,
    },
    {
      name: "birthday",
      label: "Birthday",
      rules: [{ required: true, message: "Please input the birthday!" }],
      component: <Input type="date" />,
    },
    {
      name: "gender",
      label: "Gender",
      rules: [{ required: true, message: "Please input the gender!" }],
      component: (
        <Select placeholder="Select Gender">
          <Select.Option value="Male">Male</Select.Option>
          <Select.Option value="Female">Female</Select.Option>
        </Select>
      ),
    },
    {
      name: "ministry",
      label: "Ministry",
      rules: [{ required: true, message: "Please input the ministry!" }],
      component: (
        <Select placeholder="Select Ministry">
          <Select.Option value="Victory Group Leaders">
            Victory Group Leaders
          </Select.Option>
          <Select.Option value="Ushering Ministry">
            Ushering Ministry
          </Select.Option>
          <Select.Option value="Music Ministry">Music Ministry</Select.Option>
          <Select.Option value="Kids Ministry">Kids Ministry</Select.Option>
          <Select.Option value="Stage Management">
            Stage Management
          </Select.Option>
          <Select.Option value="Technical Support">
            Technical Support
          </Select.Option>
          <Select.Option value="Communication">Communication</Select.Option>
          <Select.Option value="Prayer Ministry">Prayer Ministry</Select.Option>
          <Select.Option value="Admin Support">Admin Support</Select.Option>
          <Select.Option value="Real Life Coaches">
            Real Life Coaches
          </Select.Option>
          <Select.Option value="Special Project Teams">
            Special Project teams
          </Select.Option>
        </Select>
      ),
    },
  ];
  const updateFromGroups: FormGroupItemsProps[] = addFormGroups.filter(
    (c) => c.name !== "password"
  );

  const columns: ColumnConfig[] = [
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Contact",
      dataIndex: "contact",
    },
    {
      title: "Age",
      dataIndex: "age",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Birthday",
      dataIndex: "birthday",
    },
    {
      title: "Gender",
      dataIndex: "gender",
    },
    {
      title: "Ministry",
      dataIndex: "ministry",
      render: (value: string, record: INonTechUser) => (
        <Select
          value={value}
          style={{ width: 180 }}
          onChange={(newValue) =>
            handleMinistryChange(newValue, record.id || "")
          }
        >
          {ministryOptions.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: "My Events",
      dataIndex: "",
      render: (data: INonTechUser) => (
        <MyPurchaseEventCollapse
          refetch={refetchnontechuser}
          userId={data.id ?? ""}
          purchaseEvents={data.myPurchaseEvents ?? []}
        />
      ),
    },
    {
      title: "Actions",
      dataIndex: "",
      render: (data: INonTechUser) => (
        <>
          <Button
            type="primary"
            danger
            shape="circle"
            icon={<DeleteOutlined />}
            onClick={() => {
              form.setFieldsValue(data);
              setSelectedUser(data);
              setIsOpenDeleteModal(true);
            }}
          />
          <Button
            type="primary"
            shape="circle"
            icon={<EditOutlined />}
            style={{ marginLeft: 8 }}
            onClick={() => {
              form.setFieldsValue(data);
              setSelectedUser(data);
              setIsOpenSaveModal(true);
            }}
          />
          <Button
            type="primary"
            shape="circle"
            icon={<BookOutlined />}
            style={{
              marginLeft: 8,
              backgroundColor: "#52c41a",
              borderColor: "#52c41a",
            }}
            onClick={() => {
              setSelectedUser(data);
              setIsOpenAssignEventModal(true);
            }}
          />
        </>
      ),
    },
  ];

  const handleSaveUser = async (values: INonTechUser) => {
    setError("");
    try {
      if (selectedUser) {
        await _nonTechUserService.update(selectedUser.id || "", values);
        await _childrenService.updateManyByUserId(
          selectedUser.id || "",
          children
        );
      } else {
        await _nonTechUserService.add(values);
      }
      Swal.fire({
        icon: "success",
        title: "User successfully saved!",
        showConfirmButton: false,
        timer: 1500,
      });
      refetchnontechuser();
      setIsOpenSaveModal(false);
    } catch (_e: any) {
      let e: Error = _e;
      setError(e.message);
      throw new Error(e.message);
    }
  };

  const DeleteModalConfirmation = () => (
    <Modal
      title="Are you sure you want to delete?"
      open={isOpenDeleteModal}
      onOk={async () => {
        await _nonTechUserService.deleteById(selectedUser?.id || "");
        refetchnontechuser();
        setIsOpenDeleteModal(false);
      }}
      onCancel={() => setIsOpenDeleteModal(false)}
    >
      <p>Email: {selectedUser?.email}</p>
    </Modal>
  );
  return (
    <>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        style={{ marginBottom: 16 }}
        onClick={() => {
          setIsOpenSaveModal(true);
          setSelectedUser(null);
        }}
      >
        Add User
      </Button>
      <DeleteModalConfirmation />
      <SaveNonTechModal
        form={form}
        handleSave={handleSaveUser}
        setSelectedUser={setSelectedUser}
        selectedUser={selectedUser}
        isOpenSaveModal={isOpenSaveModal}
        setIsOpenSaveModal={setIsOpenSaveModal}
        setIsChildrenModalVisible={setIsChildrenModalVisible}
        updateFromGroups={updateFromGroups}
        addFormGroups={addFormGroups}
        children={children}
        error={error}
      />
      <ChildrenModal
        children={children}
        setChildren={setChildren}
        isModalVisible={isChildrenModalVisible}
        setIsModalVisible={setIsChildrenModalVisible}
        childData={childData}
      />
      <AssignToEventModal
        selectedUser={selectedUser}
        refetchnontechuser={refetchnontechuser}
        refetchevent={refetchevent}
        isOpenAssignEventModal={isOpenAssignEventModal}
        setIsOpenAssignEventModal={setIsOpenAssignEventModal}
        event={event}
      />
      <DataTable dataSource={nontechuser} columns={columns} />
    </>
  );
}
