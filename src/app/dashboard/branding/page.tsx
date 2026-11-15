export default function BrandingPage() {
  const presets = [
    {
      name: "Tinto",
      desc: "Deep wine red & warm cream — classic Portuguese fine dining",
      accent: "#6B1D2A",
      bg: "#FAF7F2",
      ink: "#1C1917",
    },
    {
      name: "Azeite",
      desc: "Olive green & ivory — rustic, natural, Alentejo-inspired",
      accent: "#5B6B3A",
      bg: "#F8F5EE",
      ink: "#1C1810",
    },
    {
      name: "Atlântico",
      desc: "Deep azure & white — coastal, fresh, modern",
      accent: "#1A3A6C",
      bg: "#F5F8FD",
      ink: "#0F1C35",
    },
  ];

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: "#1C1917" }}>
          Branding & Theme
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#78716C" }}>
          Choose a preset or customise your restaurant&apos;s visual identity.
        </p>
      </div>

      {/* Current theme */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{ background: "white", border: "1px solid #E8E0D8" }}
      >
        <div className="px-5 py-4" style={{ borderBottom: "1px solid #E8E0D8" }}>
          <p className="text-sm font-semibold" style={{ color: "#1C1917" }}>Theme presets</p>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-3">
          {presets.map((p) => (
            <button
              key={p.name}
              className="overflow-hidden rounded-xl text-left transition-transform hover:scale-[1.01]"
              style={{ border: "2px solid #E8E0D8" }}
            >
              {/* Color swatch */}
              <div
                className="flex items-center gap-2 p-4"
                style={{ background: p.bg }}
              >
                <div
                  className="h-6 w-6 rounded-full"
                  style={{ background: p.accent }}
                />
                <span className="text-sm font-semibold" style={{ color: p.ink }}>
                  {p.name}
                </span>
              </div>
              <div className="px-4 py-3">
                <p className="text-xs" style={{ color: "#78716C" }}>{p.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Logo + fonts */}
      <div
        className="space-y-4 rounded-2xl p-6"
        style={{ background: "white", border: "1px solid #E8E0D8" }}
      >
        <p className="text-sm font-semibold" style={{ color: "#1C1917" }}>Logo & typography</p>
        <div
          className="rounded-xl p-4 text-center text-sm"
          style={{ background: "#F7F5F2", color: "#78716C" }}
        >
          Logo upload, font selection and custom hex colours are coming soon.
          <br />
          Contact us to apply custom branding for your restaurant.
        </div>
      </div>

      {/* Cover photo */}
      <div
        className="space-y-4 rounded-2xl p-6"
        style={{ background: "white", border: "1px solid #E8E0D8" }}
      >
        <p className="text-sm font-semibold" style={{ color: "#1C1917" }}>Cover photo</p>
        <div
          className="flex h-32 items-center justify-center rounded-xl"
          style={{ background: "#F7F5F2", border: "2px dashed #E8E0D8" }}
        >
          <p className="text-sm" style={{ color: "#A8A29E" }}>
            Photo upload coming soon
          </p>
        </div>
      </div>
    </div>
  );
}
