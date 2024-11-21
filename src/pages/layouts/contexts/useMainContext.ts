import { createContext, useContext } from "react";

export const MainContext = createContext<null | {
  isEmailVerified: boolean;
  setIsEmailVerified: React.Dispatch<React.SetStateAction<boolean>>;
}>(null);

export default function useMainContext() {
  const context = useContext(MainContext);
  if (!context) throw new Error("context must not empty");
  return context;
}
