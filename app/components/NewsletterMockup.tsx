"use client";

export default function NewsletterMockup({
  brandColor,
  newsletterName,
  content,
}: {
  brandColor: string;
  newsletterName: string;
  content: {
    sponsorName: string;
    headline: string;
    body: string;
    link: string;
    imagePath?: string | null;
  };
}) {
  // Simplified font family (system default)
  const fontFamily =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

  // Simplified layout (minimal style by default)
  const borderStyle = {
    borderTop: `3px solid ${brandColor}`,
    paddingTop: "1.5rem",
    paddingBottom: "1rem",
  };

  const imageUrl = content.imagePath
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ad-creatives/${content.imagePath}`
    : null;

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        background: "#ffffff",
        fontFamily,
        color: "#1a1a1a",
      }}
    >
      {/* Newsletter Header */}
      <div
        style={{
          textAlign: "center",
          paddingBottom: "2rem",
          borderBottom: `2px solid ${brandColor}20`,
          marginBottom: "2rem",
        }}
      >
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            color: brandColor,
            margin: 0,
            marginBottom: "0.5rem",
          }}
        >
          {newsletterName}
        </h1>
        <p
          style={{
            fontSize: "0.875rem",
            color: "#666",
            margin: 0,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Weekly Newsletter
        </p>
      </div>

      {/* Ad Content Container */}
      <div
        style={{
          ...borderStyle,
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            color: "#999",
            fontWeight: 600,
            marginBottom: "1rem",
          }}
        >
          Sponsored Content
        </div>

        {/* Image */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Ad Preview"
            style={{
              width: "100%",
              marginBottom: "1.25rem",
              borderRadius: "6px",
              maxHeight: "300px",
              objectFit: "cover",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          />
        ) : null}

        {/* Headline */}
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "0.75rem",
            color: "#1a1a1a",
            lineHeight: "1.3",
          }}
        >
          {content.headline}
        </h2>

        {/* Body */}
        <p
          style={{
            fontSize: "1rem",
            lineHeight: "1.6",
            color: "#333",
            marginBottom: "1rem",
            whiteSpace: "pre-wrap",
          }}
        >
          {content.body}
        </p>

        {/* Link */}
        <a
          href={content.link || "#"}
          style={{
            color: brandColor,
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "0.9375rem",
            display: "inline-block",
            marginBottom: "1rem",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.textDecoration = "underline")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.textDecoration = "none")
          }
        >
          {content.link || "https://your-website.com"} →
        </a>

        {/* Sponsor Attribution */}
        <div
          style={{
            fontSize: "0.8125rem",
            color: "#666",
            fontStyle: "italic",
            paddingTop: "1rem",
            borderTop: `1px solid ${brandColor}20`,
          }}
        >
          Sponsored by {content.sponsorName}
        </div>
      </div>

      {/* Newsletter Footer Placeholder */}
      <div
        style={{
          textAlign: "center",
          paddingTop: "2rem",
          borderTop: `1px solid ${brandColor}20`,
          color: "#999",
          fontSize: "0.8125rem",
        }}
      >
        <p style={{ margin: 0 }}>More articles and content below...</p>
      </div>
    </div>
  );
}
