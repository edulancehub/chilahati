import Link from "next/link";

const categories = [
  { href: "/archive/history", cls: "card-history", icon: "fas fa-history", title: "History", desc: "Explore the rich heritage and past of Chilahati." },
  { href: "/archive/culture", cls: "card-culture", icon: "fas fa-palette", title: "Culture", desc: "Local art, traditions, and festivals." },
  { href: "/archive/institution", cls: "card-institution", icon: "fas fa-university", title: "Institutions", desc: "Schools, Banks, and Government offices." },
  { href: "/archive/notable-people", cls: "card-notable", icon: "fas fa-user-tie", title: "Notable People", desc: "Legends who shaped our land." },
  { href: "/archive/freedom-fighters", cls: "card-freedom", icon: "fas fa-fist-raised", title: "Freedom Fighters", desc: "Honoring the heroes of 1971." },
  { href: "/archive/meritorious-student", cls: "card-student", icon: "fas fa-user-graduate", title: "Meritorious Student", desc: "Academic achievers of our area." },
  { href: "/archive/hidden-talent", cls: "card-talent", icon: "fas fa-star", title: "Hidden Talent", desc: "Unsung artists and creators." },
  { href: "/archive/occupation", cls: "card-occupation", icon: "fas fa-tools", title: "Occupation", desc: "Traditional and local livelihoods." },
  { href: "/archive/heartbreaking-stories", cls: "card-stories", icon: "fas fa-heart-broken", title: "Heartbreaking Stories", desc: "Emotional tales from our community." },
  { href: "/archive/tourist-spots", cls: "card-tourist", icon: "fas fa-camera-retro", title: "Tourist Spots", desc: "Beautiful places to visit in Chilahati." },
  { href: "/archive/transport", cls: "card-transport", icon: "fas fa-train", title: "Transport", desc: "Railways and roads connecting us." },
  { href: "/archive/emergency-services", cls: "card-emergency", icon: "fas fa-hand-holding-medical", title: "Emergency Services", desc: "Hospitals, Fire, and Police contacts." },
  { href: "/archive/social-works", cls: "card-social", icon: "fas fa-hands-helping", title: "Social Works", desc: "Charity and community welfare." },
];

export default function Home() {
  return (
    <div className="main-content">
      <header>
        <h1>Chilahati Archive</h1>
        <p className="subtitle">Gateway to the North &bull; Preserving Our History &amp; People</p>
      </header>

      <div className="menu-grid">
        {categories.map((cat) => (
          <Link key={cat.href} href={cat.href} className={`card ${cat.cls}`}>
            <div className="card-content">
              <div className="card-icon"><i className={cat.icon}></i></div>
              <h3>{cat.title}</h3>
              <p>{cat.desc}</p>
            </div>
            <i className="fas fa-arrow-right card-arrow"></i>
          </Link>
        ))}
      </div>
    </div>
  );
}
