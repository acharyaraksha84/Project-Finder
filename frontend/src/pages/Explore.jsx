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

  // Load favorites
  useEffect(() => {
    const saved = localStorage.getItem("favorites");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const toggleFavorite = (project) => {
    let updated;
    const exists = favorites.some((fav) => fav.id === project.id);

    if (exists) {
      updated = favorites.filter((fav) => fav.id !== project.id);
      toast.success("Removed from favorites");
    } else {
      updated = [...favorites, project];
      toast.success("Added to favorites");
    }

    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  // ⭐ Correct search function — ONLY uses backend
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
        toast.info("No projects or papers found.");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Failed to search");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") searchProjects();
  };

  // Icons
  const getSourceIcon = (source) => ({
    github: <Github className="w-4 h-4" />,
    paper: <FileText className="w-4 h-4" />,
    dataset: <Database className="w-4 h-4" />
  }[source]);

  // Colors
  const getSourceColor = (source) => ({
    github: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    paper: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    dataset: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  }[source] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300");

  const getLevelColor = (level) => ({
    easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
  }[level] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-slate-900 dark:to-purple-950 transition-colors duration-300">
      <Navbar />

      {/* Search Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-6">
          <h2 className="text-4xl sm:text-5xl font-bold">
            Explore <span className="gradient-text">Projects & Papers</span>
          </h2>

          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Search GitHub repositories, research papers and datasets.
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mt-8 flex flex-col sm:flex-row gap-3">
            <Input
              type="text"
              placeholder="Search for projects (e.g., machine learning, AI, web...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="h-12 px-6 rounded-full"
            />

            <Button
              onClick={searchProjects}
              disabled={loading}
              className="h-12 px-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
            >
              {loading ? "Searching..." : <><Search className="w-5 h-5 mr-2" />Search</>}
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Filters</span>
            </div>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[140px] rounded-full">
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
              <SelectTrigger className="w-[140px] rounded-full">
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
      </section>

      {/* Results */}
      {projects.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Found <span className="font-semibold">{projects.length}</span> results
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => {
              const fav = favorites.some((f) => f.id === project.id);

              return (
                <Card key={index} className="group hover:shadow-xl border rounded-xl transition">
                  <CardHeader>
                    <div className="flex justify-between">
                      <CardTitle className="line-clamp-2">{project.title}</CardTitle>

                      <Button variant="ghost" size="icon" onClick={() => toggleFavorite(project)}>
                        <Heart className={`w-5 h-5 ${fav ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                      </Button>
                    </div>

                    <CardDescription className="mt-2 line-clamp-3">
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
                      </div>

                      {/* Tags (Authors for papers) */}
                      {project.tags && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {project.tags.join(", ")}
                        </div>
                      )}

                      {/* Stars for GitHub */}
                      {project.stars && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Star className="w-4 h-4 text-yellow-400" /> {project.stars}
                        </div>
                      )}

                      {/* Link */}
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-purple-600 hover:underline"
                      >
                        View {project.source === "paper" ? "Paper" : "Project"}
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
        <section className="text-center py-16">
          <Search className="w-16 h-16 mx-auto text-purple-500" />
          <h3 className="text-xl font-semibold mt-3">Start Your Search</h3>
          <p className="text-gray-500">Search GitHub projects, research papers & datasets.</p>
        </section>
      )}
    </div>
  );
};

export default Explore;
