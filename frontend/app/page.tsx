import { redirect } from "next/navigation";
import { defaultLocale } from "@/content/get-dictionary";

export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
