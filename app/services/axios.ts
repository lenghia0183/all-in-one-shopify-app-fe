import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
  AxiosResponse,
  AxiosHeaders,
  isAxiosError,
} from "axios";

import { ApiResponse } from "app/types/api-response";

const BASE_URL = process.env.BACKEND_API_BASE_URL || "";

const isDevelopment = process.env.NODE_ENV === "development";

const HEADERS_MULTIPLE_PART = {
  "Content-Type": "multipart/form-data; boundary=something",
};

// --- Tạo Axios instance ---
export const createInstance = (
  baseURL: string,
  customHeaders: Record<string, string> = {},
  useToken = true,
): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Access-Control-Allow-Origin": "*",
      ...customHeaders,
    },
  });

  // request interceptor chỉ thêm token nếu useToken = true
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      let token: string | undefined;
      let locale: string | undefined;

      if (locale) {
        config.headers = AxiosHeaders.from(config.headers || {});
        config.headers.set("x-lang", locale);
      }

      if (token) {
        config.headers = AxiosHeaders.from(config.headers || {});
        if (useToken) {
          config.headers.set("Authorization", `Bearer ${token}`);
        }
      }

      return config;
    },
    (error: AxiosError) => Promise.reject(error),
  );

  // response interceptor: refresh token nếu 401
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response.status >= 200 && response.status < 300
        ? response.data
        : Promise.reject(response);
    },
    async (error: AxiosError) => {
      return Promise.reject(error);
    },
  );

  return instance;
};

// --- Xử lý lỗi ---
const handleAxiosError = <T>(err: unknown): ApiResponse<T> => {
  if (isAxiosError(err)) {
    return {
      statusCode: err.response?.data?.code || err.response?.status || 500,
      message: err.response?.data?.message || err.message,
      errorCode: err.response?.data?.errorCode,
      ...(isDevelopment ? { errorDetails: err } : {}),
    };
  }
  throw err;
};

// --- Tạo API wrapper ---
export const createApi = (instance: AxiosInstance) => ({
  instance,

  post: async <T, Body = Record<string, unknown>>(
    endpoint: string,
    body: Body,
  ): Promise<ApiResponse<T>> => {
    try {
      return await instance.post(endpoint, body);
    } catch (err: unknown) {
      return handleAxiosError(err);
    }
  },

  postMultiplePart: async <T>(
    endpoint: string,
    params: Record<string, unknown>,
  ): Promise<ApiResponse<T>> => {
    try {
      return await instance.post(endpoint, params, {
        headers: HEADERS_MULTIPLE_PART,
      });
    } catch (err: unknown) {
      return handleAxiosError(err);
    }
  },

  putMultiplePart: async <T>(
    endpoint: string,
    params: Record<string, unknown> | FormData,
  ): Promise<ApiResponse<T>> => {
    try {
      return await instance.put(endpoint, params, {
        headers: HEADERS_MULTIPLE_PART,
      });
    } catch (err: unknown) {
      return handleAxiosError(err);
    }
  },

  get: async <T, Params = unknown>(
    endpoint: string,
    params?: Params,
    options: Record<string, string> = {},
  ): Promise<ApiResponse<T>> => {
    try {
      return await instance.get(endpoint, {
        params,
        ...options,
      });
    } catch (err: unknown) {
      return handleAxiosError(err);
    }
  },

  put: async <T, Params>(
    endpoint: string,
    params: Params,
  ): Promise<ApiResponse<T>> => {
    try {
      return await instance.put(endpoint, params);
    } catch (err: unknown) {
      return handleAxiosError(err);
    }
  },

  patch: async <T, Params>(
    endpoint: string,
    params: Params,
  ): Promise<ApiResponse<T>> => {
    try {
      return await instance.patch(endpoint, params);
    } catch (err: unknown) {
      return handleAxiosError(err);
    }
  },

  delete: async <T, Params = Record<string, unknown>>(
    endpoint: string,
    params?: Params,
  ): Promise<ApiResponse<T>> => {
    try {
      return await instance.delete(endpoint, { data: params });
    } catch (err: unknown) {
      return handleAxiosError(err);
    }
  },
});

// --- Tạo instance ---
const instance = createInstance(BASE_URL);
const instanceNoToken = createInstance(BASE_URL, {}, false);

// --- Tạo API ---
const api = createApi(instance);
const apiNoToken = createApi(instanceNoToken);

export { api, apiNoToken };
