import { FC } from "react"

// SHINJUKU JOURNAL ワードマーク。色はcurrentColor(墨)、アクセントはネオンのバーのみ。
// textLengthで欧文幅を固定し、フォント未読込時も崩れないようにする
export const Logo: FC<{ sub: string; className?: string }> = ({
  sub,
  className,
}) => (
  <svg
    aria-label={`SHINJUKU JOURNAL ${sub}`}
    className={`logo${className ? ` ${className}` : ""}`}
    role="img"
    viewBox="0 0 280 56"
  >
    <rect className="logo__accent" height="30" width="6" x="0" y="2" />
    <text
      className="logo__en"
      lengthAdjust="spacingAndGlyphs"
      textLength="264"
      x="14"
      y="29"
    >
      SHINJUKU JOURNAL
    </text>
    <text className="logo__ja" x="14" y="50">
      {sub}
    </text>
  </svg>
)
