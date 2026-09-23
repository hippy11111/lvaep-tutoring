import Image from "next/image";

export function BrandMark({
  className = "h-7",
  alt = "",
}: {
  className?: string;
  alt?: string;
}) {
  return (
    <span className={`inline-flex shrink-0 ${className}`}>
      <Image
        src="/lvaep-logo.png"
        alt={alt}
        width={800}
        height={516}
        className="h-full w-auto object-contain object-left mix-blend-multiply"
        style={{ width: "auto", height: "100%" }}
        priority
      />
    </span>
  );
}
