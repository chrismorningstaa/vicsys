import { IUser } from "../../../interfaces/firebase/IUser";
import FormGroupItems, {
  FormGroupItemsProps,
} from "../../../components/FormControl";
import { Badge, Button, Form, Input } from "antd";
import { useNavigate } from "react-router-dom";
import "./SignUp.css";
import vicsys1 from "../../../assets/vicsys1.png";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import accountService from "../../../firebase/services/accountService";
import childrenService from "../../../firebase/services/childrenService";
import useUserContext from "../../../contexts/useUserContext";
import { useForm } from "antd/es/form/Form";
import ChildrenModal, {
  useChildrenModal,
} from "../../../components/ChildrenModal";
import { Role } from "../../../interfaces/firebase/Role";

export default function SignUp() {
  const _accountService = accountService();
  const _childService = childrenService();
  const { user } = useUserContext();
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const {
    children,
    setChildren,
    isChildrenModalVisible,
    setIsChildrenModalVisible,
    childData,
    setChildData,
  } = useChildrenModal();
  const [form] = useForm();

  const formGroupItems: FormGroupItemsProps[] = [
    {
      name: "name",
      label: "Name",
      rules: [{ required: true, message: "Please input the name!" }],
      component: <Input placeholder="Name" />,
    },
    {
      name: "email",
      label: "Email",
      rules: [{ required: true, message: "Please input the email!" }],
      component: <Input type="email" placeholder="Email" disabled={!!user} />,
    },
    {
      name: "password",
      label: "Password",
      rules: [
        { required: true, message: "Please input the password!" },
        { min: 6, message: "Password should be at least 6 characters" },
      ],
      component: <Input.Password placeholder="Password" />,
    },
    {
      name: "birthday",
      label: "Birthday",
      rules: [{ required: true, message: "Please input the birthday!" }],
      component: <Input type="date" placeholder="Birthday" />,
    },
  ];

  const onFinish = async (data: IUser) => {
    try {
      setError("");
      const { uid } = await _accountService.signup({
        ...data,
        role: Role.Attendee,
      });
      if (children) {
        await _childService.addMany(uid, children);
      }

      Swal.fire({
        icon: "success",
        title: "Successfully signed up!",
        showConfirmButton: false,
        timer: 1500,
      });
      navigate("/login");
    } catch (_e: any) {
      const e: Error = _e;
      setError(e.message);
    }
  };
  useEffect(() => {
    if (user) {
      form.setFieldValue("email", user.email);
    }
  }, []);

  return (
    <div className="d-flex justify-content-between">
      <ChildrenModal
        isModalVisible={isChildrenModalVisible}
        setIsModalVisible={setIsChildrenModalVisible}
        setChildren={setChildren}
        childData={childData}
        children={children}
      />
      <div className="form-signin">
        <Form onFinish={onFinish} form={form}>
          <center>
            <img src={vicsys1} style={{ width: 300 }} />
            <h4 className="mb-3 fw-normal">Signup</h4>
            <p className="text-danger"> {error}</p>
          </center>

          <FormGroupItems items={formGroupItems} />
          <Badge count={children.length} color="blue" showZero>
            <Button
              onClick={() => {
                setIsChildrenModalVisible(true);
                setChildData({
                  firstName: "",
                  lastName: "",
                  nickname: "",
                  dateOfBirth: "",
                  gender: "Male",
                  age: 0,
                  hasFoodAllergies: false,
                  foodAllergies: "",
                });
              }}
            >
              Your Children
            </Button>
          </Badge>

          <div className="form-check text-start my-3">
            <input
              className="form-check-input"
              type="checkbox"
              value="remember-me"
              id="flexCheckDefault"
            />
            <label className="form-check-label">Remember me</label>
          </div>
          <button className="mb-3 btn btn-primary w-100" type="submit">
            Signup
          </button>
          <p>
            Already have an account? <a href="login"> Log in.</a>
          </p>
          <p className="mt-5 mb-3 text-body-secondary">&copy; Bentayarn 2024</p>
        </Form>
      </div>
    </div>
  );
}
