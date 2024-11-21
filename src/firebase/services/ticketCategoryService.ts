import ITicketCategory from "../../interfaces/firebase/ITicketCategory";
import ticketCategoryRepository from "../repositories/ticketCategoryRepository";
export default function ticketCategoryService() {
  const _ticketCategoryRepository = ticketCategoryRepository();

  const getAll = async () => {
    return await _ticketCategoryRepository.getAll();
  };

  const add = async (data: ITicketCategory) => {
    return await _ticketCategoryRepository.add(data);
  };

  const getById = async (id: string) => {
    try {
      return await _ticketCategoryRepository.getById(id);
    } catch (_e: any) {
      let e: Error = _e;
    }
  };

  const update = async (id: string, data: ITicketCategory) => {
    return await _ticketCategoryRepository.update(id, data);
  };
  const deleteById = async (id: string) => {
    await _ticketCategoryRepository.deleteById(id);
  };

  return {
    getAll,
    getById,
    add,
    update,
    deleteById,
  };
}
