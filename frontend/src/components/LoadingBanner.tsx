export default function LoadingBanner({ message = "Escaneando..." }: { message?: string }) {
  return (
    <div className="mx-4 mt-3 flex items-center justify-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5">
      <svg className="w-4 h-4 text-gray-600 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <span className="text-xs font-semibold text-gray-600">{message}</span>
    </div>
  );
}