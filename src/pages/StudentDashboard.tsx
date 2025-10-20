import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import CourseCard from "@/components/CourseCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, TrendingUp, Award, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const StudentDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);
    
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (profileData?.role !== "student") {
      navigate("/staff-dashboard");
      return;
    }

    setProfile(profileData);
    fetchEnrollments(session.user.id);
  };

  const fetchEnrollments = async (userId: string) => {
    const { data, error } = await supabase
      .from("enrollments")
      .select(`
        *,
        courses (*)
      `)
      .eq("student_id", userId);

    if (error) {
      toast({
        title: "Error fetching enrollments",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setEnrollments(data || []);
    }
    setLoading(false);
  };

  const stats = [
    {
      icon: BookOpen,
      title: "Enrolled Courses",
      value: enrollments.length.toString(),
      color: "text-primary",
    },
    {
      icon: TrendingUp,
      title: "Average Progress",
      value: `${Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / (enrollments.length || 1))}%`,
      color: "text-secondary",
    },
    {
      icon: Award,
      title: "Completed",
      value: enrollments.filter(e => e.progress === 100).length.toString(),
      color: "text-green-500",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} profile={profile} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {profile?.full_name || "Student"}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Your Learning Journey Begins Here
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enrolled Courses */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">My Courses</h2>
            <a href="/courses" className="text-primary hover:underline">
              Browse all courses →
            </a>
          </div>

          {enrollments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start your learning journey by enrolling in a course
                </p>
                <a href="/courses">
                  <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                    Explore Courses
                  </button>
                </a>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {enrollments.map((enrollment) => (
                <Card key={enrollment.id} className="overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-1/3 aspect-video bg-gradient-primary">
                      {enrollment.courses.thumbnail_url ? (
                        <img 
                          src={enrollment.courses.thumbnail_url}
                          alt={enrollment.courses.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-primary-foreground/50" />
                        </div>
                      )}
                    </div>
                    <div className="md:w-2/3 p-6">
                      <CardHeader className="p-0 mb-4">
                        <CardTitle className="text-xl">{enrollment.courses.title}</CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {enrollment.courses.description}
                        </p>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-semibold">{enrollment.progress}%</span>
                          </div>
                          <Progress value={enrollment.progress} className="h-2" />
                        </div>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;