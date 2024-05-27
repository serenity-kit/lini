export const formatDatetimeString = (datetimeString: string) => {
  return new Date(datetimeString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
};
