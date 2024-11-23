import { Button, Form, Input, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import accountService from "../../../firebase/services/accountService";

export default function ForgotPassword() {
  const _accountService = accountService();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const onFinish = async (values: { email: string }) => {
    try {
      setLoading(true);
      setError("");
      await _accountService.resetPassword(values.email);
      message.success("Password reset email sent. Please check your inbox.");
      navigate("/login");
    } catch (_e: any) {
      let e: Error = _e;
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="form-signin">
      <Form onFinish={onFinish}>
        <center>
          <h4 className="mb-3 fw-normal">Reset Password</h4>
          <p className="text-danger">{error}</p>
        </center>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Please input your email!" },
            { type: "email", message: "Please enter a valid email!" }
          ]}
        >
          <Input 
            type="email" 
            prefix={<UserOutlined />} 
            placeholder="Email" 
          />
        </Form.Item>

        <Button 
          type="primary" 
          className="w-100" 
          htmlType="submit"
          loading={loading}
        >
          Send Reset Link
        </Button>

        <p className="mt-3">
          Remember your password? <a href="/login">Back to Login</a>
        </p>
      </Form>
    </main>
  );
}