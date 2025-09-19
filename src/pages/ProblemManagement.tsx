import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye,
  Star,
  FileText,
  Calendar
} from 'lucide-react';
import { ProblemForm } from '@/components/problems/ProblemForm';
import { ProblemList } from '@/components/problems/ProblemList';
import { BulkUpload } from '@/components/problems/BulkUpload';
import { 
  problemService, 
  ProblemStatement, 
  CreateProblemData, 
  UpdateProblemData 
} from '@/services/problemService';

type ViewMode = 'list' | 'create' | 'edit' | 'bulk-upload';

export default function ProblemManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingProblem, setEditingProblem] = useState<ProblemStatement | null>(null);

  // Fetch statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['problem-stats'],
    queryFn: () => problemService.getProblemStats(),
  });

  // Create problem mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateProblemData) => problemService.createProblem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      queryClient.invalidateQueries({ queryKey: ['problem-stats'] });
      setViewMode('list');
      toast({
        title: "Success",
        description: "Problem statement created successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create problem statement",
        variant: "destructive",
      });
    },
  });

  // Update problem mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProblemData }) => 
      problemService.updateProblem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      queryClient.invalidateQueries({ queryKey: ['problem-stats'] });
      setViewMode('list');
      setEditingProblem(null);
      toast({
        title: "Success",
        description: "Problem statement updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update problem statement",
        variant: "destructive",
      });
    },
  });

  const stats = statsData?.data;

  const handleCreate = () => {
    setEditingProblem(null);
    setViewMode('create');
  };

  const handleEdit = (problem: ProblemStatement) => {
    setEditingProblem(problem);
    setViewMode('edit');
  };

  const handleBulkUpload = () => {
    setViewMode('bulk-upload');
  };

  const handleCancel = () => {
    setViewMode('list');
    setEditingProblem(null);
  };

  const handleSubmit = async (data: CreateProblemData) => {
    if (editingProblem) {
      await updateMutation.mutateAsync({ id: editingProblem._id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleBulkUploadClose = () => {
    setViewMode('list');
  };

  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <div className="container mx-auto py-6">
        <ProblemForm
          problem={editingProblem || undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMutation.isPending || updateMutation.isPending}
          mode={viewMode}
        />
      </div>
    );
  }

  if (viewMode === 'bulk-upload') {
    return <BulkUpload onClose={handleBulkUploadClose} />;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Problem Management</h1>
          <p className="text-gray-600">Manage and organize problem statements for final year projects</p>
        </div>
      </div>

      {/* Statistics Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Problems</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.total}</div>
              <p className="text-xs text-muted-foreground">
                All problem statements
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Problems</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.overview.active}</div>
              <p className="text-xs text-muted-foreground">
                Published and visible
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Featured Problems</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.overview.featured}</div>
              <p className="text-xs text-muted-foreground">
                Highlighted problems
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.overview.totalViews}</div>
              <p className="text-xs text-muted-foreground">
                Across all problems
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Domain Distribution */}
      {stats?.domainDistribution && stats.domainDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Domain Distribution</CardTitle>
            <CardDescription>
              Distribution of problem statements across different domains
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.domainDistribution.map((domain) => (
                <div key={domain._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{domain._id}</p>
                    <p className="text-sm text-gray-500">{domain.count} problems</p>
                  </div>
                  <Badge variant="secondary">{domain.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Difficulty Distribution */}
      {stats?.difficultyDistribution && stats.difficultyDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Difficulty Distribution</CardTitle>
            <CardDescription>
              Distribution of problem statements by difficulty level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {stats.difficultyDistribution.map((difficulty) => (
                <div key={difficulty._id} className="flex-1 text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold mb-2">{difficulty.count}</div>
                  <Badge 
                    variant={
                      difficulty._id === 'Beginner' ? 'default' :
                      difficulty._id === 'Intermediate' ? 'secondary' : 'destructive'
                    }
                  >
                    {difficulty._id}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Problem List */}
      <ProblemList
        onEdit={handleEdit}
        onCreate={handleCreate}
        onBulkUpload={handleBulkUpload}
      />
    </div>
  );
}
