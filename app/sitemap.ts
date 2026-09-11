import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.iepverify.com/",
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://www.iepverify.com/how-it-works",
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: "https://www.iepverify.com/texas",
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: "https://www.iepverify.com/request-demo",
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}