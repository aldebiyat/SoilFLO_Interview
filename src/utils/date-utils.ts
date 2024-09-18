export function toUTCString(date: string): string {
  const dispatchedTime = new Date(date);
  return new Date(
    dispatchedTime.getTime() - dispatchedTime.getTimezoneOffset() * 60000,
  )
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');
}
