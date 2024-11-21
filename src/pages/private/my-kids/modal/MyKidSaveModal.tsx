import {
  Badge,
  Button,
  Form,
  FormInstance,
  Input,
  Modal,
  Radio,
  Select,
} from "antd";
import FormGroupItems, {
  FormGroupItemsProps,
} from "../../../../components/FormControl";
import IChild from "../../../../interfaces/firebase/IChild";
import childrenService from "../../../../firebase/services/childrenService";
import useUserContext from "../../../../contexts/useUserContext";
import Swal from "sweetalert2";
import { useState } from "react";

interface MyKidSaveModalProps {
  form: FormInstance<any>;
  setSelectedChild: (value: React.SetStateAction<IChild | null>) => void;
  selectedChild: IChild | null;
  isOpen: boolean;
  refetch: () => void;
  setIsOpen: (value: React.SetStateAction<boolean>) => void;
}

export default function MyKidSaveModal(props: MyKidSaveModalProps) {
  const { form, setSelectedChild, selectedChild, isOpen, setIsOpen, refetch } =
    props;
  const _childrenService = childrenService();
  const { user } = useUserContext();
  const [hasFoodAllergies, setHasFoodAllergies] = useState<boolean>(false);

  const handleFormSubmit = async () => {
    if (!user?.uid) throw new Error("Must login first");
    const values = await form.validateFields();
    if (selectedChild && selectedChild.id) {
      await _childrenService.update(selectedChild.id, {
        ...selectedChild,
        ...values,
      });
    } else {
      await _childrenService.add(values, user.uid);
    }

    form.resetFields();
    setSelectedChild(null);
    refetch();
    setIsOpen(false);
    Swal.fire({
      icon: "success",
      title: "Kid successfully saved",
      showConfirmButton: false,
      timer: 1500,
    });
  };
  const formItems: FormGroupItemsProps[] = [
    {
      label: "First Name",
      name: "firstName",
      rules: [{ required: true, message: "Please input the first name!" }],
      component: <Input placeholder="First Name" className="w-full" />,
    },
    {
      label: "Last Name",
      name: "lastName",
      rules: [{ required: true, message: "Please input the last name!" }],
      component: <Input placeholder="Last Name" className="w-full" />,
    },
    {
      label: "Nickname",
      name: "nickname",
      rules: [{ required: true, message: "Please input the nickname!" }],
      component: <Input placeholder="Nickname" className="w-full" />,
    },
    {
      label: "Date of Birth",
      name: "birthday",
      rules: [{ required: true, message: "Please input the date of birth!" }],
      component: (
        <Input type="date" placeholder="Date of Birth" className="w-full" />
      ),
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
      component: <Input type="number" placeholder="Age" className="w-full" />,
    },
    {
      label: "Food Allergies",
      name: "hasFoodAllergies",
      rules: [{ required: true, message: "Please indicate food allergies!" }],
      component: (
        <Radio.Group
          onChange={(e) => {
            setHasFoodAllergies(e.target.value);
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
          required: selectedChild?.hasFoodAllergies ?? hasFoodAllergies,
          message: "Please list the food allergies!",
        },
      ],
      component: (
        <Input
          placeholder="Food Allergies"
          disabled={!hasFoodAllergies}
          className="w-full"
        />
      ),
    },
  ];

  return (
    <Modal
      title={selectedChild ? "Update Kid" : "Add Kid"}
      open={isOpen}
      onOk={handleFormSubmit}
      okText="Save"
      onCancel={() => {
        setIsOpen(false);
        form.resetFields();
        setSelectedChild(null);
      }}
    >
      <Form form={form} layout="vertical">
        {/* <p className="text-danger">{error}</p> */}
        <FormGroupItems
          items={formItems}
          //   items={selectedChild ? updateFromGroups : addFormGroups}
        />
      </Form>
    </Modal>
  );
}
