import ITicketCategory from "../../interfaces/firebase/ITicketCategory";
import genericRepository from "./genericRepository";

export default function ticketCategoryRepository() {
  const _genericRepository =
    genericRepository<ITicketCategory>("ticketCategories");
  return {
    ..._genericRepository,
  };
}
