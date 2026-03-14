export interface Article {
  id: string;
  title: string;
  summary: string;
  category: string;
  readTime: number;
  tags: string[];
  icon: string;
}

export function ArticleCard({ article }: { article: Article }) {
  return (
    <div className="group flex flex-col rounded-lg border border-border bg-card p-5 shadow-card transition-all duration-150 hover:border-primary/40 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="text-2xl" aria-hidden>
          {article.icon}
        </span>
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {article.readTime} min read
        </span>
      </div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">
        {article.category}
      </p>
      <h3 className="mb-2 text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
        {article.title}
      </h3>
      <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{article.summary}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {article.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
