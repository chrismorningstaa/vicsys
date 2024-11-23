import { Button, Divider, Form, Input } from "antd";
import {
  UserOutlined,
  LockOutlined,
  GoogleOutlined
} from "@ant-design/icons";
import FormGroupItems, {
  FormGroupItemsProps,
} from "../../../components/FormControl";
import { IUserLogin } from "../../../interfaces/firebase/IUser";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import vicsys1 from "../../../assets/vicsys1.png";
import { useState } from "react";
import accountService from "../../../firebase/services/accountService";
import userService from "../../../firebase/services/userService";

const formGroupItems: FormGroupItemsProps[] = [
  {
    name: "email",
    rules: [{ required: true, message: "Please input the email!" }],
    component: (
      <Input type="email" prefix={<UserOutlined />} placeholder="Email" />
    ),
  },
  {
    name: "password",
    rules: [{ required: true, message: "Please input the password!" }],
    component: (
      <Input.Password prefix={<LockOutlined />} placeholder="Password" />
    ),
  },
];
export default function LogIn() {
  const _userService = userService();
  const _accountService = accountService();
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const onFinish = async (values: IUserLogin) => {
    try {
      setError("");
      await _accountService.login(values);

      navigate("/");
    } catch (_e: any) {
      let e: Error = _e;
      setError(e.message);
    }
  };
  const handleGoogleLogin = async () => {
    try {
      const newUser = await _accountService.loginWithGoogle();
      const resultUser = await _userService.getByEmail(newUser.email || "");

      if (!resultUser) {
        return location.assign("/signup");
      }
      location.assign("/");
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <>
      <main className="form-signin">
        <Form onFinish={onFinish}>
          <center>
            <img src={vicsys1} style={{ width: 300 }} />
            <h4 className=" mb-3 fw-normal">Login</h4>
            <p className="text-danger"> {error}</p>
          </center>
          <FormGroupItems items={formGroupItems} />

          <div className="forgot-password">
            <a href="/forgot-password">Forgot Password?</a>
          </div>
          <Button type="primary" className="w-100" htmlType="submit">
            Login
          </Button>
          <Divider
            style={{
              color: "#A0A0A0",
              fontSize: "10px",
              borderColor: "#A0A0A0",
            }}
            plain
          >
            or
          </Divider>
          <div className="social-login-buttons">
            <Button
              type="primary"
              style={{ backgroundColor: "#AC4D41" }}
              icon={<GoogleOutlined />}
              className="mb-2 w-100"
              onClick={handleGoogleLogin}
            >
              Login with Google
            </Button>        
          </div>
          <p>
            New here? <a href="signup"> Create an account.</a>
          </p>
          <br />
        </Form>
      </main>
      <p className="bottom">&copy;2024</p>
    </>
  );
}
