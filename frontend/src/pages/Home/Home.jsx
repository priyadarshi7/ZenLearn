import React from 'react'
import HeroSection from '../../components/Home/HeroSection/HeroSection'
import Navbar from '../../components/Navbar/Navbar'
import ReviewMarquee from '../../components/Home/Reviews/ReviewMarquee'
import FeaturesSection from '../../components/Home/Features/Features'

export default function Home() {
  return (
    <div>
        <HeroSection/>
        <FeaturesSection/>
        <ReviewMarquee/>

    </div>
  )
}
