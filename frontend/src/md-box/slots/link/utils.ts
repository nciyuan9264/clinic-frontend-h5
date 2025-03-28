// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseJSON = <T extends Record<string, unknown> = any>(
  value?: string | null,
): T | Record<string, unknown> => {
  try {
    return value ? JSON.parse(value) : {};
  } catch (error) {
    console.error({ error: error as Error });
    return {};
  }
};
