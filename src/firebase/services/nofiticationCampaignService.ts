import INofiticationCampaign from "../../interfaces/firebase/INofiticationCampaign";
import nofiticationCampaignRepository from "../repositories/nofiticationCampaignRepository";

export default function nofiticationCampaignService() {
  const _nofiticationCampaignRepository = nofiticationCampaignRepository();

  const add = async (data: INofiticationCampaign) => {
    try {
      await _nofiticationCampaignRepository.add(data);
    } catch (ex: any) {
      let e: Error = ex;
      console.log(e);
    }
  };

  return {
    add,
  };
}
