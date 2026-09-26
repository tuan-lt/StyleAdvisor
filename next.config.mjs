/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "assets.aritzia.com" },
      { protocol: "https", hostname: "shop.lululemon.com" },
      { protocol: "https", hostname: "kotn.com" },
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "www.rw-co.com" },
      { protocol: "https", hostname: "ca.vessi.com" },
      { protocol: "https", hostname: "www.frankandoak.com" },
      { protocol: "https", hostname: "reigningchamp.com" },
      { protocol: "https", hostname: "www.clubmonaco.ca" },
      { protocol: "https", hostname: "www.roots.com" },
      { protocol: "https", hostname: "www.mackage.ca" },
      { protocol: "https", hostname: "www.brownsshoes.com" },
      { protocol: "https", hostname: "maguiredesigns.com" },
      { protocol: "https", hostname: "duer.ca" },
      { protocol: "https", hostname: "www.tentree.ca" },
      { protocol: "https", hostname: "provinceofcanada.com" },
      { protocol: "https", hostname: "www.encircled.ca" },
      { protocol: "https", hostname: "www.sorelfootwear.ca" },
      { protocol: "https", hostname: "herschel.ca" },
    ],
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
