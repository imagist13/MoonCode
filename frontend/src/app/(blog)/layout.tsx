import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MusicPlayer from "@/components/player/MusicPlayer";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="blog-theme flex min-h-screen flex-col bg-blog-bg text-blog-ink">
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-14">{children}</div>
      </main>
      <Footer />
      <MusicPlayer />
    </div>
  );
}