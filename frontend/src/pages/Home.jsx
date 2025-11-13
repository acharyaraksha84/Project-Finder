import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, User, Sparkles, Github, FileText, Database, TrendingUp, Heart, BarChart3 } from "lucide-react";
import Navbar from "@/components/Navbar";

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Github,
      title: "GitHub Repositories",
      description: "Discover trending open-source projects from GitHub with real-time data"
    },
    {
      icon: FileText,
      title: "Research Papers",
      description: "Access cutting-edge research from arXiv and academic publications"
    },
    {
      icon: Database,
      title: "Datasets",
      description: "Find high-quality datasets for your machine learning projects"
    },
    {
      icon: Sparkles,
      title: "AI Recommendations",
      description: "Get personalized project suggestions based on your interests"
    },
    {
      icon: TrendingUp,
      title: "Novelty Scoring",
      description: "Each project rated for innovation and potential impact"
    },
    {
      icon: Heart,
      title: "Save Favorites",
      description: "Bookmark projects and build your personal collection"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-slate-900 dark:to-purple-950 transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8 animate-fade-in">
          <div className="inline-block">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl animate-float shadow-2xl">
              <Search className="w-16 h-16 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
            Discover Your Next
            <br />
            <span className="gradient-text">Amazing Project</span>
          </h1>
          
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore thousands of projects from GitHub repositories, cutting-edge research papers, 
            and valuable datasets. Find the perfect match for your skills and interests.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Button
              data-testid="create-profile-btn"
              onClick={() => navigate("/profile")}
              size="lg"
              className="h-14 px-8 text-base bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <User className="w-5 h-5 mr-2" />
              Create Profile
            </Button>
            
            <Button
              data-testid="explore-projects-btn"
              onClick={() => navigate("/explore")}
              size="lg"
              variant="outline"
              className="h-14 px-8 text-base font-semibold rounded-full border-2 border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 hover:scale-105"
            >
              <Search className="w-5 h-5 mr-2" />
              Explore Projects
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose <span className="gradient-text">Project Finder</span>?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Everything you need to discover, analyze, and track amazing projects
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                data-testid={`feature-card-${index}`}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-purple-300 dark:hover:border-purple-700 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-sm mt-2">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers, researchers, and innovators discovering their next big project
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-purple-100">GitHub Projects</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5K+</div>
              <div className="text-purple-100">Research Papers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1K+</div>
              <div className="text-purple-100">Datasets</div>
            </div>
          </div>
          <Button
            data-testid="get-started-btn"
            onClick={() => navigate("/explore")}
            size="lg"
            className="mt-8 h-14 px-8 bg-white text-purple-600 hover:bg-gray-100 font-semibold rounded-full shadow-lg transition-all duration-300 hover:scale-105"
          >
            Get Started Now
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;