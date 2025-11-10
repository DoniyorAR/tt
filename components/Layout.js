import Header from './Header'
import Footer from './Footer'

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
