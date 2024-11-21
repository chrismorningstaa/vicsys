import { Button, Form, Input, DatePicker, Card, Alert } from "antd";
import { useQuery } from "@tanstack/react-query";
import userService from "../../../firebase/services/userService";
import { useState } from "react";
import { AccountSettingContext } from "./useAccountSettingContext";
import ChangePasswordModal from "./modal/ChangePasswordModal";
import { IUserProvider, IUserPublic } from "../../../interfaces/firebase/IUser";
import PasswordConfirmationModal from "./modal/PasswordConfirmationModal";
import { auth } from "../../../firebase/firebaseConfig";
import Swal from "sweetalert2";
import useUserContext from "../../../contexts/useUserContext";
import moment from "moment";

export default function AccountSettingPage() {
  const _userService = userService();
  const { user } = useUserContext();
  const [form] = Form.useForm();
  const [newUserDetails, setNewUserDetails] = useState<IUserPublic | null>(
    null
  );
  const [isEmailChanged, setIsEmailChanged] = useState<boolean>(false);
  const [isShowAlert, setIsShowAlert] = useState<boolean>(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState<boolean>(false);
  const [isLoginConfirmationModalOpen, setIsLoginConfirmationModalOpen] =
    useState<boolean>(false);
  useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const user = await _userService.getUserLoggedIn();
      if (user) {
        const newUser = await _userService.getByEmail(user.email ?? "");
        console.log(newUser?.birthday);
        form.setFieldsValue({
          name: newUser?.name ?? user.displayName,
          email: user.email,
          birthday: newUser?.birthday ? moment(newUser?.birthday) : "",
        });
      }

      return user;
    },
  });

  const onFinish = async (values: IUserPublic) => {
    const newValue: IUserPublic = {
      ...values,
      birthday: new Date(values.birthday),
    };
    if (user?.provider != IUserProvider.password && user?.uid) {
      await _userService.add(newValue, user.uid);
      return Swal.fire({
        icon: "success",
        title: "Successfully updated",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    setIsLoginConfirmationModalOpen(true);
    setNewUserDetails(newValue);
  };
  if (!auth.currentUser?.emailVerified)
    return (
      <center>
        You cannot use this feature because your email is not verified.
      </center>
    );
  return (
    <AccountSettingContext.Provider
      value={{
        isChangePasswordModalOpen,
        setIsChangePasswordModalOpen,
        isLoginConfirmationModalOpen,
        setIsLoginConfirmationModalOpen,
        setIsShowAlert,
        newUserDetails,
        isEmailChanged,
      }}
    >
      {isShowAlert && (
        <Alert
          message="Verification Email Sent"
          description="Please check your inbox for the verification email."
          type="success"
          showIcon
          banner
          style={{ marginBottom: 16 }}
        />
      )}
      <ChangePasswordModal />
      <PasswordConfirmationModal />
      <Card
        title="Edit Account Settings"
        style={{ maxWidth: 600, margin: "auto" }}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {/* Name */}
          <Form.Item
            label="Name"
            name="name"
            rules={[
              { required: true, message: "Please enter your profile name" },
            ]}
          >
            <Input placeholder="Enter your profile name" />
          </Form.Item>

          {/* Email */}
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input
              placeholder="Enter your email"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (auth.currentUser?.email != e.target.value) {
                  setIsEmailChanged(true);
                }
              }}
            />
          </Form.Item>

          {/* Birthday */}
          <Form.Item
            label="Birthday"
            name="birthday"
            rules={[{ required: true, message: "Please select your birthday" }]}
          >
            <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
          </Form.Item>

          {/* Submit Buttons */}

          <Form.Item className="d-flex justify-content-end">
            {user?.provider == IUserProvider.password && (
              <Button
                type="primary"
                danger
                onClick={() => setIsChangePasswordModalOpen(true)}
              >
                Change Password
              </Button>
            )}
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </AccountSettingContext.Provider>
  );
}
