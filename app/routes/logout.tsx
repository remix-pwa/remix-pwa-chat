import type { LoaderFunction } from "@remix-run/node";
import { logout } from "~/utils/server/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  return logout(request);
}