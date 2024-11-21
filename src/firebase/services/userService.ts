import { onAuthStateChanged } from "firebase/auth";
import { IUserDetails, IUserPublic } from "../../interfaces/firebase/IUser";
import userRepository from "../repositories/userRepository";
import { auth } from "../firebaseConfig";
import accountRepository from "../repositories/accountRepository";
import { Role } from "../../interfaces/firebase/Role";
import IPieValue from "../../interfaces/components/IPieValue";
import { IMyPuchaseEvent } from "../../interfaces/firebase/INonTechUser";
import nonTechUserRepository from "../repositories/nonTechUserRepository";
import eventRepository from "../repositories/eventRepository";

export default function userService() {
  const _accountRepository = accountRepository();
  const _userRepository = userRepository();
  const _eventRepository = eventRepository();
  const _nonTechUserRepository = nonTechUserRepository();

  const getAll = async () => {
    return await _userRepository.getAll();
  };
  const getById = async (id: string) => {
    return await _userRepository.getById(id);
  };
  const update = async (id: string, data: IUserPublic) => {
    return await _userRepository.update(id, data);
  };
  const deleteById = async (id: string) => {
    await _userRepository.deleteById(id);
  };
  const getUserLocalStorage = (): IUserPublic | null => {
    const user = localStorage.getItem("user");
    return user ? (JSON.parse(user) as IUserPublic) : null;
  };
  const getUserLoggedIn = async (): Promise<IUserDetails | null> => {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (user) => {
        const provider = await _accountRepository.getUserProvider();
        if (user && provider) {
          resolve({ ...user, provider: provider });
        } else {
          resolve(null);
        }
      });
    });
  };
  const getTotalUsers = async () => {
    const users = await _userRepository.getAll();
    return users.length;
  };
  const getByEmail = async (email: string) => {
    return await _userRepository.getUserByEmail(email);
  };
  const add = async (user: IUserPublic, uid: string) => {
    return await _userRepository.add(user, uid);
  };

  const getUserRolePieChart = async (): Promise<IPieValue[]> => {
    const users = await _userRepository.getAll();
    const adminCount = users.filter((u) => u.role == Role.Admin).length;
    const attendeeCount = users.filter((u) => u.role == Role.Attendee).length;
    const volunteerCount = users.filter((u) => u.role == Role.Volunteer).length;

    const result: IPieValue[] = [
      { type: Role.Admin, value: adminCount },
      { type: Role.Attendee, value: attendeeCount },
      { type: Role.Volunteer, value: volunteerCount },
    ];

    return result;
  };
  const addMyPurchaseEvents = async (
    userId: string,
    myPurchaseEvent: IMyPuchaseEvent
  ): Promise<void> => {
    await _userRepository.addMyPurchaseEvents(userId, myPurchaseEvent);
  };
  const getPurchasesByEventId = async (eventId: string) => {
    return await _userRepository.getPurchasesByEventId(eventId);
  };

  const updateUserPurchaseEvent = async (
    userId: string,
    purchaseEventId: string,
    updatedData: IMyPuchaseEvent
  ) => {
    let user = null;
    let isNontechUser = false;
    user = await _userRepository.getById(userId);

    await _eventRepository.updateTicketRemainingAndSold(userId, updatedData);

    if (!user) {
      isNontechUser = true;
      user = await _nonTechUserRepository.getById(userId);
    }

    const updatedPurchaseEvents = user?.myPurchaseEvents?.map((m) => {
      if (m.ticketId == purchaseEventId) return updatedData;
      return m;
    });

    if (isNontechUser)
      return await _nonTechUserRepository.update(userId, {
        ...user,
        myPurchaseEvents: updatedPurchaseEvents,
      });

    return await _userRepository.update(userId, {
      ...user,
      myPurchaseEvents: updatedPurchaseEvents,
    });
  };

  return {
    updateUserPurchaseEvent,
    getPurchasesByEventId,
    addMyPurchaseEvents,
    getUserRolePieChart,
    add,
    getByEmail,
    getTotalUsers,
    getUserLoggedIn,
    getUserLocalStorage,
    getAll,
    getById,
    update,
    deleteById,
  };
}
