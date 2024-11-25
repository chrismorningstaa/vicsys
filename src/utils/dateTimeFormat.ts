import moment, { Moment } from "moment";

export const convertUnixToDateText = (date: any): string => {
  return new Date(date?.seconds * 1000).toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};
export const convertUnixToDateOnlyText = (date: any): string => {
  return moment(date?.seconds * 1000).format("YYYY-MM-DDThh:mm");
};
export const convertUnixToTimeText = (date: any): string => {
  return new Date(date?.seconds * 1000).toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const convertUnixToDate = (date: any): Moment => {
  return moment.unix(date?.seconds);
};
