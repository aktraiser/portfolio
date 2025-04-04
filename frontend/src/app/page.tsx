import { ChatInput } from '../components/ChatInput';
import TrustLogos from '../components/TrustLogos';
import BlogPosts from '../components/BlogPosts';
import Blog from '../components/Blog';
import CTABanner from '../components/CTABanner';
import Expertise from '../components/Expertise';

export default function Home() {
  return (
    <div className="bg-black">
      <div className="bg-black max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="mb-12">
          <ChatInput />
        </section>

      </div>

      <BlogPosts />
      <Blog />


    </div>
  );
}
