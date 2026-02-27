function Loader({ text = "Chargement..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950">
      <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-400 text-sm">{text}</p>
    </div>
  );
}

export default Loader;