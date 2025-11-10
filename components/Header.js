import Link from 'next/link'
import { useRouter } from "next/router"

const nav = [
  { name: "Home", href: "/home" },
  { name: "Project Overview", href: "/overview" },
  { name: "Timeline", href: "/timeline" },
  { name: "Data Validation", href: "/datavalidation/datasets" },
  { name: "AI Model", href: "/aimodel/visualization" },
  { name: "Explainability", href: "/explainability" },
  { name: "Visualization", href: "/visualization" },
]

export default function Header() {
  const router = useRouter();

  function logout() {
    localStorage.removeItem("gachon_ai_auth");
    router.replace("/");
  }

  return (
    <header className="bg-gradient-to-r from-blue-900 to-blue-600 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <span className="font-black text-2xl tracking-tight text-white">AI & Smart City Lab</span>
        <nav className="flex gap-4">
          {nav.map((item) => (
            <Link key={item.name} href={item.href} className="text-white font-medium hover:underline hover:text-yellow-300 transition">
              {item.name}
            </Link>
          ))}
        </nav>
        <div>
          <button
            onClick={logout}
            className="ml-4 bg-yellow-400 text-blue-900 font-bold px-4 py-1 rounded hover:bg-yellow-300 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
