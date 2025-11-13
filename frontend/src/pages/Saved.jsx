import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ExternalLink, Github, FileText, Database, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

const Saved = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  };

  const removeFavorite = (projectId) => {
    const newFavorites = favorites.filter(fav => fav.id !== projectId);
    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
    toast.success("Removed from favorites");
  };

  const clearAll = () => {
    if (window.confirm("Are you sure you want to clear all favorites?")) {
      setFavorites([]);
      localStorage.setItem("favorites", JSON.stringify([]));
      toast.success("All favorites cleared");
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-slate-900 dark:to-purple-950 transition-colors duration-300">
      <Navbar />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                  Saved <span className="gradient-text">Projects</span>
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {favorites.length} {favorites.length === 1 ? 'project' : 'projects'} saved
                </p>
              </div>
            </div>

            {favorites.length > 0 && (
              <Button
                data-testid="clear-all-btn"
                variant="destructive"
                onClick={clearAll}
                className="rounded-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          {/* Projects Grid */}
          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((project, index) => (
                <Card
                  key={project.id}
                  data-testid={`saved-card-${index}`}
                  className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-purple-300 dark:hover:border-purple-700"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {project.title}
                        </CardTitle>
                      </div>
                      <Button
                        data-testid={`remove-btn-${index}`}
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFavorite(project.id)}
                        className="flex-shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-5 h-5" />
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
              ))}
            </div>
          ) : (
            <Card className="border-2 border-dashed">
              <CardContent className="py-16">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
                    <Heart className="w-12 h-12 text-red-500 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      No Saved Projects Yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      Start exploring projects and save your favorites to see them here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
};

export default Saved;