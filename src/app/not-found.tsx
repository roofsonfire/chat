import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-muted-foreground text-6xl font-bold">404</h1>
        <h2 className="mt-4 text-2xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground mt-2">
          The page you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="bg-primary text-primary-foreground hover:bg-primary/90 mt-6 inline-block rounded-md px-4 py-2"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
