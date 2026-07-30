import { noIndexRobotsMeta } from '@/lib/seo';

export const noIndexHead = () => ({
  meta: [noIndexRobotsMeta()],
});
