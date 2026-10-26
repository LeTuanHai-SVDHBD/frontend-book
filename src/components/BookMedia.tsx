import type { Media } from "../domain/types";
import { Icon } from "./ui";
/** Same-book photographs are supplied as data. The prototype contact sheet is clipped in CSS. */
export function BookPhoto({
  media,
  alt = "",
  className = "",
}: {
  media: Media;
  alt?: string;
  className?: string;
}) {
  return (
    <span
      className={`book-photo ${media.crop !== undefined ? "contact-photo" : ""} ${className}`}
      data-crop={media.crop}
    >
      <img
        src={
          media.kind === "video"
            ? media.poster || "/assets/book-gallery-sample.png"
            : media.url
        }
        alt={alt || media.title}
      />
    </span>
  );
}
export default function BookMedia({ media }: { media: Media }) {
  if (media.kind === "image") return <BookPhoto media={media} />;
  if (!media.sampleVideo) return <video src={media.url} controls />;
  return (
    <div className="sample-video-frame">
      <BookPhoto media={{ ...media, crop: 0 }} />
      <div className="sample-video-shade">
        <Icon name="play" size={72} />
        <b>Video giới thiệu bản sách</b>
        <span>Khung video mẫu · 00:35</span>
      </div>
      <div className="sample-video-controls">
        <Icon name="play" />
        <span>00:00 / 00:35</span>
        <i />
        <Icon name="grid" />
      </div>
      <p>Thiết kế vị trí trình phát · Chưa gắn tệp video thật</p>
    </div>
  );
}
