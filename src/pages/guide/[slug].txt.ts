// Copyright (c) 2026 Kunal Suri (CEA LIST). Apache-2.0.
// Static .txt downloads: one plain-text cheat sheet per topic, generated at
// build time. `/guide/prompting.txt` ships as a real file — no runtime code.
import type { APIRoute } from 'astro';
import { getGuideTopics } from '../../lib/data';
import { topicSheet } from '../../lib/fieldguide';

export function getStaticPaths() {
  return getGuideTopics('en').map((topic) => ({
    params: { slug: topic.slug },
    props: { topic },
  }));
}

export const GET: APIRoute = ({ props }) => {
  const { topic } = props;
  return new Response(topicSheet('en', topic.topic, topic.description, topic.terms), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
