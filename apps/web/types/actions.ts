export type ActionResult<TData = void> = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
  data?: TData;
};
