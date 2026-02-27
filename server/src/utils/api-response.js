// server/src/utils/apiResponse.js

const success = (message, data = null) => {
  return {
    success: true,
    message,
    data,
  };
};

const error = (message, error = null) => {
  return {
    success: false,
    message,
    error,
  };
};

export default {
  success,
  error,
};