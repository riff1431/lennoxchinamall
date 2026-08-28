import { redirect } from "next/navigation";

export default function StoreHistoryRedirectPage() {
  redirect("/account/history");
}
