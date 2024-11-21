import { createContext, useContext } from "react";
import { IUserPublic } from "../../../interfaces/firebase/IUser";

interface IAccountSettingContext {
  isChangePasswordModalOpen: boolean;
  setIsChangePasswordModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isLoginConfirmationModalOpen: boolean;
  setIsLoginConfirmationModalOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  setIsShowAlert: React.Dispatch<React.SetStateAction<boolean>>;
  newUserDetails: IUserPublic | null;
  isEmailChanged: boolean;
}
export const AccountSettingContext =
  createContext<IAccountSettingContext | null>(null);

export default function useAccountSettingContext() {
  const context = useContext(AccountSettingContext);
  if (!context) throw new Error("AccountSettingContext must not null");
  return context;
}
