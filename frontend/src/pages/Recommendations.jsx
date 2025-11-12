import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Moon, Sun, ArrowLeft, Heart, ExternalLink, Github, FileText, Database, Star, Sparkles, User } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Recommendations = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    setMounted(true);
    loadRecommendations();
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const loadRecommendations = async () => {
    const email = localStorage.getItem("userEmail");
    
    if (!email) {
      toast.error("Please create your profile first");
      setTimeout(() => navigate("/profile"), 1500);
      return;
    }

    setLoading(true);
    try {
      // Fetch user profile
      const profileResponse = await axios.get(`${API}/profile/${email}`);
      setUserProfile(profileResponse.data);

      // Fetch recommendations
      const response = await axios.get(`${API}/projects/recommendations`, {
        params: { email }
      });
      setProjects(response.data);
      
      if (response.data.length === 0) {
        toast.info("No recommendations found. Try updating your profile.");
      }
    } catch (error) {
      console.error("Error loading recommendations:", error);
      if (error.response?.status === 404) {
        toast.error("Profile not found. Please create your profile first.");
        setTimeout(() => navigate("/profile"), 1500);
      } else {
        toast.error("Failed to load recommendations");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (project) => {
    let newFavorites;
    const isFavorite = favorites.some(fav => fav.id === project.id);
    
    if (isFavorite) {
      newFavorites = favorites.filter(fav => fav.id !== project.id);
      toast.success("Removed from favorites");
    } else {
      newFavorites = [...favorites, project];
      toast.success("Added to favorites");
    }
    
    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case "github":
        return <Github className="w-4 h-4" />;
      case "paper":
        return <FileText className="w-4 h-4" />;
      case "dataset":
        return <Database className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getSourceColor = (source) => {
    switch (source) {
      case "github":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
      case "paper":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "dataset":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case "easy":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "intermediate":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "advanced":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-slate-900 dark:to-purple-950 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-950/70 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              data-testid="back-btn"
              variant="ghost"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
            
            <div className="flex items-center gap-3">
              <Button
                data-testid="profile-btn"
                variant="ghost"
                onClick={() => navigate("/profile")}
                className="hidden sm:flex"
              >
                <User className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button
                data-testid="theme-toggle-btn"
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex items-center justify-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl animate-float">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              Your <span className="gradient-text">Personalized</span> Recommendations
            </h2>
          </div>
          
          {userProfile && (
            <div className="max-w-3xl mx-auto">
              <p className="text-base text-gray-600 dark:text-gray-400">
                Based on your interests in{" "}
                <span className="font-semibold text-purple-600 dark:text-purple-400">
                  {userProfile.area_of_interest.join(", ")}
                </span>
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                {userProfile.skills.map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your recommendations...</p>
          </div>
        </section>
      )}

      {/* Projects Grid */}
      {!loading && projects.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => {
              const isFavorite = favorites.some(fav => fav.id === project.id);
              return (
                <Card
                  key={project.id}
                  data-testid={`project-card-${index}`}
                  className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in border-2 hover:border-purple-300 dark:hover:border-purple-700"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {project.title}
                        </CardTitle>
                      </div>
                      <Button
                        data-testid={`favorite-btn-${index}`}
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavorite(project)}
                        className="flex-shrink-0"
                      >
                        <Heart
                          className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                        />
                      </Button>
                    </div>
                    <CardDescription className="line-clamp-3 text-sm mt-2">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge className={`${getSourceColor(project.source)} flex items-center gap-1`}>
                          {getSourceIcon(project.source)}
                          {project.source}
                        </Badge>
                        <Badge className={getLevelColor(project.level)}>
                          {project.level}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {project.novelty_score}/10
                        </Badge>
                      </div>

                      {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {project.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {project.stars && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {project.stars.toLocaleString()} stars
                        </div>
                      )}

                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid={`project-link-${index}`}
                        className="inline-flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:underline font-medium"
                      >
                        View Project
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!loading && projects.length === 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-purple-500 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              No Recommendations Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Update your profile with more skills and interests to get better recommendations.
            </p>
            <Button
              onClick={() => navigate("/profile")}
              className="mt-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
            >
              Update Profile
            </Button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Recommendations;