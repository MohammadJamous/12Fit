const isEmpty = (value) => {
  return value === undefined || value === null || String(value).trim() === "";
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isPositiveNumber = (value) => {
  return !isNaN(value) && Number(value) > 0;
};

const isValidRole = (role) => {
  return ["user", "admin"].includes(role);
};

module.exports = {
  isEmpty,
  isValidEmail,
  isPositiveNumber,
  isValidRole,
};