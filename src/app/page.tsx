import Main from './components/Main/Main';
import BrandShowcase from './components/BrandShowcase';
import CollectionsShowcase from './components/Collections/CollectionsShowcase';
import NewArrivalsCarousel from './components/NewArrivalsCarousel';
import ShowRoom from './components/ShowRoom';


export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Main Slider Section */}
      <Main />


      {/* Collections Section */}
      <CollectionsShowcase />

      {/* New Arrivals Carousel Section */}
      <NewArrivalsCarousel />

      {/* Second Banner Section */}
      {/* <SecondBanner /> */}

      {/* ShowRoom Section */}
      <ShowRoom />

      {/* Brand Showcase Section */}
      <BrandShowcase />


      {/* Products Section */}
      {/* <AllProducts /> */}
    </main>
  );
}