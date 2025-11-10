import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  summary: string;
  label: string;
  author: string;
  published: string;
  url: string;
  image: string;
  tags?: string[];
}

interface BlogSectionProps {
  heading?: string;
  description?: string;
  posts?: Post[];
}

const BlogSection = ({
  heading = "Latest Insights",
  description = "Discover expert insights on bank statement conversion, financial automation, and accounting best practices.",
  posts = [
    {
      id: "post-1",
      title: "How to Convert Bank Statements for HMRC Digital Tax Returns",
      summary: "Learn the essential steps to prepare your bank statements for Making Tax Digital compliance, including format requirements and common pitfalls to avoid.",
      label: "Tax Compliance",
      author: "Sarah Mitchell",
      published: "15 Mar 2024",
      url: "#",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop&crop=center",
      tags: ["Tax Compliance", "HMRC"],
    },
    {
      id: "post-2",
      title: "Why AI-Powered Bank Statement Conversion Beats Manual Processing",
      summary: "Discover how purpose-built AI delivers 99.6% accuracy compared to manual data entry, saving businesses hours of work and reducing costly errors.",
      label: "Automation",
      author: "James Thompson",
      published: "22 Mar 2024",
      url: "#",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop&crop=center",
      tags: ["Automation", "AI Technology"],
    },
  ],
}: BlogSectionProps) => {
  return (
    <section id="blog" className="py-12 lg:py-16 bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-uk-blue-50 to-uk-green-50 rounded-full border border-uk-blue-100 mb-4">
            <svg className="w-4 h-4 text-uk-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <span className="text-xs font-semibold text-uk-blue-700">Blog</span>
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-3">
            {heading}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {description}
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid gap-y-10 sm:grid-cols-12 sm:gap-y-12 md:gap-y-16 lg:gap-y-20">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="order-last border-0 bg-transparent shadow-none sm:order-first sm:col-span-12 lg:col-span-10 lg:col-start-2"
              >
                <div className="grid gap-y-6 sm:grid-cols-10 sm:gap-x-5 sm:gap-y-0 md:items-center md:gap-x-8 lg:gap-x-12">
                  <div className="sm:col-span-5">
                    <div className="mb-4 md:mb-6">
                      <div className="flex flex-wrap gap-3 text-xs tracking-wider text-gray-500 uppercase md:gap-5 lg:gap-6">
                        {post.tags?.map((tag) => <span key={tag}>{tag}</span>)}
                      </div>
                    </div>
                    <Link href={post.url}>
                      <h3 className="text-xl font-semibold md:text-2xl lg:text-3xl hover:underline text-gray-900 cursor-pointer">
                        {post.title}
                      </h3>
                    </Link>
                    <Link href={post.url}>
                      <p className="mt-4 text-gray-600 md:mt-5 hover:text-gray-900 cursor-pointer">
                        {post.summary}
                      </p>
                    </Link>
                    <div className="mt-6 flex items-center space-x-4 text-sm md:mt-8">
                      <span className="text-gray-500">{post.author}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-500">
                        {post.published}
                      </span>
                    </div>
                    <div className="mt-6 flex items-center space-x-2 md:mt-8">
                      <Link
                        href={post.url}
                        className="inline-flex items-center font-semibold hover:underline md:text-base text-uk-blue-600 hover:text-uk-blue-700"
                      >
                        <span>Read more</span>
                        <ArrowRight className="ml-2 size-4 transition-transform" />
                      </Link>
                    </div>
                  </div>
                  <div className="order-first sm:order-last sm:col-span-5">
                    <Link href={post.url} className="block">
                      <div className="aspect-video overflow-clip rounded-lg border border-gray-200 cursor-pointer">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="h-full w-full object-cover transition-opacity duration-200 hover:opacity-70"
                        />
                      </div>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* View All Blog Posts Button */}
          <div className="text-center mt-12">
            <Link href="/blog">
              <Button className="bg-uk-blue-600 hover:bg-uk-blue-700 text-white px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg">
                View All Blog Posts
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export { BlogSection };