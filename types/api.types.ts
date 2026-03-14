export interface ApiError {
  message: string;
  code?: string;
}

export interface ApiResult<T> {
  data: T;
  error?: ApiError;
}
