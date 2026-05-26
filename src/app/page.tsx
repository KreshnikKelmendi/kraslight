import Main from './components/Main/Main';
import CollectionsShowcase from './components/Collections/CollectionsShowcase';
import NewArrivalsCarousel from './components/NewArrivalsCarousel';
import ShowRoom from './components/ShowRoom';
import OtherProducts from '../components/OtherProducts';
import { getHomePageData } from './lib/home-data';

export const revalidate = 60;

export default async function Home() {
  const homeData = await getHomePageData();

  return (
    <main className="min-h-screen">
      <Main initialSlider={homeData.slider} />
      <CollectionsShowcase initialCollections={homeData.collections} />
      <NewArrivalsCarousel initialProducts={homeData.newArrivals} />
      <ShowRoom />
      <OtherProducts initialProducts={homeData.otherProducts} />
    </main>
  );
}
