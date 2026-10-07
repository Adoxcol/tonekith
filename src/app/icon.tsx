import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0B0B0C",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: "#F5F5F4",
          }}
        >
          <div
            style={{
              width: 22,
              height: 14,
              borderTop: "5px solid #F5F5F4",
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              position: "relative",
              display: "flex",
              justifyContent: "center",
            }}
          />
          <div
            style={{
              width: 28,
              height: 28,
              border: "4px solid #F5F5F4",
              borderRadius: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: -2,
            }}
          >
            <div
              style={{
                width: 10,
                height: 3,
                background: "#FF7A00",
                borderRadius: 2,
                transform: "rotate(-45deg) translate(2px, -2px)",
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
