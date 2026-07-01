import Main from './components/Main/Main';
import CollectionsShowcase from './components/Collections/CollectionsShowcase';
import TextAnimation from './components/TextAnimation';
import ShowRoom from './components/ShowRoom';
import { getHomePageData } from './lib/home-data';

// Always load homepage data at request time (Vercel env + MongoDB available at runtime).
export const dynamic = 'force-dynamic';

export default async function Home() {
  const homeData = await getHomePageData();

  return (
    <main className="min-h-screen">
      <Main initialSlider={homeData.slider} />
      <CollectionsShowcase initialCollections={homeData.collections} />
      <TextAnimation />
      <ShowRoom />
    </main>
  );
}
