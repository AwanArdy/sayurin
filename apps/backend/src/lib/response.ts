export type ErrorCode = 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'NOT_FOUND' | 'STOCK_OUT' | 'D1_EXECUTION_ERROR';

export type ZodIssueLike = {
  path: Array<PropertyKey>;
  message: string;
};

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

// Ubah ZodError menjadi envelope error yang seragam (sama seperti `fail`).
export const formatZodError = (error: { issues: ZodIssueLike[] }) => {
  return fail(
    'VALIDATION_ERROR',
    'Data tidak valid',
    error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    })),
  );
};