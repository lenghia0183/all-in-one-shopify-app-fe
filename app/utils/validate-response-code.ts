import { ResponseCodeEnum } from "app/constants/response-code";

const validateResponseCode = (code: ResponseCodeEnum) => {
  if ([ResponseCodeEnum.SUCCESS, ResponseCodeEnum.CREATED].includes(code)) {
    return true;
  }
  return false;
};
export default validateResponseCode;
