import React from "react";

const NAV_LINKS = ["Home", "Explore", "About", "API"];

export default function Navbar() {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: 52,
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: 32,
        background: "rgba(8,12,15,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "0.5px solid rgba(255,255,255,0.07)",
      }}
    >
      <a
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          textDecoration: "none",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#2be8a4",
            boxShadow: "0 0 8px #2be8a4",
            display: "inline-block",
          }}
        />
        <span
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 700,
            fontSize: 15,
            color: "#e8eef2",
          }}
        >
          Dynamic World
        </span>
      </a>

      <div style={{ display: "flex", gap: 4 }}>
        {NAV_LINKS.map((link) => (
          <a
            key={link}
            href="#"
            style={{
              fontSize: 12,
              textDecoration: "none",
              padding: "5px 12px",
              borderRadius: 6,
              color: link === "Explore" ? "#2be8a4" : "rgba(255,255,255,0.5)",
              transition: "color 0.15s",
            }}
          >
            {link}
          </a>
        ))}
      </div>

      <div style={{ marginLeft: "auto" }}>
        <span
          style={{
            fontSize: 10,
            letterSpacing: "0.08em",
            color: "#2be8a4",
            background: "rgba(43,232,164,0.1)",
            border: "0.5px solid rgba(43,232,164,0.25)",
            padding: "3px 8px",
            borderRadius: 4,
          }}
        >
          10m · Near Realtime
        </span>
      </div>
    </nav>
  );
}
