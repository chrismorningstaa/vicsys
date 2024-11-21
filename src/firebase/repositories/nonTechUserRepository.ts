import { INonTechUser } from "../../interfaces/firebase/INonTechUser";
import genericRepository from "./genericRepository";

export default function nonTechUserRepository() {
  const _genericRepository = genericRepository<INonTechUser>("nontechusers");
  const isEmailExisted = async (email: string) => {
    const users = await _genericRepository.getAll();
    return !!users.find((u) => u.email == email);
  };
  return {
    ..._genericRepository,
    isEmailExisted,
  };
}
