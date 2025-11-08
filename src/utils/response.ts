export const response = (success: boolean, status: number, message: string, dataCount: number, data: object) => {
  return {
    success: success,
    status: status,
    message: message,
    dataCount: dataCount,
    data: data
  };
};