import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Heart, Target, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const About = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => setProfile(data));
      }
    });
  }, []);

  const values = [
    {
      icon: Target,
      title: "Mission-Driven",
      description: "We're committed to making quality education accessible to everyone, everywhere.",
    },
    {
      icon: Heart,
      title: "Student-Centered",
      description: "Every feature we build is designed with student success in mind.",
    },
    {
      icon: Users,
      title: "Community First",
      description: "We believe in the power of collaborative learning and peer support.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} profile={profile} />

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-6">
            <BookOpen className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Two Minds. One Mission — Smarter Learning.
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            TwinLearn was born from a simple belief: education should be accessible,
            engaging, and effective for everyone.
          </p>
        </div>

        {/* Story Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Founded by twin educators Shiva and Sharath, TwinLearn was born from a shared passion for innovation and a deep understanding of how students truly learn.
                </p>
                <p>
                  We noticed that traditional education often failed to leverage modern
                  technology effectively. Students were eager to learn but struggled with
                  one-size-fits-all approaches. Teachers wanted to do more but were constrained
                  by outdated tools.
                </p>
                <p>
                  TwinLearn bridges this gap by combining interactive video lectures, engaging
                  quizzes, and personalized progress tracking into one seamless platform. We
                  empower educators to create rich, multimedia courses while giving students
                  the flexibility to learn at their own pace.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-4">
                    <value.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Founders Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Meet the Founders</h2>
          <Card>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-16 w-16 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Golla shiva</h3>
                  <p className="text-muted-foreground mb-2">Co-Founder & CEO</p>
                  <p className="text-sm text-muted-foreground">
                    Shiva is a passionate educator who loves turning complex topics into simple, engaging lessons. With experience mentoring many students, 
                    he’s dedicated to helping learners grow with confidence.
                     Currently pursuing her B.Tech at Parul University, Shiva believes learning should be interactive, inspiring, and accessible to all.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-secondary rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-16 w-16 text-secondary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Golla Sharath</h3>
                  <p className="text-muted-foreground mb-2">Co-Founder & CTO</p>
                  <p className="text-sm text-muted-foreground">
                    Sharath is an enthusiastic teacher who combines creativity and technology to make learning exciting. 
                    Having mentored several students, he focuses on helping them think critically and learn with joy. 
                    A B.Tech student at Parul University, Sharath aims to build smarter, 
                    more connected education experiences through TwinLearn.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;