import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import AppRoute from "./pages/routes/AppRoute";
import { UserContext } from "./contexts/useUserContext";
import { useEffect, useState } from "react";
import userService from "./firebase/services/userService";
import PageLoading from "./components/PageLoading";
import 'antd/dist/reset.css';
import { IUserDetails } from "./interfaces/firebase/IUser";
import { messaging, requestForToken } from "./firebase/firebaseConfig";
import { getToken } from "firebase/messaging";

const queryClient = new QueryClient();
function App() {
  const _userService = userService();
  const [user, setUser] = useState<IUserDetails | null>(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const getUserLoggedIn = async () => {
    const newUser = await _userService.getUserLoggedIn();
    setUser(newUser);
    setLoading(false);
  };
  const getToken = async () => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await requestForToken();
      if (token) {
        setToken(token);
      }
    }
  };

  useEffect(() => {
    getUserLoggedIn();
    getToken();
  }, []);

  if (loading) {
    return <PageLoading />;
  }
  return (
    <QueryClientProvider client={queryClient}>
      <UserContext.Provider value={{ user, setUser }}>
        <AppRoute />
      </UserContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
