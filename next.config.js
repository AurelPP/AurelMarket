/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.pokemondb.net", pathname: "/**" },
      { protocol: "https", hostname: "raw.githubusercontent.com", pathname: "/PokeAPI/**" },
    ],
  },
};
module.exports = nextConfig;
