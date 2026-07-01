export function SectionHeader({
  emoji,
  title,
  align = "center",
}: {
  emoji?: string;
  title?: string;
  align?: "center" | "left";
}) {
  if (!title) return null;
  return (
    <div
      className={
        align === "center"
          ? "mb-8 flex flex-col items-center gap-3 text-center"
          : "mb-6 flex items-center gap-3"
      }
    >
      {emoji ? (
        <span className="text-4xl leading-none" aria-hidden>
          {emoji}
        </span>
      ) : null}
      <h2 className="text-xl font-bold tracking-tight text-foreground">
        {title}
      </h2>
    </div>
  );
}
