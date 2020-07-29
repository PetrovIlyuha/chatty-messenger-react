export const formatDate = (data) => {
  const date = new Date(data.createdDate);
  const dateFormatted = `${
    date.getMonth() + 1
  }/${date.getDate()}/${date.getFullYear()}`;
  return dateFormatted;
};
