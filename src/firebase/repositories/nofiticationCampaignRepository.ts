import INofiticationCampaign from "../../interfaces/firebase/INofiticationCampaign";
import genericRepository from "./genericRepository";

export default function nofiticationCampaignRepository() {
  const _genericRepository = genericRepository<INofiticationCampaign>(
    "notificationCampaigns"
  );

  return {
    ..._genericRepository,
  };
}
