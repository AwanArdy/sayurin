export type ErrorCode = 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'NOT_FOUND' | 'STOCK_OUT' | 'D1_EXECUTION_ERROR';

export const success = <T>(data: T) => {
  return {
    success: true,
    data
  };
};

export const fail = (code: ErrorCode, message: string, details: any[] = []) => {
  return {
    success: false,
    error: {
      code,
      message,
      details
    }
  };
};
