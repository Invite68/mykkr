import Navbar         from '@/components/layout/Navbar'
import HeroSection     from '@/components/sections/HeroSection'
import CategoriesSection from '@/components/sections/CategoriesSection'
import CalendarSection from '@/components/sections/CalendarSection'
import HowItWorksSection   from '@/components/sections/HowItWorksSection'
import ListingsSection from '@/components/sections/ListingsSection'
import DeliverySection from '@/components/sections/DeliverySection'
import PricingSection  from '@/components/sections/PricingSection'
import RegisterSection from '@/components/sections/RegisterSection'
import TrustBar        from '@/components/sections/TrustBar'
import Footer          from '@/components/layout/Footer'
import FloatingActions from '@/components/ui/FloatingActions'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <TrustBar />
        <CategoriesSection />
        <HowItWorksSection />
        <ListingsSection />
        <CalendarSection />
        <DeliverySection />
        <PricingSection />
        <RegisterSection />
      </main>
      <Footer />
      <FloatingActions />
    </>
  )
}
