import { useEffect, useState } from "react";
import { Modal, Form, Input } from "antd";
import useAccountSettingContext from "../useAccountSettingContext";
import FormGroupItems, {
  FormGroupItemsProps,
} from "../../../../components/FormControl";
import { LockOutlined } from "@ant-design/icons";
import accountService from "../../../../firebase/services/accountService";
import { auth } from "../../../../firebase/firebaseConfig";
import { useForm } from "antd/es/form/Form";
import Swal from "sweetalert2";

const PasswordConfirmationModal = () => {
  const {
    isLoginConfirmationModalOpen,
    setIsLoginConfirmationModalOpen,
    newUserDetails,
    isEmailChanged,
    setIsShowAlert,
  } = useAccountSettingContext();
  const [form] = useForm();
  const formGroupItems: FormGroupItemsProps[] = [
    {
      name: "password",
      rules: [{ required: true, message: "Please input the password!" }],
      component: (
        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
      ),
    },
  ];

  const _accountService = accountService();
  const [error, setError] = useState<string>("");
  useEffect(() => {
    form.resetFields();
  }, [isLoginConfirmationModalOpen]);
  const onFinish = async (values: any) => {
    const email = auth.currentUser?.email;
    try {
      if (newUserDetails && email) {
        setError("");
        await _accountService.login({ email, password: values?.password });
        await _accountService.profileUpdate(newUserDetails);
        Swal.fire({
          icon: "success",
          title: isEmailChanged
            ? "Verification Email Sent"
            : "Successfully updated",
          showConfirmButton: false,
          timer: 1500,
        });
        setIsShowAlert(isEmailChanged);
        setIsLoginConfirmationModalOpen(false);
      }
    } catch (_e: any) {
      let e: Error = _e;
      setError(e.message);
    }
  };

  return (
    <Modal
      title="Confirm your password"
      visible={isLoginConfirmationModalOpen}
      onCancel={() => setIsLoginConfirmationModalOpen(false)}
      footer={null}
    >
      <p className="text-danger">{error}</p>
      <Form onFinish={onFinish} form={form}>
        <FormGroupItems items={formGroupItems} />

        <button className="mb-3 btn btn-primary w-100" type="submit">
          Confirm
        </button>

        <br />
      </Form>
    </Modal>
  );
};

export default PasswordConfirmationModal;
