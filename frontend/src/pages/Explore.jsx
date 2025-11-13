import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Heart, ExternalLink, Github, FileText, Database, Filter, Star } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

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

  const searchProjects = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API}/projects/search`, {
        params: {
          query: searchQuery,
          source: sourceFilter === "all" ? null : sourceFilter,
          level: levelFilter === "all" ? null : levelFilter
        }
      });
      setProjects(response.data);
      if (response.data.length === 0) {
        toast.info("No projects found. Try different keywords.");
      }
    } catch (error) {
      console.error("Error searching projects:", error);
      toast.error("Failed to search projects");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchProjects();
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

      {/* Search Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-6 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
            Explore <span className="gradient-text">Projects</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Search across GitHub repositories, research papers, and datasets
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mt-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  data-testid="search-input"
                  type="text"
                  placeholder="Search for projects (e.g., machine learning, web development...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="h-12 text-base px-6 rounded-full border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-500"
                />
              </div>
              <Button
                data-testid="search-btn"
                onClick={searchProjects}
                disabled={loading}
                className="h-12 px-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium"
              >
                {loading ? "Searching..." : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Filters:</span>
              </div>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger data-testid="source-filter" className="w-[140px] rounded-full">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="github">GitHub</SelectItem>
                  <SelectItem value="paper">Papers</SelectItem>
                  <SelectItem value="dataset">Datasets</SelectItem>
                </SelectContent>
              </Select>

              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger data-testid="level-filter" className="w-[140px] rounded-full">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      {projects.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              Found <span className="font-semibold text-purple-600 dark:text-purple-400">{projects.length}</span> projects
            </p>
          </div>
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
              <Search className="w-12 h-12 text-purple-500 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Start Your Search
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Enter keywords to discover amazing projects from GitHub, research papers, and datasets.
            </p>
          </div>
        </section>
      )}
    </div>
  );
};

export default Explore;