import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Users, Plus, Video, FileEdit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CourseCard from "@/components/CourseCard";

const StaffDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    level: "",
    video_url: "",
    thumbnail_url: "",
  });
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

    if (profileData?.role !== "staff") {
      navigate("/student-dashboard");
      return;
    }

    setProfile(profileData);
    fetchCourses(session.user.id);
  };

  const fetchCourses = async (userId: string) => {
    const { data, error } = await supabase
      .from("courses")
      .select(`
        *,
        enrollments (count)
      `)
      .eq("instructor_id", userId);

    if (error) {
      toast({
        title: "Error fetching courses",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setCourses(data || []);
    }
    setLoading(false);
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from("courses")
      .insert([
        {
          ...formData,
          instructor_id: user?.id,
        },
      ]);

    if (error) {
      toast({
        title: "Error creating course",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Course created successfully!",
      });
      setDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        subject: "",
        level: "",
        video_url: "",
        thumbnail_url: "",
      });
      fetchCourses(user?.id);
    }
  };

  const stats = [
    {
      icon: BookOpen,
      title: "Total Courses",
      value: courses.length.toString(),
      color: "text-primary",
    },
    {
      icon: Users,
      title: "Total Students",
      value: courses.reduce((acc, c) => acc + (c.enrollments?.[0]?.count || 0), 0).toString(),
      color: "text-secondary",
    },
    {
      icon: Video,
      title: "Videos Uploaded",
      value: courses.filter(c => c.video_url).length.toString(),
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome, {profile?.full_name || "Instructor"}! 👨‍🏫
            </h1>
            <p className="text-muted-foreground text-lg">
              Empower Students. Share Knowledge.
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Create Course
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleCreateCourse}>
                <DialogHeader>
                  <DialogTitle>Create New Course</DialogTitle>
                  <DialogDescription>
                    Add a new course to your teaching portfolio
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Course Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        placeholder="e.g., Mathematics"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="level">Level</Label>
                      <Input
                        id="level"
                        value={formData.level}
                        onChange={(e) => setFormData({...formData, level: e.target.value})}
                        placeholder="e.g., Beginner"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="video_url">Video URL (optional)</Label>
                    <Input
                      id="video_url"
                      type="url"
                      value={formData.video_url}
                      onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thumbnail_url">Thumbnail URL (optional)</Label>
                    <Input
                      id="thumbnail_url"
                      type="url"
                      value={formData.thumbnail_url}
                      onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Course</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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

        {/* My Courses */}
        <div>
          <h2 className="text-2xl font-bold mb-6">My Courses</h2>
          
          {courses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileEdit className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first course to start teaching
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  showEnrollButton={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;