import { redirect } from "next/navigation";

/**
 * The legacy embedded map experience has been removed. Visitors who land on
 * `/map` are redirected to the search experience where every listing card
 * offers a Google Maps search link.
 */
export default function MapPage() {
  redirect("/search");
}
