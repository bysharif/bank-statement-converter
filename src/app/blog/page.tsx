'use client'

import { ArrowRight, Calendar, User, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import Link from 'next/link';

interface Post {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  author: string;
  published: string;
  readTime: string;
  image: string;
  tags: string[];
}

const posts: Post[] = [
  {
    id: "post-1",
    slug: "hmrc-digital-tax-returns-bank-statements",
    title: "How to Convert Bank Statements for HMRC Digital Tax Returns",
    summary: "Learn the essential steps to prepare your bank statements for Making Tax Digital compliance, including format requirements and common pitfalls to avoid.",
    category: "Tax Compliance",
    author: "Sarah Mitchell",
    published: "15 Mar 2024",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop&crop=center",
    tags: ["Tax Compliance", "HMRC", "Digital Tax"],
  },
  {
    id: "post-2",
    slug: "ai-powered-bank-statement-conversion",
    title: "Why AI-Powered Bank Statement Conversion Beats Manual Processing",
    summary: "Discover how purpose-built AI delivers 99.6% accuracy compared to manual data entry, saving businesses hours of work and reducing costly errors.",
    category: "Automation",
    author: "James Thompson",
    published: "22 Mar 2024",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop&crop=center",
    tags: ["Automation", "AI Technology", "Efficiency"],
  },
  {
    id: "post-3",
    slug: "uk-bank-statement-formats-guide",
    title: "Complete Guide to Bank Statement Formats Across UK Banks",
    summary: "A comprehensive overview of statement formats from major UK banks including HSBC, Barclays, Lloyds, and digital banks like Monzo and Starling.",
    category: "Banking",
    author: "Michael Roberts",
    published: "28 Mar 2024",
    readTime: "12 min read",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop&crop=center",
    tags: ["Banking", "UK Banks", "File Formats"],
  },
  {
    id: "post-4",
    slug: "common-bank-statement-conversion-mistakes",
    title: "5 Common Mistakes When Converting Bank Statements",
    summary: "Avoid these frequent errors that can lead to inaccurate data, compliance issues, and wasted time when processing bank statement conversions.",
    category: "Best Practices",
    author: "Emma Wilson",
    published: "5 Apr 2024",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=450&fit=crop&crop=center",
    tags: ["Best Practices", "Tips", "Common Errors"],
  },
  {
    id: "post-5",
    slug: "automating-accounting-workflow",
    title: "Automating Your Accounting Workflow with Bank Statement Conversion",
    summary: "Discover how integrating automated bank statement conversion can streamline your entire accounting process and reduce month-end closing time.",
    category: "Workflow",
    author: "David Chen",
    published: "12 Apr 2024",
    readTime: "10 min read",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop&crop=center",
    tags: ["Workflow", "Automation", "Accounting"],
  },
  {
    id: "post-6",
    slug: "qif-vs-csv-export-formats",
    title: "Understanding QIF vs CSV: Which Format is Right for You?",
    summary: "Compare the pros and cons of different export formats and learn which one works best with your accounting software and workflow requirements.",
    category: "File Formats",
    author: "Lisa Parker",
    published: "20 Apr 2024",
    readTime: "9 min read",
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=450&fit=crop&crop=center",
    tags: ["File Formats", "QIF", "CSV", "Export"],
  }
];

const categories = ["All", "Tax Compliance", "Automation", "Banking", "Best Practices", "Workflow", "File Formats"];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-16 pb-8 bg-gradient-to-br from-uk-blue-50 via-white to-uk-green-50/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-uk-blue-50 to-uk-green-50 rounded-full border border-uk-blue-100 mb-6">
              <svg className="w-4 h-4 text-uk-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <span className="text-xs font-semibold text-uk-blue-700">Expert Insights</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Bank Statement Conversion Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Stay ahead with expert insights on bank statement conversion, financial automation, HMRC compliance, and accounting best practices from our team of specialists.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Categories */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={category === "All" ? "default" : "outline"}
                  className={`px-4 py-2 cursor-pointer transition-all hover:bg-uk-blue-50 ${
                    category === "All"
                      ? "bg-uk-blue-600 hover:bg-uk-blue-700 text-white"
                      : "hover:border-uk-blue-300 hover:text-uk-blue-700"
                  }`}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 bg-gray-50/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white">
                  <div className="relative overflow-hidden">
                    <Link href={`/blog/${post.slug}`}>
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    </Link>
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-uk-blue-600 hover:bg-uk-blue-700 text-white">
                        {post.category}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{post.published}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{post.author}</span>
                      </div>
                    </div>

                    <Link href={`/blog/${post.slug}`}>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-uk-blue-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.summary}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{post.readTime}</span>
                      <Link href={`/blog/${post.slug}`}>
                        <div className="inline-flex items-center text-uk-blue-600 hover:text-uk-blue-700 font-semibold group">
                          <span>Read more</span>
                          <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}