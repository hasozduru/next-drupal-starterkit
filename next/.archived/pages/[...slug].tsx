import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import { DrupalNode, DrupalTranslatedPath } from "next-drupal";

import {
  createLanguageLinks,
  LanguageLinks,
} from "@/lib/contexts/language-links-context";
import { drupal } from "@/lib/drupal/drupal-client";
import { getNodePageJsonApiParams } from "@/lib/drupal/get-node-page-json-api-params";
import { ResourceType } from "@/lib/drupal/get-node-page-json-api-params";
import { getNodeTranslatedVersions } from "@/lib/drupal/get-node-translated-versions";
import {
  CommonPageProps,
  getCommonPageProps,
} from "@/lib/get-common-page-props";
import {
  Article as ArticleType,
  validateAndCleanupArticle,
} from "@/lib/zod/article";
import { Page as PageType, validateAndCleanupPage } from "@/lib/zod/page";

import { Article } from "@/archived-components/article";
import { Meta } from "@/archived-components/meta";
import { Page } from "@/archived-components/page";

const RESOURCE_TYPES = ["node--article", "node--page"];

export default function CustomPage({
  resource,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  if (!resource) return null;

  return (
    <>
      <Meta title={resource.title} metatags={resource.metatag} />
      {resource.type === "node--article" && <Article article={resource} />}
      {resource.type === "node--page" && <Page page={resource} />}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async (context) => {
  const paths = await drupal.getStaticPathsFromContext(RESOURCE_TYPES, context);
  return {
    paths: paths,
    fallback: "blocking",
  };
};

interface PageProps extends CommonPageProps {
  resource: PageType | ArticleType;
  languageLinks: LanguageLinks;
}

export const getStaticProps: GetStaticProps<PageProps> = async (context) => {
  const path: DrupalTranslatedPath =
    await drupal.translatePathFromContext(context);

  if (!path) {
    return {
      notFound: true,
    };
  }

  if (path.redirect?.length) {
    const [redirect] = path.redirect;
    return {
      redirect: {
        destination: redirect.to,
        permanent: false,
      },
    };
  }

  const type = path.jsonapi.resourceName as ResourceType;

  // If we are looking at the path of a frontpage node,
  // redirect the user to the homepage for that language:

  if (type === "node--frontpage") {
    return {
      redirect: {
        destination: "/" + context.locale,
        permanent: false,
      },
    };
  }

  const resource = await drupal.getResourceFromContext<DrupalNode>(
    path,
    context,
    {
      params: getNodePageJsonApiParams(type).getQueryObject(),
    },
  );

  // At this point, we know the path exists and it points to a resource.
  // If we receive an error, it means something went wrong on Drupal.
  // We throw an error to tell revalidation to skip this for now.
  // Revalidation can try again on next request.
  if (!resource) {
    throw new Error(`Failed to fetch resource: ${path.jsonapi.individual}`);
  }

  // If we're not in preview mode and the resource is not published,
  // Return page not found.
  if (!context.preview && resource?.status === false) {
    return {
      notFound: true,
    };
  }

  // Add information about possible other language versions of this node.
  const nodeTranslations = await getNodeTranslatedVersions(
    resource,
    context,
    drupal,
  );
  const languageLinks = createLanguageLinks(nodeTranslations);

  const validatedResource =
    type === "node--article"
      ? validateAndCleanupArticle(resource)
      : type === "node--page"
        ? validateAndCleanupPage(resource)
        : null;

  return {
    props: {
      ...(await getCommonPageProps(context)),
      resource: validatedResource,
      languageLinks,
    },
    revalidate: 60,
  };
};