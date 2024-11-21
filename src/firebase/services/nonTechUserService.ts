import {
  INonTechUser,
  INonTechUserPublic,
} from "../../interfaces/firebase/INonTechUser";
import nonTechUserRepository from "../repositories/nonTechUserRepository";
export default function nonTechUserService() {
  const _nonTechUserRepository = nonTechUserRepository();

  const getAll = async () => {
    return await _nonTechUserRepository.getAll();
  };

  const add = async (data: INonTechUser) => {
    const { email } = data;

    const isEmailExisted = await _nonTechUserRepository.isEmailExisted(email);
    if (isEmailExisted)
      throw new Error(
        "Email already in use. Try logging in or use a different email to sign up."
      );
    return await _nonTechUserRepository.add(data);
  };

  const getById = async (id: string) => {
    return await _nonTechUserRepository.getById(id);
  };

  const update = async (id: string, data: INonTechUser) => {
    return await _nonTechUserRepository.update(id, data);
  };
  const deleteById = async (id: string) => {
    await _nonTechUserRepository.deleteById(id);
  };
  const getUserLocalStorage = (): INonTechUserPublic | null => {
    const nontechuser = localStorage.getItem("nontechusers");
    return nontechuser ? (JSON.parse(nontechuser) as INonTechUserPublic) : null;
  };
  return {
    getUserLocalStorage,
    getAll,
    getById,
    add,
    update,
    deleteById,
  };
}
