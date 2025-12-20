export interface PaginationData<T> {
  data: T[];
  page: number;
  pageSize: number;
  count: number;
}

export interface ErrorResponse {
  code: number;
  error: string;
  message: string;
}

export interface SuccessResponse<T> {
  message: string;
  data?: T;
}
