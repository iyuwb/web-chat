import Image from "next/image";

import { cx } from "../lib/cx.js";

export function AvatarImage({
  src,
  alt,
  className,
  imageClassName,
  sizes = "96px",
  priority = false
}) {
  return (
    <div className={cx("relative overflow-hidden rounded-full", className)}>
      <Image
        fill
        alt={alt}
        className={cx("object-cover", imageClassName)}
        priority={priority}
        sizes={sizes}
        src={src}
      />
    </div>
  );
}
