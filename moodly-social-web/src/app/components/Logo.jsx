import logo from "../../assets/moodly-logo.png";

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <img src={logo} alt="Moodly Social" className="w-10 h-10" />
      <div>
        <h1 className="mb-1 text-lg leading-none text-black/90">Moodly Social</h1>
        <p className="text-xs text-black/55">Space for your daily pulse</p>
      </div>
    </div>
  );
}
