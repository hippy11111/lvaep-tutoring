import Image from "next/image";

export function BrandMark({
  className = "h-7",
  alt = "",
}: {
  className?: string;
  alt?: string;
}) {
  return (
    <Image
      src="/lvaep-logo.png"
      alt={alt}
      width={800}
      height={516}
      className={`w-auto mix-blend-multiply ${className}`}
      priority
    />
  );
}
