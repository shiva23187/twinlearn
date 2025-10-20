import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import CourseCard from "@/components/CourseCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Courses = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [searchQuery, courses]);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      setUser(session.user);
      
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      
      setProfile(profileData);

      if (profileData?.role === "student") {
        const { data: enrollmentData } = await supabase
          .from("enrollments")
          .select("course_id")
          .eq("student_id", session.user.id);
        
        setEnrollments(enrollmentData || []);
      }
    }

    const { data: coursesData, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error loading courses",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setCourses(coursesData || []);
      setFilteredCourses(coursesData || []);
    }
    
    setLoading(false);
  };

  const filterCourses = () => {
    if (!searchQuery.trim()) {
      setFilteredCourses(courses);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = courses.filter(
      (course) =>
        course.title.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query) ||
        course.subject?.toLowerCase().includes(query) ||
        course.level?.toLowerCase().includes(query)
    );
    setFilteredCourses(filtered);
  };

  const handleEnroll = async (courseId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (profile?.role !== "student") {
      toast({
        title: "Only students can enroll",
        description: "Staff members cannot enroll in courses",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("enrollments")
      .insert([
        {
          student_id: user.id,
          course_id: courseId,
        },
      ]);

    if (error) {
      toast({
        title: "Enrollment failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Successfully enrolled!",
        description: "Check your dashboard to start learning",
      });
      loadData();
    }
  };

  const isEnrolled = (courseId: string) => {
    return enrollments.some((e) => e.course_id === courseId);
  };

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
          <h1 className="text-4xl font-bold mb-2">Explore Courses</h1>
          <p className="text-muted-foreground text-lg">
            Explore, Learn, and Grow with TwinLearn.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search courses by title, subject, or level..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">
                {searchQuery ? "No courses found matching your search" : "No courses available yet"}
              </p>
            </div>
          ) : (
            filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEnroll={() => handleEnroll(course.id)}
                isEnrolled={isEnrolled(course.id)}
                showEnrollButton={profile?.role === "student"}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;