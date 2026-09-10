import { ImageResponse } from "next/og";
export const alt = "Surftrips.fr — Le bon spot. Au bon moment.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        background: "#FCFEFF",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "64px 80px",
        color: "#073B56",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ fontSize: 35, display: "flex" }}>
        surftrips<span style={{ color: "#087EA4" }}>.fr</span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 94,
          fontWeight: 700,
          letterSpacing: -5,
          marginTop: 65,
          lineHeight: 1.08,
        }}
      >
        <span>Le bon spot.</span>
        <span style={{ color: "#087EA4" }}>Au bon moment.</span>
      </div>
      <div style={{ fontSize: 25, marginTop: 42 }}>
        Ton niveau. Tes dates. Ton prochain surf trip.
      </div>
      <div
        style={{
          width: "100%",
          height: 7,
          background: "#087EA4",
          position: "absolute",
          bottom: 0,
          left: 0,
        }}
      />
    </div>,
    size,
  );
}
