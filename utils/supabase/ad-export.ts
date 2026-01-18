// utils/ad-export.ts

interface AdContent {
  sponsorName: string;
  headline: string;
  body: string;
  link: string;
  imageUrl?: string | null;
}

export const generateHTML = (
  ad: AdContent,
  primaryColor: string = "#6366f1"
) => {
  const imageBlock = ad.imageUrl
    ? `<img src="${ad.imageUrl}" alt="${ad.sponsorName}" style="max-width:100%; border-radius:4px; margin-bottom:15px; display:block;" />`
    : "";

  return `
  <div style="background: #f8f9fa; border-left: 4px solid ${primaryColor}; padding: 20px; margin: 20px 0; border-radius: 4px; font-family: sans-serif;">
    <div style="font-size: 11px; font-weight: bold; color: #888; text-transform: uppercase; margin-bottom: 10px;">
      Sponsored by ${ad.sponsorName}
    </div>
    ${imageBlock}
    <h3 style="margin: 0 0 10px 0; color: ${primaryColor}; font-size: 18px;">
      <a href="${ad.link}" style="color: ${primaryColor}; text-decoration: none;">${ad.headline}</a>
    </h3>
    <p style="margin: 0 0 15px 0; font-size: 15px; line-height: 1.6; color: #333;">
      ${ad.body}
    </p>
    <a href="${ad.link}" style="display: inline-block; font-weight: bold; color: ${primaryColor}; text-decoration: underline;">
      Read More &rarr;
    </a>
  </div>
  `.trim();
};

export const generateMarkdown = (ad: AdContent) => {
  const imageBlock = ad.imageUrl
    ? `![${ad.sponsorName}](${ad.imageUrl})\n\n`
    : "";

  return `
  ### Sponsored by ${ad.sponsorName}
  
  ${imageBlock}**[${ad.headline}](${ad.link})**
  
  ${ad.body}
  
  [Read More](${ad.link})
  `.trim();
};

export const generatePlainText = (ad: AdContent) => {
  return `
  SPONSOR: ${ad.sponsorName}
  HEADLINE: ${ad.headline}
  LINK: ${ad.link}
  
  BODY:
  ${ad.body}
  `.trim();
};
