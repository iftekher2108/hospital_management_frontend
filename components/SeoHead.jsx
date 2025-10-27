import Head from "next/head"

export default function SEOHead({ title, description, image, url }) {
  const siteName = "Iftekher Portfolio"
  const fullTitle = title ? `${title} | ${siteName}` : siteName
  const defaultImage = image || "/og-image.jpg"

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description || "A modern Next.js website built by Iftekher"} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || ""} />
      <meta property="og:image" content={defaultImage} />
      <meta property="og:url" content={url || "https://yourdomain.com"} />
      <meta property="og:site_name" content={siteName} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || ""} />
      <meta name="twitter:image" content={defaultImage} />
    </Head>
  )
}