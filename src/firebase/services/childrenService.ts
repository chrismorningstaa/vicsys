import childrenRepository from "../repositories/childrenRepository";
import IChild, {
  ChildCategory,
  IChildWithParent,
} from "../../interfaces/firebase/IChild";
import IPieValue from "../../interfaces/components/IPieValue";
import userRepository from "../repositories/userRepository";
import nonTechUserRepository from "../repositories/nonTechUserRepository";
import eventRepository from "../repositories/eventRepository";

export default function childrenService() {
  const _childrenRepository = childrenRepository();
  const _userRepository = userRepository();
  const _nontechRepository = nonTechUserRepository();
  const _eventRepository = eventRepository();
  const getAll = async () => {
    const children = await _childrenRepository.getAll();
    const result = await Promise.all(
      children.map(async (c) => {
        let user;
        if (c.userId) {
          user = await _userRepository.getById(c.userId);
          if (!user) {
            user = await _nontechRepository.getById(c.userId);
          }
        }
        return {
          parentName: user?.name,
          ...c,
        };
      })
    );
    result.sort((a, b) => {
      if (!a.parentName || !b.parentName) return 0;
      if (a.parentName < b.parentName) return -1;
      if (a.parentName > b.parentName) return 1;
      return 0;
    });
    console.log(result);
    return result;
  };

  const addMany = async (userId: string, data: IChild[]) => {
    return await _childrenRepository.addMany(userId, data);
  };
  const getByUserId = async (userId: string) => {
    return await _childrenRepository.getByUserId(userId);
  };

  const getById = async (id: string) => {
    return await _childrenRepository.getById(id);
  };

  const update = async (id: string, data: IChild) => {
    return await _childrenRepository.update(id, data);
  };

  const updateManyByUserId = async (userId: string, data: IChild[]) => {
    await _childrenRepository.deleteManyByUserId(userId);
    return await _childrenRepository.addMany(userId, data);
  };
  const deleteById = async (id: string) => {
    await _childrenRepository.deleteById(id);
  };
  const add = async (data: IChild, userId?: string) => {
    if (userId) return await _childrenRepository.add({ ...data, userId });
    return await _childrenRepository.add(data);
  };
  const getTotalChildren = async () => {
    const children = await _childrenRepository.getAll();
    return children.length;
  };

  const getChildrenCategoryPieChart = async (): Promise<IPieValue[]> => {
    const children = await _childrenRepository.getAll();
    const familyRoom = children.filter((c) => c.age >= 0 && c.age <= 3).length;
    const preschool = children.filter((c) => c.age >= 4 && c.age <= 6).length;
    const primary = children.filter((c) => c.age >= 7 && c.age <= 9).length;
    const preteens = children.filter((c) => c.age >= 10 && c.age <= 12).length;

    const result: IPieValue[] = [
      { type: ChildCategory.FamilyRoom, value: familyRoom },
      { type: ChildCategory.Preschool, value: preschool },
      { type: ChildCategory.Primary, value: primary },
      { type: ChildCategory.Preteens, value: preteens },
    ];

    return result;
  };

  const getByEventId = async (eventId: string) => {
    const event = await _eventRepository.getById(eventId);

    if (!event) throw new Error("Can't find event");

    let result: IChildWithParent[] = [];
    await Promise.all(
      event?.childrenAttendees.map(async ({ childId }) => {
        const child = await _childrenRepository.getById(childId);
        if (!child) return;
        let user;
        user = await _userRepository.getById(child.userId ?? "");
        if (!user) user = await _nontechRepository.getById(child.userId ?? "");
        result = [...result, { ...child, parentName: user?.name ?? "" }];
      })
    );

    return result;
  };

  return {
    getByEventId,
    getChildrenCategoryPieChart,
    getTotalChildren,
    updateManyByUserId,
    getByUserId,
    getAll,
    getById,
    addMany,
    update,
    deleteById,
    add,
  };
}
