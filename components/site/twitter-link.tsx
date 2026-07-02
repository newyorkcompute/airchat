function XLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
    </svg>
  );
}

export function TwitterLink() {
  return (
    <a
      href="https://x.com/siddharthkul"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Follow on X"
      title="Follow on X"
      className="fixed right-23 top-2 z-30 flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <XLogo className="size-4" />
    </a>
  );
}
