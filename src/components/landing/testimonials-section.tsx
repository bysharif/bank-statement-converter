'use client'

import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Users } from "lucide-react"

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-12 lg:py-16 bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-uk-blue-50 to-uk-green-50 rounded-full border border-uk-blue-100 mb-4">
            <Users className="w-4 h-4 text-uk-blue-600" />
            <span className="text-xs font-semibold text-uk-blue-700">Customer Stories</span>
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-3">
            What people think
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto whitespace-nowrap">
            Finance teams love our speed and accuracy
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 items-stretch gap-x-0 gap-y-4 lg:grid-cols-3 lg:gap-4">
              <div className="h-72 w-full rounded-md bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex flex-col justify-center lg:h-auto">
                {/* Mock Dashboard Preview */}
                <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-900">HSBC Statement</div>
                    <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Processed</div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-xs">
                    <span className="text-gray-600">1,247 transactions</span>
                    <span className="text-uk-blue-600 font-medium">99.6% accuracy</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="text-xs bg-uk-blue-50 text-uk-blue-700 px-2 py-1 rounded">CSV</div>
                    <div className="text-xs bg-uk-blue-50 text-uk-blue-700 px-2 py-1 rounded">QIF</div>
                    <div className="text-xs bg-uk-blue-50 text-uk-blue-700 px-2 py-1 rounded">Excel</div>
                  </div>
                </div>
              </div>
              <Card className="col-span-2 flex items-center justify-center p-6">
                <div className="flex flex-col gap-4">
                  <q className="text-xl font-medium lg:text-3xl">
                    Reduced our month-end close from 3 days to 3 hours. The AI accuracy is incredible - caught errors our previous manual process missed. No more weekend work!
                  </q>
                  <div className="flex flex-col items-start">
                    <p className="font-semibold">Sarah Chen</p>
                    <p className="text-muted-foreground">Finance Director</p>
                  </div>
                </div>
              </Card>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card>
                <CardContent className="px-6 pt-6 leading-7 text-foreground/70">
                  <q>
                    Game changer for our HMRC submissions. What used to take our bookkeeper half a day now takes 30 seconds. ROI paid for itself in the first month.
                  </q>
                </CardContent>
                <CardFooter>
                  <div className="flex gap-4 leading-5">
                    <Avatar className="size-9 rounded-full ring-1 ring-input">
                      <AvatarImage
                        src="/testimonial-james.jpg"
                        alt="James Mitchell"
                      />
                    </Avatar>
                    <div className="text-sm">
                      <p className="font-medium">James Mitchell</p>
                      <p className="text-muted-foreground">Senior Accountant</p>
                    </div>
                  </div>
                </CardFooter>
              </Card>
              <Card>
                <CardContent className="px-6 pt-6 leading-7 text-foreground/70">
                  <q>
                    The speed is unreal. Processes thousands of transactions in seconds with perfect accuracy. Our accountant was amazed at the format compatibility.
                  </q>
                </CardContent>
                <CardFooter>
                  <div className="flex gap-4 leading-5">
                    <Avatar className="size-9 rounded-full ring-1 ring-input">
                      <AvatarImage
                        src="/testimonial-emeka.jpg"
                        alt="David Ade"
                      />
                    </Avatar>
                    <div className="text-sm">
                      <p className="font-medium">David Ade</p>
                      <p className="text-muted-foreground">Business Owner</p>
                    </div>
                  </div>
                </CardFooter>
              </Card>
              <Card>
                <CardContent className="px-6 pt-6 leading-7 text-foreground/70">
                  <q>
                    Finally, a solution that works with all our UK bank formats. No more manual data entry or format conversion headaches. Seamless workflow integration.
                  </q>
                </CardContent>
                <CardFooter>
                  <div className="flex gap-4 leading-5">
                    <Avatar className="size-9 rounded-full ring-1 ring-input">
                      <AvatarImage
                        src="/testimonial-anna.jpg"
                        alt="Emma Thompson"
                      />
                    </Avatar>
                    <div className="text-sm">
                      <p className="font-medium">Emma Thompson</p>
                      <p className="text-muted-foreground">CFO</p>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}