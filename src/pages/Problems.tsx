import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import { CategoryBadge } from "@/components/ui/category-badge";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Filter,
  MoreHorizontal,
  Archive
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockProblems = [
  {
    id: "AIM001",
    title: "AI-Powered Student Assessment System",
    domain: "Artificial Intelligence",
    category: "major" as const,
    difficulty: "advanced" as const,
    status: "active" as const,
    featured: true,
    lastUpdated: "2024-01-15",
    technologies: ["Python", "TensorFlow", "React"],
  },
  {
    id: "WEB012",
    title: "E-commerce Platform with AR Integration",
    domain: "Web Development",
    category: "capstone" as const,
    difficulty: "intermediate" as const,
    status: "draft" as const,
    featured: false,
    lastUpdated: "2024-01-14",
    technologies: ["Next.js", "Three.js", "WebXR"],
  },
  {
    id: "IOT005",
    title: "Smart Campus Energy Management",
    domain: "IoT",
    category: "minor" as const,
    difficulty: "beginner" as const,
    status: "active" as const,
    featured: true,
    lastUpdated: "2024-01-13",
    technologies: ["Arduino", "LoRa", "Node.js"],
  },
];

export default function Problems() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");

  const filteredProblems = mockProblems.filter((problem) => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || problem.status === statusFilter;
    const matchesDomain = domainFilter === "all" || problem.domain === domainFilter;
    
    return matchesSearch && matchesStatus && matchesDomain;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Problem Statements</h1>
          <p className="text-muted-foreground">
            Manage and organize your problem statements
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover">
          <Plus className="w-4 h-4 mr-2" />
          Add New Problem
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID, title, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={domainFilter} onValueChange={setDomainFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                <SelectItem value="Artificial Intelligence">AI</SelectItem>
                <SelectItem value="Web Development">Web Dev</SelectItem>
                <SelectItem value="IoT">IoT</SelectItem>
                <SelectItem value="Mobile">Mobile</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredProblems.length} of {mockProblems.length} problem statements
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Problems Table */}
      <Card className="shadow-sm border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProblems.map((problem) => (
                <TableRow key={problem.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-sm">
                    {problem.id}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{problem.title}</p>
                      <div className="flex gap-1 mt-1">
                        {problem.technologies.slice(0, 2).map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {problem.technologies.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{problem.technologies.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {problem.domain}
                  </TableCell>
                  <TableCell>
                    <CategoryBadge category={problem.category} />
                  </TableCell>
                  <TableCell>
                    <DifficultyBadge difficulty={problem.difficulty} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={problem.status} />
                  </TableCell>
                  <TableCell>
                    {problem.featured ? (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    ) : (
                      <Star className="w-4 h-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {problem.lastUpdated}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page 1 of 1 (20 items per page)
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}