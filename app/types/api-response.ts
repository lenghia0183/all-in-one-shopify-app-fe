import { ErrorCodeEnum, ResponseCodeEnum } from "app/constants/response-code";
import { AxiosError } from "axios";

export interface Meta {
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface ApiResponse<T> {
  statusCode: ResponseCodeEnum;
  data?: T;
  errorDetails?: AxiosError;
  message: string;
  errorCode?: ErrorCodeEnum;
}
