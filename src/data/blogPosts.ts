export interface BlogPost {
  slug: string;
  title: string;
  subtitle?: string;
  metaDescription: string;
  category: string;
  publishedDate: string;
  lastUpdatedDate?: string;
  readingTime: string;
  canonicalUrl: string;
  author?: string;
  primaryTopic: string;
  relatedTopics?: string[];
  sources?: string[];
  keyTakeaway?: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'unfinished-work-productivity-paradox',
    title: 'The Productivity Paradox of Unfinished Work: It May Pull You Back Tomorrow—and Follow You Home Tonight',
    metaDescription: 'Leaving work unfinished is often promoted as a productivity trick. New research suggests the reality is more complicated: unfinished work may help pull you back into a task, but it can also keep work active in your mind after hours.',
    category: 'Productivity & Research',
    publishedDate: 'August 28, 2026',
    readingTime: '6 min read',
    canonicalUrl: 'https://codefuser.in/blog/unfinished-work-productivity-paradox',
    author: 'CodeFuser Research',
    primaryTopic: 'Productivity & Work Systems',
    relatedTopics: ['Cognitive Load', 'Work-Life Recovery', 'Task Management', 'Focus'],
    sources: [
      'Ghibellini, R. & Meier, B. (2025), Interruption, recall and resumption: a meta-analysis of the Zeigarnik and Ovsiankina effects.',
      'Wendsche, J., Weigelt, O. & Syrek, C. J. (2026), Unfinished work tasks and work-related thoughts during off-job time: meta-analysis of the Zeigarnik effect in a work-recovery context.',
      'Huang, J. et al. (2026), The Double-Edged Effects of Daily Unfinished Tasks on Next-Day Speed of Engagement.',
      'Frontiers review on interruption science and task resumption.'
    ],
    keyTakeaway: 'You do not always need to finish the work. You need to finish the decision about what happens next.'
  }
];
