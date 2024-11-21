import { createContext, useContext } from "react";

export const SidebarContext = createContext<null | {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}>(null);

export default function useSidebarContext() {
  const sidebar = useContext(SidebarContext);
  if (!sidebar) throw new Error("context must not empty");
  return sidebar;
}
