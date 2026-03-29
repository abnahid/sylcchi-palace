export type TErrorSources = {
  path: string;
  message: string;
};

export type TErrorResponse = {
  success: boolean;
  message: string;
  statusCode: number;
  errorSources: TErrorSources[];
  error?: unknown;
  stack?: string;
};
