export default interface IChild {
  id?: string;
  userId?: string;
  firstName: string;
  lastName: string;
  nickname: string;
  dateOfBirth: string;
  gender: "Male" | "Female";
  age: number;
  hasFoodAllergies: boolean;
  foodAllergies: string;
  qrId: string;
}

export interface IChildWithParent extends IChild {
  parentName?: string;
}
export interface IChildWithParentAndStatus extends IChildWithParent {
  status?: string;
}
export enum ChildCategory {
  FamilyRoom = "Family Room",
  Preschool = "Preschool",
  Primary = "Primary",
  Preteens = "Preteens",
}
