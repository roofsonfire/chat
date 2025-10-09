"use client";

import { AlertTriangle } from "lucide-react";

export default function MiddlewareErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="mx-auto max-w-md rounded-lg bg-white p-8 text-center shadow-lg dark:bg-gray-800">
        <AlertTriangle className="mx-auto h-16 w-16 text-red-500" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
          Application Error
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          We&apos;re sorry, but a critical error occurred that prevented the
          page from loading correctly. This may be a temporary issue.
        </p>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">
          Please try again in a few moments. If the problem persists, please
          contact support.
        </p>
      </div>
    </div>
  );
}
