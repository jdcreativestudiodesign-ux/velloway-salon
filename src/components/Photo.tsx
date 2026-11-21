import Image from "next/image";
import type { Photo as PhotoData } from "@/lib/photos";

type Props = {
  photo: PhotoData;
  // How wide the image shows at each screen size, so phones get small files.
  sizes: string;
  className?: string;
  // The first image on the page loads straight away; the rest load as you scroll.
  eager?: boolean;
};

export function Photo({ photo, sizes, className = "", eager = false }: Props) {
  return (
    <div className={`photo ${className}`}>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        placeholder="blur"
        blurDataURL={photo.blur}
        {...(eager ? { loading: "eager" as const, fetchPriority: "high" as const } : {})}
      />
    </div>
  );
}
