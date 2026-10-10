import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-ink-950 pt-16 pb-8">
      <div className="container-main">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center text-white font-black text-lg">M</div>
              <span className="text-xl font-black text-white">My<span className="text-saffron-400">KKR</span></span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed mb-5 max-w-xs">Kurukshetra ka apna bazaar. Connecting local businesses with local people — simply, honestly, without commissions.</p>
            <div className="flex gap-2">
              {['📘','📸','🐦','▶️'].map(icon => (
                <div key={icon} className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-base cursor-pointer hover:border-saffron-500/50 hover:bg-saffron-500/10 transition-all">{icon}</div>
              ))}
            </div>
          </div>
          {[
            { title:'For Business', links:['List your business','How it works','Pricing','Verified badge','Delivery network'] },
            { title:'Browse', links:['Event services','Venues','Home services','Food & dining','All categories'] },
            { title:'Company', links:['About My KKR','Contact us','Privacy policy','Terms of service','Refund policy'] },
          ].map(col => (
            <div key={col.title}>
              <div className="text-xs font-bold text-white/80 uppercase tracking-widest mb-4">{col.title}</div>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link}>
                    <Link href="#" className="text-sm text-white/40 hover:text-saffron-400 transition-colors">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/8 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-white/25">© 2025 My KKR · Made with ❤️ in Kurukshetra, Haryana · <Link href="https://mykkr.in" className="text-saffron-500">mykkr.in</Link></p>
          <p className="text-xs text-white/20 max-w-md text-right">⚠️ My KKR is a connector platform. All transactions, payments and service quality are solely between buyers and sellers. My KKR takes no responsibility for any dispute.</p>
        </div>
      </div>
    </footer>
  )
}
