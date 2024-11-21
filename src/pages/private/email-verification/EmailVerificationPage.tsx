import { useState, useEffect } from "react";
import { Button, Typography, Card, Alert } from "antd";
import { useNavigate } from "react-router-dom";
import { auth } from "../../../firebase/firebaseConfig";
import accountService from "../../../firebase/services/accountService";
import Swal from "sweetalert2";

const { Title, Text, Link } = Typography;

export default function EmailVerificationPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [user, setUser] = useState(auth.currentUser);

  const _accountService = accountService();
  useEffect(() => {
    setUser(auth.currentUser);
  }, []);

  const resendVerificationEmail = async () => {
    if (!user) {
      console.error("No user is logged in.");
      return;
    }

    setLoading(true);
    try {
      await _accountService.emailVerification();
      Swal.fire({
        icon: "success",
        title: `Verification email sent to: ${user.email} `,
        showConfirmButton: false,
        timer: 1500,
      });
      setEmailSent(true);
      setLoading(false);
    } catch (error) {
      console.error("Error sending email verification:", error);
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card style={{ maxWidth: 500, textAlign: "center" }}>
        <Title level={3}>Verify Your Email</Title>
        <Text>
          A verification email has been sent to your email address. Please check
          your inbox and click the link to verify your account.
        </Text>
        <br />
        <br />
        {!emailSent ? (
          <>
            <Text>
              If you didn’t receive the email, you can resend it below.
            </Text>
            <br />
            <Button
              type="primary"
              onClick={resendVerificationEmail}
              loading={loading}
              style={{ marginTop: 16 }}
            >
              Resend Verification Email
            </Button>
          </>
        ) : (
          <Alert
            message="Verification email resent"
            description={`A new verification email has been sent to ${user?.email}. Please check your inbox and follow the link to verify your email.`}
            type="success"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}

        <br />
        <br />
        <Link onClick={() => navigate("/")}>Back to Dashboard</Link>
      </Card>
    </div>
  );
}
