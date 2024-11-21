import { createContext, useContext } from "react";
import { IEvent } from "../../../interfaces/firebase/IEvent";

interface IEventContext {
  selectedEvent: IEvent | null;
  setSelectedEvent: React.Dispatch<React.SetStateAction<IEvent | null>>;
  isSaveModalOpen: boolean;
  setIsSaveModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  imageUpload: File | null;
  setImageUpload: React.Dispatch<React.SetStateAction<File | null>>;
  handleDeleteConfirmation: () => void;
  refetch: () => void;
}

export const EventContext = createContext<IEventContext | null>(null);

export default function useEventContext() {
  const context = useContext(EventContext);
  if (!context) throw new Error("Event Context must not null");
  return context;
}
