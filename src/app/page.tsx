import Main from './components/Main/Main';
// import BrandShowcase from './components/BrandShowcase';
import CollectionsShowcase from './components/Collections/CollectionsShowcase';
import NewArrivalsCarousel from './components/NewArrivalsCarousel';
import ShowRoom from './components/ShowRoom';
import OtherProducts from '../components/OtherProducts';


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



      {/* Other Products Section */}
      <OtherProducts />
      {/* Brand Showcase Section */}
      {/* <BrandShowcase /> */}


      {/* Products Section */}
      {/* <AllProducts /> */}
    </main>
  );
}