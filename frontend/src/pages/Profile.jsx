import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Building2, Calendar, Code, Lightbulb, X, Plus } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    branch: "",
    year: "",
    skills: [],
    area_of_interest: []
  });
  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");

  useEffect(() => {
    // Load profile from localStorage if exists
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
      loadProfile(savedEmail);
    }
  }, []);

  const loadProfile = async (email) => {
    try {
      const response = await axios.get(`${API}/profile/${email}`);
      setFormData(response.data);
    } catch (error) {
      console.log("No existing profile found");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addInterest = () => {
    if (interestInput.trim() && !formData.area_of_interest.includes(interestInput.trim())) {
      setFormData(prev => ({
        ...prev,
        area_of_interest: [...prev.area_of_interest, interestInput.trim()]
      }));
      setInterestInput("");
    }
  };

  const removeInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      area_of_interest: prev.area_of_interest.filter(i => i !== interest)
    }));
  };

  const handleKeyPress = (e, type) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'skill') {
        addSkill();
      } else {
        addInterest();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.branch || !formData.year) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.skills.length === 0) {
      toast.error("Please add at least one skill");
      return;
    }

    if (formData.area_of_interest.length === 0) {
      toast.error("Please add at least one area of interest");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/profile`, formData);
      localStorage.setItem("userEmail", formData.email);
      toast.success("Profile saved successfully!");
      setTimeout(() => {
        navigate("/recommendations");
      }, 1000);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-slate-900 dark:to-purple-950 transition-colors duration-300">
      <Navbar />

      {/* Profile Form */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="border-2 shadow-xl animate-fade-in">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Your Profile</CardTitle>
                <CardDescription>Tell us about yourself to get personalized recommendations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    data-testid="name-input"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    data-testid="email-input"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="h-11"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="branch" className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Branch/Department *
                    </Label>
                    <Input
                      id="branch"
                      name="branch"
                      data-testid="branch-input"
                      type="text"
                      placeholder="Computer Science"
                      value={formData.branch}
                      onChange={handleInputChange}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Year *
                    </Label>
                    <Input
                      id="year"
                      name="year"
                      data-testid="year-input"
                      type="text"
                      placeholder="2nd Year"
                      value={formData.year}
                      onChange={handleInputChange}
                      required
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Skills *
                </Label>
                <div className="flex gap-2">
                  <Input
                    data-testid="skill-input"
                    type="text"
                    placeholder="Add a skill (e.g., Python, React)"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, 'skill')}
                    className="h-11"
                  />
                  <Button
                    data-testid="add-skill-btn"
                    type="button"
                    onClick={addSkill}
                    variant="outline"
                    className="px-4"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        data-testid={`skill-badge-${index}`}
                        className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-3 py-1.5 flex items-center gap-2"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Areas of Interest */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Areas of Interest *
                </Label>
                <div className="flex gap-2">
                  <Input
                    data-testid="interest-input"
                    type="text"
                    placeholder="Add an interest (e.g., Machine Learning, Web Development)"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, 'interest')}
                    className="h-11"
                  />
                  <Button
                    data-testid="add-interest-btn"
                    type="button"
                    onClick={addInterest}
                    variant="outline"
                    className="px-4"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.area_of_interest.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.area_of_interest.map((interest, index) => (
                      <Badge
                        key={index}
                        data-testid={`interest-badge-${index}`}
                        className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1.5 flex items-center gap-2"
                      >
                        {interest}
                        <button
                          type="button"
                          onClick={() => removeInterest(interest)}
                          className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                data-testid="save-profile-btn"
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium text-base"
              >
                {loading ? "Saving..." : "Save Profile & Get Recommendations"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Profile;