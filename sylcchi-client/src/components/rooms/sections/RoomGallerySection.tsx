"use client";

import Image from "next/image";

type RoomGallerySectionProps = {
  roomName: string;
  gallery: string[];
  onImageError: (index: number) => void;
};

const RoomGallerySection = ({
  roomName,
  gallery,
  onImageError,
}: RoomGallerySectionProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="relative h-72 overflow-hidden rounded-xl sm:h-96 lg:h-130">
          <Image
            src={gallery[0]}
            alt={`${roomName} main view`}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 66vw"
            priority
            onError={() => onImageError(0)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="relative h-40 overflow-hidden rounded-xl sm:h-52 lg:h-63">
          <Image
            src={gallery[1]}
            alt={`${roomName} detail one`}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 33vw"
            onError={() => onImageError(1)}
          />
        </div>

        <div className="relative h-40 overflow-hidden rounded-xl sm:h-52 lg:h-63">
          <Image
            src={gallery[2]}
            alt={`${roomName} detail two`}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 33vw"
            onError={() => onImageError(2)}
          />
        </div>
      </div>
    </div>
  );
};

export default RoomGallerySection;
