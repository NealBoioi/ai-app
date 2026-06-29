export function success(data: unknown) {
  return Response.json({ success: true, data });
}

export function error(message: string, status = 500) {
  return Response.json(
    { success: false, message },
    { status }
  );
}
