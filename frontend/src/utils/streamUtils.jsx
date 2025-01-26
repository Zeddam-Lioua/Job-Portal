export const formatStreamUserId = (email) => {
  return email.replace(/[^a-z0-9@_-]/gi, "_").toLowerCase();
};
