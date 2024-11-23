export default interface INotificationCampaign {
  title: string;
  body: string;
  createdAt: string;
  sentAt: string | null;
  status: "sent" | "pending" | "failed";
  targetType: string;
  targetValue: string | null;
}
