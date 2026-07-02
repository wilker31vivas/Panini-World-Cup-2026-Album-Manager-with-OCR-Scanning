export default function ScanCorners() {
  const base = 'absolute w-5 h-5 border-[#c8102e] border-solid';
  return (
    <>
      <div className={`${base} top-5 left-5 border-t-[3px] border-l-[3px] rounded-tl`} />
      <div className={`${base} top-5 right-5 border-t-[3px] border-r-[3px] rounded-tr`} />
      <div className={`${base} bottom-5 left-5 border-b-[3px] border-l-[3px] rounded-bl`} />
      <div className={`${base} bottom-5 right-5 border-b-[3px] border-r-[3px] rounded-br`} />
    </>
  );
}