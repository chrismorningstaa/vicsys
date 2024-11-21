import { Modal, Form, Input } from "antd";
import useAccountSettingContext from "../useAccountSettingContext";
import accountService from "../../../../firebase/services/accountService";
import { IUserChangePassword } from "../../../../interfaces/firebase/IUser";
import { useState } from "react";

export default function ChangePasswordModal() {
  const { setIsChangePasswordModalOpen, isChangePasswordModalOpen } =
    useAccountSettingContext();
  const _accountService = accountService();
  const [form] = Form.useForm();
  const [error, setError] = useState<string>("");
  const handleOk = () => {
    try {
      form
        .validateFields()
        .then(async (values: IUserChangePassword) => {
          await _accountService.changePassword(values);
          // setIsChangePasswordModalOpen(false);
          // form.resetFields();
        })
        .catch((_e: any) => {
          let e: Error = _e;
          setError(e.message);
        });
    } catch (_e: any) {
      let e: Error = _e;
      setError(e.message);
    }
  };

  const handleCancel = () => {
    setIsChangePasswordModalOpen(false);
    form.resetFields();
  };

  return (
    <>
      <Modal
        title="Change Password"
        open={isChangePasswordModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Change Password"
      >
        <p className="text-danger">{error}</p>
        <Form form={form} layout="vertical">
          {/* Current Password */}
          <Form.Item
            label="Current Password"
            name="currentPassword"
            rules={[
              { required: true, message: "Please enter your current password" },
            ]}
          >
            <Input.Password placeholder="Enter current password" />
          </Form.Item>

          {/* New Password */}
          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: "Please enter a new password" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>

          {/* Retype New Password */}
          <Form.Item
            label="Retype New Password"
            name="confirmPassword"
            dependencies={["newPassword"]}
            hasFeedback
            rules={[
              { required: true, message: "Please confirm your new password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("The two passwords do not match!")
                  );
                },
              }),
            ]}
          >
            <Input.Password placeholder="Retype new password" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
