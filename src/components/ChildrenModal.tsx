import { Button, Form, Input, Modal, Radio } from "antd";
import { useForm } from "antd/es/form/Form";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import IChild from "../interfaces/firebase/IChild";
import FormGroupItems, { FormGroupItemsProps } from "./FormControl";
import DataTable, { ColumnConfig } from "./DataTable";
import { useState } from "react";

type AddChildModalProps = {
  isModalVisible: boolean;
  setIsModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setChildren: React.Dispatch<React.SetStateAction<IChild[]>>;
  childData: IChild;
  children: IChild[];
};

export function useChildrenModal() {
  const [children, setChildren] = useState<IChild[]>([]);
  const [isChildrenModalVisible, setIsChildrenModalVisible] = useState(false);
  const [childData, setChildData] = useState<IChild>({
    firstName: "",
    lastName: "",
    nickname: "",
    dateOfBirth: "",
    gender: "Male",
    age: 0,
    hasFoodAllergies: false,
    foodAllergies: "",
    qrId: "",
  });

  return {
    children,
    setChildren,
    isChildrenModalVisible,
    setIsChildrenModalVisible,
    childData,
    setChildData,
  };
}

export default function ChildrenModal(props: AddChildModalProps) {
  const {
    isModalVisible,
    setChildren,
    childData,
    children,
    setIsModalVisible,
  } = props;

  const [child, setChild] = useState<IChild>(childData);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form] = useForm();

  const handleEditChild = (child: IChild, index: number) => {
    setChild(child);
    setEditingIndex(index);
    form.setFieldsValue(child);
    setIsEditing(true);
    setIsModalVisible(true);
  };

  const handleRemoveChild = (index: number) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  const childFormGroupItems: FormGroupItemsProps[] = [
    {
      label: "First Name",
      name: "firstName",
      rules: [{ required: true, message: "Please input the first name!" }],
      component: <Input placeholder="First Name" />,
    },
    {
      label: "Last Name",
      name: "lastName",
      rules: [{ required: true, message: "Please input the last name!" }],
      component: <Input placeholder="Last Name" />,
    },
    {
      label: "Nickname",
      name: "nickname",
      rules: [{ required: true, message: "Please input the nickname!" }],
      component: <Input placeholder="Nickname" />,
    },
    {
      label: "Date of Birth",
      name: "birthday",
      rules: [{ required: true, message: "Please input the date of birth!" }],
      component: <Input type="date" placeholder="Date of Birth" />,
    },
    {
      label: "Gender",
      name: "gender",
      rules: [{ required: true, message: "Please select the gender!" }],
      component: (
        <Radio.Group>
          <Radio value="Male">Male</Radio>
          <Radio value="Female">Female</Radio>
        </Radio.Group>
      ),
    },
    {
      label: "Age",
      name: "age",
      rules: [{ required: true, message: "Please input the age!" }],
      component: <Input type="number" placeholder="Age" />,
    },
    {
      label: "Food Allergies",
      name: "hasFoodAllergies",
      rules: [{ required: true, message: "Please indicate food allergies!" }],
      component: (
        <Radio.Group
          onChange={(e) => {
            setChild((prev) => ({
              ...prev,
              hasFoodAllergies: e.target.value,
            }));
            form.validateFields(["foodAllergies"]);
          }}
        >
          <Radio value={true}>Yes</Radio>
          <Radio value={false}>No</Radio>
        </Radio.Group>
      ),
    },
    {
      label: "List of Food Allergies",
      name: "foodAllergies",
      rules: [
        {
          required: false,
          message: "Please list the food allergies!",
          validator: (_, value) => {
            const hasAllergies = form.getFieldValue("hasFoodAllergies");
            if (hasAllergies && !value) {
              return Promise.reject(
                new Error("Please list the food allergies!")
              );
            }
            return Promise.resolve();
          },
        },
      ],
      component: (
        <Input
          placeholder="Food Allergies"
          disabled={!form.getFieldValue("hasFoodAllergies")}
        />
      ),
    },
  ];

  const onOk = async () => {
    const values: IChild = await form.validateFields();
    const modifiedValues = {
      ...values,
      foodAllergies: values.foodAllergies ?? "",
    };
    if (isEditing && editingIndex !== null) {
      setChildren((prev) =>
        prev.map((child, index) =>
          index === editingIndex ? modifiedValues : child
        )
      );
    } else {
      setChildren((prev) => [...prev, modifiedValues]);
    }
    form.resetFields();
    setIsEditing(false);
    setEditingIndex(null);
  };

  const columns: ColumnConfig[] = [
    {
      title: "Name",
      dataIndex: "",
      render: (data: IChild) => (
        <>
          {data.lastName}, {data.firstName}
        </>
      ),
    },
    {
      title: "Age",
      dataIndex: "age",
    },
    {
      title: "Gender",
      dataIndex: "gender",
    },
    {
      title: "Birthday",
      dataIndex: "birthday",
    },
    {
      title: "Food Allergies",
      dataIndex: "hasFoodAllergies",
      render: (hasFoodAllergies: boolean) => (
        <>
          {hasFoodAllergies ? (
            <CheckCircleOutlined style={{ color: "green" }} />
          ) : (
            <CloseCircleOutlined style={{ color: "red" }} />
          )}
        </>
      ),
    },
    {
      title: "Actions",
      dataIndex: "",
      render: (data: IChild, _: any, index: number) => (
        <>
          <Button type="link" onClick={() => handleEditChild(data, index)}>
            Edit
          </Button>
          <Button type="link" danger onClick={() => handleRemoveChild(index)}>
            Remove
          </Button>
        </>
      ),
    },
  ];

  return (
    <Modal
      title="Children"
      width={1200}
      visible={isModalVisible}
      okText={isEditing ? "Update" : "Add"}
      onOk={onOk}
      onCancel={() => {
        setIsEditing(false);
        setEditingIndex(null);
        setIsModalVisible(false);
      }}
    >
      <div className="d-flex justify-content-center gap-5">
        <DataTable
          columns={columns}
          dataSource={children}
          style={{ width: 700 }}
        />
        <Form layout="vertical" style={{ width: 400 }} form={form}>
          <FormGroupItems items={childFormGroupItems} />
        </Form>
      </div>
    </Modal>
  );
}
