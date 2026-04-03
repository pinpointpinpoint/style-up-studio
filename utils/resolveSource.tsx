import { SanityAsset } from "@/types";

export default function resolveSource(asset: SanityAsset): string {
  return asset.value.url ?? asset.value.fileUrl ?? "";
}