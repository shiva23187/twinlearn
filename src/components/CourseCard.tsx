import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock } from "lucide-react";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail_url?: string;
    subject?: string;
    level?: string;
  };
  onEnroll?: () => void;
  isEnrolled?: boolean;
  showEnrollButton?: boolean;
}

const CourseCard = ({ course, onEnroll, isEnrolled, showEnrollButton = true }: CourseCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-video bg-gradient-primary relative overflow-hidden">
        {course.thumbnail_url ? (
          <img 
            src={course.thumbnail_url} 
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="h-16 w-16 text-primary-foreground/50" />
          </div>
        )}
      </div>
      
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-xl">{course.title}</CardTitle>
          {isEnrolled && (
            <Badge variant="secondary" className="shrink-0">Enrolled</Badge>
          )}
        </div>
        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {course.subject && (
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{course.subject}</span>
            </div>
          )}
          {course.level && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{course.level}</span>
            </div>
          )}
        </div>
      </CardContent>

      {showEnrollButton && !isEnrolled && (
        <CardFooter>
          <Button onClick={onEnroll} className="w-full">
            Enroll Now
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default CourseCard;