export default function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mx-4 mt-3 flex items-center gap-2.5 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
      <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="text-xs font-semibold text-red-600">{message}</span>
    </div>
  );
}