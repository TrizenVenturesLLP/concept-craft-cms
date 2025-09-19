import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Star,
  StarOff,
  Plus,
  Download,
  Upload,
  RefreshCw,
  Archive
} from 'lucide-react';
import {
  problemService,
  ProblemStatement,
  ProblemFilters,
  DOMAINS,
  CATEGORIES,
  DIFFICULTIES,
  STATUSES
} from '@/services/problemService';

interface ProblemListProps {
  onEdit: (problem: ProblemStatement) => void;
  onCreate: () => void;
  onBulkUpload: () => void;
}

export function ProblemList({ onEdit, onCreate, onBulkUpload }: ProblemListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<ProblemFilters>({
    page: 1,
    limit: 10,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);

  // Fetch problems
  const { data: problemsData, isLoading, error, refetch } = useQuery({
    queryKey: ['problems', filters],
    queryFn: () => problemService.getProblems(filters),
  });

  // Fetch statistics
  const { data: statsData } = useQuery({
    queryKey: ['problem-stats'],
    queryFn: () => problemService.getProblemStats(),
  });

  // Update problem status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'Active' | 'Draft' | 'Archived' }) =>
      problemService.updateProblemStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      queryClient.invalidateQueries({ queryKey: ['problem-stats'] });
      toast({
        title: "Success",
        description: "Problem status updated successfully!",
      });
    },
    onError: (error: any) => {
      console.error('Status update error:', error);
      
      // Extract specific error message
      let errorMessage = "Failed to update problem status.";
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Toggle featured mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: (id: string) => problemService.toggleFeatured(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      queryClient.invalidateQueries({ queryKey: ['problem-stats'] });
      toast({
        title: "Success",
        description: "Featured status updated successfully!",
      });
    },
    onError: (error: any) => {
      console.error('Featured toggle error:', error);
      
      // Extract specific error message
      let errorMessage = "Failed to update featured status.";
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Delete problem mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => problemService.deleteProblem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      queryClient.invalidateQueries({ queryKey: ['problem-stats'] });
      toast({
        title: "Success",
        description: "Problem deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete problem.",
        variant: "destructive",
      });
    },
  });

  const problems = problemsData?.data || [];
  const totalPages = problemsData?.pages || 1;
  const currentPage = problemsData?.page || 1;
  const stats = statsData?.data;

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters(prev => ({
      ...prev,
      search: query || undefined,
      page: 1,
    }));
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof ProblemFilters, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value || undefined,
      page: 1,
    }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Handle bulk selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProblems(problems.map(p => p._id));
    } else {
      setSelectedProblems([]);
    }
  };

  const handleSelectProblem = (problemId: string, checked: boolean) => {
    if (checked) {
      setSelectedProblems(prev => [...prev, problemId]);
    } else {
      setSelectedProblems(prev => prev.filter(id => id !== problemId));
    }
  };

  // Handle status update
  const handleStatusUpdate = (id: string, status: 'Active' | 'Draft' | 'Archived') => {
    updateStatusMutation.mutate({ id, status });
  };

  // Handle featured toggle
  const handleFeaturedToggle = (id: string) => {
    toggleFeaturedMutation.mutate(id);
  };

  // Handle delete
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this problem statement?')) {
      deleteMutation.mutate(id);
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Draft': return 'secondary';
      case 'Archived': return 'outline';
      default: return 'secondary';
    }
  };

  // Get difficulty badge variant
  const getDifficultyBadgeVariant = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'default';
      case 'Intermediate': return 'secondary';
      case 'Advanced': return 'destructive';
      default: return 'secondary';
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-500 mb-4">Failed to load problems</p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Problem Statements</h1>
          <p className="text-gray-600">Manage and organize problem statements</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBulkUpload}>
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </Button>
          <Button onClick={onCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Problem
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Problems</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.overview.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.overview.draft}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Featured</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.overview.featured}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search problems..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Select
                value={filters.domain || ''}
                onValueChange={(value) => handleFilterChange('domain', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All domains" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All domains</SelectItem>
                  {DOMAINS.map((domain) => (
                    <SelectItem key={domain} value={domain}>
                      {domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={filters.difficulty || ''}
                onValueChange={(value) => handleFilterChange('difficulty', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All difficulties</SelectItem>
                  {DIFFICULTIES.map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status || ''}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Problems Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Problems ({problemsData?.total || 0})</CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedProblems.length === problems.length && problems.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-gray-500">Select All</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              Loading problems...
            </div>
          ) : problems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No problems found</p>
              <Button onClick={onCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Problem
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {problems.map((problem) => (
                    <TableRow key={problem._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProblems.includes(problem._id)}
                          onCheckedChange={(checked) => 
                            handleSelectProblem(problem._id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{problem.id}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="font-medium truncate">{problem.title}</p>
                          <p className="text-sm text-gray-500 truncate">
                            {problem.abstract.substring(0, 100)}...
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{problem.domain}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{problem.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getDifficultyBadgeVariant(problem.difficulty)}>
                          {problem.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(problem.status)}>
                          {problem.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {problem.featured ? (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        ) : (
                          <StarOff className="w-4 h-4 text-gray-400" />
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{problem.viewCount}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {new Date(problem.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(problem)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleFeaturedToggle(problem._id)}
                            >
                              {problem.featured ? (
                                <>
                                  <StarOff className="w-4 h-4 mr-2" />
                                  Unfeature
                                </>
                              ) : (
                                <>
                                  <Star className="w-4 h-4 mr-2" />
                                  Feature
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(problem._id, 'Active')}
                              disabled={problem.status === 'Active'}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Activate
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(problem._id, 'Draft')}
                              disabled={problem.status === 'Draft'}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Move to Draft
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(problem._id, 'Archived')}
                              disabled={problem.status === 'Archived'}
                            >
                              <Archive className="w-4 h-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(problem._id)}
                              className="text-red-600"
                            >
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
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
