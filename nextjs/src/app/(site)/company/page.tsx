import type { Metadata } from "next";
import CompanyClient from "./CompanyClient";
import JsonLd from "@/components/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata";
import {
  localBusinessSchema,
  breadcrumbSchema,
  personSchema,
} from "@/lib/seo/schemas";

export const metadata: Metadata = pageMetadata.company;

export default function CompanyPage() {
  return (
    <>
      <JsonLd
        data={[
          localBusinessSchema(),
          personSchema(),
          breadcrumbSchema([
            { name: "홈", url: "https://trump1.co.kr" },
            { name: "회사소개", url: "https://trump1.co.kr/company" },
          ]),
        ]}
      />
      <CompanyClient />
    </>
  );
}
