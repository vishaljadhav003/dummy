import React from "react";
import { Helmet } from "react-helmet-async";

const SEO = ({
  title,
  description,
  keywords,
  url,
  image,
  teamMembers = [],
}) => {
  const canonicalUrl = url || "https://motionpixindia.com";

  const employeeSchema = teamMembers.map((member) => ({
    "@type": "Person",
    name: member.name,
    jobTitle: member.role,
    description: member.about,
    workLocation: {
      "@type": "Place",
      name: member.location,
    },
    image: member.image.startsWith("http")
      ? member.image
      : `https://motionpixindia.com${member.image}`,
  }));

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MotionPix",
    url: canonicalUrl,
    logo: "https://motionpixindia.com/logo.png",
    sameAs: [
      "https://www.linkedin.com/company/motionpix-cinematix/",
    ],
    employee: employeeSchema,
  };

  return (
    <Helmet>
      {/* Basic SEO */}
      <title>{title}</title>

      <meta
        name="description"
        content={description}
      />

      <meta
        name="keywords"
        content={keywords}
      />

      <link
        rel="canonical"
        href={canonicalUrl}
      />

      <meta
        name="robots"
        content="index, follow"
      />

      <meta
        name="author"
        content="MotionPix"
      />

      {/* Open Graph */}
      <meta
        property="og:type"
        content="website"
      />

      <meta
        property="og:title"
        content={title}
      />

      <meta
        property="og:description"
        content={description}
      />

      <meta
        property="og:url"
        content={canonicalUrl}
      />

      <meta
        property="og:image"
        content={image}
      />

      {/* Twitter */}
      <meta
        name="twitter:card"
        content="summary_large_image"
      />

      <meta
        name="twitter:title"
        content={title}
      />

      <meta
        name="twitter:description"
        content={description}
      />

      <meta
        name="twitter:image"
        content={image}
      />

      {/* Schema */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
};

export default SEO;

