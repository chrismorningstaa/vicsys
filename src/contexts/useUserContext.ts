import { createContext, useContext } from "react";
import { IUserDetails } from "../interfaces/firebase/IUser";

export const UserContext = createContext<null | {
  user: IUserDetails | null;
  setUser: React.Dispatch<React.SetStateAction<IUserDetails | null>>;
}>(null);

export default function useUserContext() {
  const user = useContext(UserContext);
  if (!user) throw new Error("context must not empty");
  return user;
}
