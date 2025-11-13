import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Heart, Search, TrendingUp, Github, FileText, Database } from "lucide-react";
import Navbar from "@/components/Navbar";

const Analytics = () => {
  const [favorites, setFavorites] = useState([]);
  const [stats, setStats] = useState({
    totalFavorites: 0,
    bySource: { github: 0, paper: 0, dataset: 0 },
    byLevel: { easy: 0, intermediate: 0, advanced: 0 },
    avgNovelty: 0
  });

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      const favs = JSON.parse(savedFavorites);
      setFavorites(favs);
      calculateStats(favs);
    }
  }, []);

  const calculateStats = (favs) => {
    const bySource = { github: 0, paper: 0, dataset: 0 };
    const byLevel = { easy: 0, intermediate: 0, advanced: 0 };
    let totalNovelty = 0;

    favs.forEach(fav => {
      if (bySource[fav.source] !== undefined) {
        bySource[fav.source]++;
      }
      if (byLevel[fav.level] !== undefined) {
        byLevel[fav.level]++;
      }
      totalNovelty += fav.novelty_score;
    });

    setStats({
      totalFavorites: favs.length,
      bySource,
      byLevel,
      avgNovelty: favs.length > 0 ? (totalNovelty / favs.length).toFixed(1) : 0
    });
  };

  const StatCard = ({ icon: Icon, title, value, color, testId }) => (
    <Card className="hover:shadow-lg transition-all duration-300" data-testid={testId}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardDescription className="text-sm">{title}</CardDescription>
            <CardTitle className="text-3xl font-bold mt-2">{value}</CardTitle>
          </div>
          <div className={`p-3 ${color} rounded-xl`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardHeader>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-slate-900 dark:to-purple-950 transition-colors duration-300">
      <Navbar />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                Your <span className="gradient-text">Analytics</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Track your project exploration journey
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Heart}
              title="Total Favorites"
              value={stats.totalFavorites}
              color="bg-gradient-to-br from-red-500 to-pink-500"
              testId="stat-total-favorites"
            />
            <StatCard
              icon={Github}
              title="GitHub Projects"
              value={stats.bySource.github}
              color="bg-gradient-to-br from-purple-500 to-indigo-500"
              testId="stat-github"
            />
            <StatCard
              icon={FileText}
              title="Research Papers"
              value={stats.bySource.paper}
              color="bg-gradient-to-br from-blue-500 to-cyan-500"
              testId="stat-papers"
            />
            <StatCard
              icon={Database}
              title="Datasets"
              value={stats.bySource.dataset}
              color="bg-gradient-to-br from-green-500 to-emerald-500"
              testId="stat-datasets"
            />
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Level */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  Projects by Difficulty
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        Easy
                      </Badge>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {stats.byLevel.easy} projects
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.byLevel.easy}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                        Intermediate
                      </Badge>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {stats.byLevel.intermediate} projects
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.byLevel.intermediate}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        Advanced
                      </Badge>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {stats.byLevel.advanced} projects
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.byLevel.advanced}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Average Novelty */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-purple-500" />
                  Quality Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold gradient-text mb-2">
                      {stats.avgNovelty}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Average Novelty Score
                    </p>
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Saved</span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {stats.totalFavorites} projects
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Empty State */}
          {stats.totalFavorites === 0 && (
            <Card className="border-2 border-dashed">
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center">
                    <Heart className="w-8 h-8 text-purple-500 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      No Data Yet
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Start exploring and saving projects to see your analytics
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

export default Analytics;