import { StyleUps } from "@/components/StyleUps";
import { sanityFetch } from "@/sanity/lib/live"
import { allStyleUpsQuery } from "@/sanity/lib/queries"

export default async function StylePage() {
  const [{ data: styleUps}] = await Promise.all([
    sanityFetch({query: allStyleUpsQuery, stega: false}),
  ]);
  return (
    <StyleUps styleUps={styleUps}/>
  )
}
